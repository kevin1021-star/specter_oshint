
import asyncio
from playwright.async_api import async_playwright
async def run():
    async with async_playwright() as p:
        context = await p.chromium.launch_persistent_context(
            'C:/Users/AS/.gemini/antigravity/scratch/specter_osint/backend/specter_browser_profile',
            headless=False
        )
        page = await context.new_page()
        await page.goto("https://www.instagram.com/accounts/login/")
        print("Waiting for login... Close the browser window when done.")
        while not context.pages == []:
            await asyncio.sleep(1)
asyncio.run(run())
