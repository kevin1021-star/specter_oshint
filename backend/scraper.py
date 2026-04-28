"""
Specter OSINT Stealth Scraper v5.1
Advanced extraction engine with multiple failover strategies.
"""
import asyncio
import os
import json
import random
import re
from playwright.async_api import async_playwright

PROFILE_DIR = os.path.join(os.path.dirname(__file__), "specter_browser_profile").replace("\\", "/")
_browser_lock = asyncio.Lock()

async def scrape_profile(username: str) -> dict:
    async with _browser_lock:
        try:
            async with async_playwright() as p:
                context = await p.chromium.launch_persistent_context(
                    PROFILE_DIR,
                    headless=True,
                    args=["--disable-blink-features=AutomationControlled", "--no-sandbox"],
                )
                page = await context.new_page()
                # Human-like user agent
                await page.set_extra_http_headers({"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36"})

                url = f"https://www.instagram.com/{username}/"
                print(f"[SCRAPER] Scanning: {url}")
                
                response = await page.goto(url, wait_until="networkidle", timeout=45000)
                if response.status == 404:
                    await context.close()
                    return {"error": "USER_NOT_FOUND", "followers": 0, "following": 0, "is_private": False}

                await asyncio.sleep(random.uniform(3, 5))

                # Check for login wall
                if "login" in page.url:
                    print("[SCRAPER] Session expired. Manual login required via temp_login.py")
                    await page.screenshot(path="debug_login_wall.png")
                    await context.close()
                    return {"error": "LOGIN_REQUIRED", "followers": 0, "following": 0, "is_private": False}

                followers = 0
                following = 0
                is_private = False

                # Strategy 1: SharedData JSON (Most accurate)
                try:
                    shared_data = await page.evaluate("() => window._sharedData")
                    if shared_data:
                        user = shared_data.get("entry_data", {}).get("ProfilePage", [{}])[0].get("graphql", {}).get("user", {})
                        if user:
                            followers = user.get("edge_followed_by", {}).get("count", 0)
                            following = user.get("edge_follow", {}).get("count", 0)
                            is_private = user.get("is_private", False)
                except: pass

                # Strategy 2: Meta Tags
                if followers == 0:
                    meta = await page.evaluate('''() => {
                        const m = document.querySelector('meta[name="description"]');
                        return m ? m.getAttribute('content') : '';
                    }''')
                    if meta:
                        # Matches: "1,234 Followers, 567 Following..."
                        f_match = re.search(r'([\d,.KMkm]+)\s*Followers?', meta, re.I)
                        fw_match = re.search(r'([\d,.KMkm]+)\s*Following', meta, re.I)
                        if f_match: followers = _parse_count(f_match.group(1))
                        if fw_match: following = _parse_count(fw_match.group(1))

                # Strategy 3: Visual Elements (Final Fallback)
                if followers == 0:
                    try:
                        # Find the "X followers" list item
                        content = await page.content()
                        is_private = "This account is private" in content
                        
                        f_text = await page.evaluate('''() => {
                            const links = Array.from(document.querySelectorAll('a'));
                            const f = links.find(l => l.innerText.includes('followers'));
                            return f ? f.innerText : '';
                        }''')
                        if f_text:
                            followers = _parse_count(f_text.split(' ')[0])
                    except: pass

                await context.close()
                result = {"followers": followers, "following": following, "is_private": is_private}
                print(f"[SCRAPER] Success: {result}")
                return result

        except Exception as e:
            print(f"[SCRAPER] Critical Error: {e}")
            return {"error": str(e), "followers": 0, "following": 0, "is_private": False}

def _parse_count(text: str) -> int:
    if not text: return 0
    clean = text.strip().replace(",", "").replace(" ", "").lower()
    try:
        if "m" in clean: return int(float(clean.replace("m", "")) * 1_000_000)
        if "k" in clean: return int(float(clean.replace("k", "")) * 1_000)
        return int(re.sub(r'[^0-9]', '', clean))
    except: return 0
