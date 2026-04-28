"""
Specter OSINT Stealth Scraper v5.0
Uses Playwright with persistent browser profile for undetectable scraping.
"""
import asyncio
import os
import json
import random
import re
from playwright.async_api import async_playwright

PROFILE_DIR = os.path.join(os.path.dirname(__file__), "specter_browser_profile").replace("\\", "/")

# Lock to prevent multiple browser instances from fighting over the profile
_browser_lock = asyncio.Lock()


async def scrape_profile(username: str) -> dict:
    """Scrape an Instagram profile using the stealth browser."""
    async with _browser_lock:
        try:
            async with async_playwright() as p:
                context = await p.chromium.launch_persistent_context(
                    PROFILE_DIR,
                    headless=True,
                    args=[
                        "--disable-blink-features=AutomationControlled",
                        "--no-sandbox",
                    ],
                )
                page = await context.new_page()

                url = f"https://www.instagram.com/{username}/"
                print(f"[SCRAPER] Navigating to {url}")
                await page.goto(url, wait_until="domcontentloaded", timeout=30000)
                await asyncio.sleep(random.uniform(2, 4))

                # Check for login wall
                current_url = page.url
                if "login" in current_url or "accounts/login" in current_url:
                    print("[SCRAPER] Hit login wall! Session expired.")
                    await page.screenshot(path="debug_login_wall.png")
                    await context.close()
                    return {"error": "LOGIN_REQUIRED", "followers": 0, "following": 0, "is_private": False}

                # Strategy 1: Extract from meta description
                # Format: "X Followers, Y Following, Z Posts - See Instagram photos..."
                meta_content = await page.evaluate('''() => {
                    const meta = document.querySelector('meta[name="description"]');
                    return meta ? meta.getAttribute('content') : '';
                }''')

                followers = 0
                following = 0
                is_private = False

                if meta_content:
                    print(f"[SCRAPER] Meta content: {meta_content[:100]}")
                    # Parse follower/following counts
                    match = re.search(r'([\d,.KMkm]+)\s*Followers?,\s*([\d,.KMkm]+)\s*Following', meta_content)
                    if match:
                        followers = _parse_count(match.group(1))
                        following = _parse_count(match.group(2))

                # Strategy 2: Extract from page source if meta failed
                if followers == 0:
                    page_text = await page.evaluate('() => document.body.innerText')
                    # Look for "X followers" pattern in page text
                    f_match = re.search(r'([\d,.KMkm]+)\s*followers', page_text, re.IGNORECASE)
                    fw_match = re.search(r'([\d,.KMkm]+)\s*following', page_text, re.IGNORECASE)
                    if f_match:
                        followers = _parse_count(f_match.group(1))
                    if fw_match:
                        following = _parse_count(fw_match.group(1))

                # Strategy 3: Check page title for "Instagram" (404 check)
                title = await page.title()
                if "Page Not Found" in title or "Sorry" in title:
                    await context.close()
                    return {"error": "USER_NOT_FOUND", "followers": 0, "following": 0, "is_private": False}

                # Check if private
                is_private = "This account is private" in (await page.evaluate('() => document.body.innerText'))

                await context.close()

                result = {
                    "followers": followers,
                    "following": following,
                    "is_private": is_private,
                }
                print(f"[SCRAPER] Result for @{username}: {result}")
                return result

        except Exception as e:
            print(f"[SCRAPER] Error scraping @{username}: {e}")
            return {"error": str(e), "followers": 0, "following": 0, "is_private": False}


async def check_profile_exists(username: str) -> bool:
    """Quick check if an Instagram profile exists."""
    result = await scrape_profile(username)
    return "error" not in result or result.get("followers", 0) > 0


def _parse_count(text: str) -> int:
    """Parse Instagram count strings like '1,234', '12.3K', '1.2M'."""
    if not text:
        return 0
    clean = text.strip().replace(",", "").replace(" ", "").lower()
    try:
        if "m" in clean:
            return int(float(clean.replace("m", "")) * 1_000_000)
        if "k" in clean:
            return int(float(clean.replace("k", "")) * 1_000)
        return int(float(clean))
    except (ValueError, TypeError):
        return 0
