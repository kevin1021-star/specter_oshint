import instaloader
import os
from http.cookies import SimpleCookie

def force_offline_link():
    print("==========================================")
    print("   SPECTER: OFFLINE SESSION LINKER        ")
    print("==========================================")
    
    username = input("[?] Enter your Instagram username: ").strip().replace("@", "")
    print("\n[!] Paste your FULL 'cookie' header value:")
    raw_cookies = input("[>] ").strip()
    
    if not username or not raw_cookies:
        print("[!] Error: Username and Cookies are required.")
        return

    # Initialize Instaloader WITHOUT any network connection
    L = instaloader.Instaloader()
    L.context.user_agent = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36"
    
    # Parse and set cookies manually
    try:
        cookie_parser = SimpleCookie()
        cookie_parser.load(raw_cookies)
        
        for key, morsel in cookie_parser.items():
            L.context._session.cookies.set(key, morsel.value, domain='.instagram.com')
        
        # FORCE SAVE: We do NOT call test_login(). We just save the file.
        # This prevents the "Wait a few minutes" error from blocking us.
        L.save_session_to_file(filename=username)
        
        print(f"\n[+] FORCE SAVED: Session file created for @{username}.")
        print(f"[+] The engine will now use this 'Golden Session' automatically.")
        print(f"[+] FINAL STEP: Log in to the Specter dashboard as '{username}'.")
    except Exception as e:
        print(f"[!] Error creating file: {e}")

if __name__ == "__main__":
    force_offline_link()
