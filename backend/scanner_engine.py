"""
ONYX_CORE: Bug Hunting Scanner Engine v1.0
Orchestrates reconnaissance, discovery, and vulnerability analysis.
"""
import asyncio
import aiohttp
import socket
import re
import dns.resolver
from urllib.parse import urlparse
from datetime import datetime

class OnyxScanner:
    def __init__(self, target: str):
        self.target = target.strip().replace("http://", "").replace("https://", "").split("/")[0]
        self.results = {
            "target": self.target,
            "timestamp": datetime.utcnow().isoformat(),
            "subdomains": [],
            "ports": [],
            "urls": [],
            "tech_stack": {},
            "vulnerabilities": [],
            "logs": []
        }

    def _log(self, message: str):
        print(f"[ONYX] {message}")
        self.results["logs"].append(f"[{datetime.now().strftime('%H:%M:%S')}] {message}")

    async def run_all(self):
        self._log(f"Initializing deep scan for {self.target}...")
        
        # Run modules concurrently
        await asyncio.gather(
            self.find_subdomains(),
            self.scan_ports(),
            self.detect_tech(),
            self.discover_urls(),
            self.check_vulnerabilities()
        )
        
        self._log("Scan complete. Aggregating results.")
        return self.results

    async def find_subdomains(self):
        self._log("Searching for subdomains via crt.sh...")
        try:
            url = f"https://crt.sh/?q=%25.{self.target}&output=json"
            async with aiohttp.ClientSession() as session:
                async with session.get(url, timeout=15) as response:
                    if response.status == 200:
                        data = await response.json()
                        subs = set()
                        for entry in data:
                            name = entry['name_value']
                            if "\n" in name:
                                for n in name.split("\n"):
                                    subs.add(n.strip())
                            else:
                                subs.add(name.strip())
                        
                        # Filter out wildcard and duplicates
                        self.results["subdomains"] = sorted([s for s in subs if "*" not in s])
                        self._log(f"Found {len(self.results['subdomains'])} potential subdomains.")
        except Exception as e:
            self._log(f"Subdomain discovery error: {e}")

    async def scan_ports(self):
        self._log("Performing rapid port scan (Common Ports)...")
        common_ports = [21, 22, 23, 25, 53, 80, 443, 8080, 8443, 3306, 5432, 27017]
        open_ports = []
        
        def check_port(port):
            with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
                s.settimeout(1)
                result = s.connect_ex((self.target, port))
                if result == 0:
                    return port
            return None

        # Using thread pool for socket scanning to avoid blocking
        loop = asyncio.get_event_loop()
        tasks = [loop.run_in_executor(None, check_port, p) for p in common_ports]
        completed = await asyncio.gather(*tasks)
        self.results["ports"] = [p for p in completed if p]
        self._log(f"Open ports found: {self.results['ports']}")

    async def detect_tech(self):
        self._log("Detecting technology stack...")
        try:
            async with aiohttp.ClientSession() as session:
                async with session.get(f"https://{self.target}", timeout=10) as response:
                    headers = response.headers
                    self.results["tech_stack"] = {
                        "Server": headers.get("Server", "Unknown"),
                        "X-Powered-By": headers.get("X-Powered-By", "Unknown"),
                        "X-AspNet-Version": headers.get("X-AspNet-Version", "Unknown"),
                    }
                    # Simple body analysis
                    body = await response.text()
                    if "wp-content" in body: self.results["tech_stack"]["CMS"] = "WordPress"
                    if "react" in body.lower(): self.results["tech_stack"]["Frontend"] = "React"
        except Exception as e:
            self._log(f"Tech detection failed: {e}")

    async def discover_urls(self):
        self._log("Fetching historical URLs from Wayback Machine...")
        try:
            url = f"http://web.archive.org/cdx/search/cdx?url={self.target}/*&output=json&collapse=urlkey&fl=original&limit=100"
            async with aiohttp.ClientSession() as session:
                async with session.get(url, timeout=15) as response:
                    if response.status == 200:
                        data = await response.json()
                        if len(data) > 1:
                            self.results["urls"] = [item[0] for item in data[1:]]
                            self._log(f"Discovered {len(self.results['urls'])} historical URLs.")
        except Exception as e:
            self._log(f"Wayback discovery failed: {e}")

    async def check_vulnerabilities(self):
        self._log("Analyzing security headers and common misconfigurations...")
        try:
            async with aiohttp.ClientSession() as session:
                async with session.get(f"https://{self.target}", timeout=10) as response:
                    headers = response.headers
                    
                    # Security Headers
                    if "Content-Security-Policy" not in headers:
                        self.results["vulnerabilities"].append({"type": "Missing CSP", "severity": "Medium"})
                    if "X-Frame-Options" not in headers:
                        self.results["vulnerabilities"].append({"type": "Missing X-Frame-Options (Clickjacking)", "severity": "Low"})
                    
                    # Check for exposed .git
                    async with session.get(f"https://{self.target}/.git/config", timeout=5) as git_res:
                        if git_res.status == 200:
                            self.results["vulnerabilities"].append({"type": "Exposed .git Repository", "severity": "Critical"})
                            
        except Exception as e:
            self._log(f"Vuln check error: {e}")
