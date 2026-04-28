"""
Specter OSINT Engine v5.0 — Clean Rebuild
All scraping uses Playwright Stealth. Zero Instaloader.
"""
import os
import re
import asyncio
import subprocess
from datetime import datetime
from typing import Optional

from fastapi import FastAPI, HTTPException, Header, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from sqlalchemy.orm import Session

import models
from database import SessionLocal, engine, get_db
import scraper

# ── Create DB tables ──
models.Base.metadata.create_all(bind=engine)

# ── App ──
app = FastAPI(title="Specter OSINT Engine", version="5.0.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Schemas ──
class LoginRequest(BaseModel):
    username: str
    password: str = ""

class TargetCreate(BaseModel):
    username: str


# ═══════════════════════════════════════
#  AUTH ENDPOINTS
# ═══════════════════════════════════════

@app.get("/")
async def root():
    return {"status": "ONLINE", "version": "5.0.0", "engine": "Playwright Stealth"}


@app.post("/auth/login")
async def login(request: LoginRequest, db: Session = Depends(get_db)):
    """Zero-fail login. Always lets the user in."""
    try:
        agent = db.query(models.Agent).filter(models.Agent.ig_username == request.username).first()
        if not agent:
            agent = models.Agent(ig_username=request.username)
            db.add(agent)
            db.commit()
            db.refresh(agent)
        return {"status": "success", "username": agent.ig_username, "agent_id": agent.id}
    except Exception:
        return {"status": "success", "username": request.username, "agent_id": 1}


@app.get("/auth/status")
async def auth_status(x_agent_id: Optional[int] = Header(None), db: Session = Depends(get_db)):
    if not x_agent_id:
        raise HTTPException(status_code=401, detail="No Agent ID")
    agent = db.query(models.Agent).filter(models.Agent.id == x_agent_id).first()
    if not agent:
        raise HTTPException(status_code=401, detail="Invalid Agent")
    return {"status": "authenticated", "agent_id": agent.id}


@app.get("/auth/browser_login")
async def browser_login():
    """Launch a headful browser for one-time manual Instagram login."""
    login_script = os.path.join(os.path.dirname(__file__), "temp_login.py")
    subprocess.Popen(["python", login_script])
    return {"status": "success", "message": "Browser launched. Log in to Instagram and close the window."}


# ═══════════════════════════════════════
#  TARGET MANAGEMENT
# ═══════════════════════════════════════

@app.post("/targets")
async def add_target(target: TargetCreate, x_agent_id: int = Header(...), db: Session = Depends(get_db)):
    username = target.username.strip().lower().replace("@", "")

    # Check duplicate
    existing = db.query(models.Target).filter(
        models.Target.agent_id == x_agent_id,
        models.Target.username == username
    ).first()
    if existing:
        return {"status": "already_exists", "username": username}

    # Scrape real profile data
    profile_data = await scraper.scrape_profile(username)

    if "error" in profile_data and profile_data["error"] == "USER_NOT_FOUND":
        raise HTTPException(status_code=404, detail=f"User @{username} not found on Instagram.")

    db_target = models.Target(
        agent_id=x_agent_id,
        username=username,
        is_private=profile_data.get("is_private", False),
        status="Tracking",
    )
    db.add(db_target)
    db.commit()
    db.refresh(db_target)

    history = models.FollowerHistory(
        target_id=db_target.id,
        follower_count=profile_data.get("followers", 0),
        following_count=profile_data.get("following", 0),
    )
    db.add(history)
    db.commit()

    print(f"[ENGINE] Target @{username} added: {profile_data.get('followers', 0)} followers")
    return {"status": "success", "username": username, "followers": profile_data.get("followers", 0)}


@app.get("/targets")
async def get_targets(refresh: bool = False, x_agent_id: int = Header(...), db: Session = Depends(get_db)):
    if refresh:
        print(f"[ENGINE] Stealth refresh triggered for agent {x_agent_id}")
        tracked = db.query(models.Target).filter(
            models.Target.agent_id == x_agent_id,
            models.Target.status == "Tracking"
        ).all()
        for t in tracked:
            try:
                data = await scraper.scrape_profile(t.username)
                if "error" in data:
                    print(f"[ENGINE] Skip {t.username}: {data.get('error')}")
                    continue
                new_h = models.FollowerHistory(
                    target_id=t.id,
                    follower_count=data["followers"],
                    following_count=data["following"],
                    timestamp=datetime.utcnow(),
                )
                db.add(new_h)
                db.commit()
                print(f"[ENGINE] Refreshed @{t.username}: {data['followers']} followers")
            except Exception as e:
                print(f"[ENGINE] Refresh error for @{t.username}: {e}")

    # Build response
    targets = db.query(models.Target).filter(models.Target.agent_id == x_agent_id).all()
    result = []
    for t in targets:
        history = (
            db.query(models.FollowerHistory)
            .filter(models.FollowerHistory.target_id == t.id)
            .order_by(models.FollowerHistory.timestamp.asc())
            .all()
        )
        latest = history[-1] if history else None
        first = history[0] if history else None

        # Compute delta
        added = 0
        removed = 0
        if len(history) >= 2:
            prev = history[-2]
            diff = (latest.follower_count if latest else 0) - prev.follower_count
            if diff > 0:
                added = diff
            elif diff < 0:
                removed = abs(diff)

        # Build sparkline data (last 10 entries)
        sparkline = [h.follower_count for h in history[-10:]]

        result.append({
            "id": t.id,
            "username": t.username,
            "is_private": t.is_private,
            "status": t.status,
            "followers": latest.follower_count if latest else 0,
            "following": latest.following_count if latest else 0,
            "added": added,
            "removed": removed,
            "sparkline": sparkline,
            "created_at": str(t.created_at) if t.created_at else "",
            "last_updated": str(latest.timestamp) if latest else "",
            "logs": [],
        })

    return result


@app.delete("/targets/{target_id}")
async def remove_target(target_id: int, x_agent_id: int = Header(...), db: Session = Depends(get_db)):
    target = db.query(models.Target).filter(
        models.Target.id == target_id,
        models.Target.agent_id == x_agent_id
    ).first()
    if not target:
        raise HTTPException(status_code=404, detail="Target not found")
    db.delete(target)
    db.commit()
    return {"status": "deleted"}


# ═══════════════════════════════════════
#  OSINT SEARCH
# ═══════════════════════════════════════

@app.get("/resolve")
async def resolve_pattern(pattern: str):
    """Search for Instagram usernames matching a pattern."""
    clean = pattern.strip().replace(" ", "").lower()

    # Generate variations
    variations = list(set([
        clean,
        pattern.replace(" ", "."),
        pattern.replace(" ", "_"),
        clean + "official",
        "the" + clean,
        clean + "_",
        "_" + clean,
        clean.replace("_", "."),
        clean.replace(".", "_"),
    ]))

    results = []
    for v in variations:
        if len(v) < 3:
            continue
        try:
            data = await scraper.scrape_profile(v)
            if "error" not in data and data.get("followers", 0) > 0:
                results.append({
                    "username": v,
                    "followers": data["followers"],
                    "following": data["following"],
                    "is_private": data["is_private"],
                    "confidence": 95.0,
                })
        except Exception:
            continue
        if len(results) >= 5:
            break

    if not results:
        return [{"username": clean, "followers": 0, "following": 0, "is_private": False, "confidence": 10.0}]

    return results


# ═══════════════════════════════════════
#  PROFILE INTEL
# ═══════════════════════════════════════

@app.get("/target/{username}")
async def get_target_intel(username: str):
    data = await scraper.scrape_profile(username)
    if "error" in data and data["error"] == "USER_NOT_FOUND":
        raise HTTPException(status_code=404, detail="User not found")
    return {
        "username": username,
        "followers": data.get("followers", 0),
        "following": data.get("following", 0),
        "is_private": data.get("is_private", False),
    }


# ═══════════════════════════════════════
#  STARTUP
# ═══════════════════════════════════════

if __name__ == "__main__":
    import uvicorn
    print("=" * 50)
    print("  SPECTER OSINT ENGINE v5.0 -- STEALTH MODE")
    print("  All scraping powered by Playwright Browser")
    print("=" * 50)
    uvicorn.run(app, host="0.0.0.0", port=8080)
