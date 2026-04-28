from fastapi import FastAPI, HTTPException, Header, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import asyncio
import uuid
from scanner_engine import OnyxScanner

app = FastAPI(title="ONYX_CORE Bug Hunting Suite")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# In-memory store for active scans (In production, use Redis or a DB)
scans = {}

class ScanRequest(BaseModel):
    target: str

class ScanStatus(BaseModel):
    id: str
    target: str
    status: str
    results: Optional[dict] = None

@app.get("/")
async def health():
    return {"status": "ONLINE", "engine": "ONYX_CORE", "version": "1.0.0"}

@app.post("/scan/start")
async def start_scan(request: ScanRequest):
    scan_id = str(uuid.uuid4())
    target = request.target.strip()
    
    if not target:
        raise HTTPException(status_code=400, detail="Target domain is required")

    # Initialize scan record
    scans[scan_id] = {
        "id": scan_id,
        "target": target,
        "status": "RUNNING",
        "results": None
    }

    # Run scan in background
    asyncio.create_task(run_scan_task(scan_id, target))
    
    return {"scan_id": scan_id, "status": "STARTED", "target": target}

async def run_scan_task(scan_id: str, target: str):
    try:
        scanner = OnyxScanner(target)
        results = await scanner.run_all()
        scans[scan_id]["status"] = "COMPLETED"
        scans[scan_id]["results"] = results
    except Exception as e:
        scans[scan_id]["status"] = "FAILED"
        scans[scan_id]["error"] = str(e)
        print(f"[SCAN_ERROR] {e}")

@app.get("/scan/{scan_id}")
async def get_scan_status(scan_id: str):
    if scan_id not in scans:
        raise HTTPException(status_code=404, detail="Scan not found")
    return scans[scan_id]

@app.get("/scans")
async def list_scans():
    return list(scans.values())

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8080)
