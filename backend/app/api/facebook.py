# backend/app/api/facebook.py

import os
import httpx
from fastapi import APIRouter, HTTPException

router = APIRouter()

FB_ACCESS_TOKEN = os.getenv("FB_ACCESS_TOKEN")
FB_AD_ACCOUNT_ID = os.getenv("FB_AD_ACCOUNT_ID") 

@router.get("/fb-insights")
async def get_fb_insights():
    if not FB_ACCESS_TOKEN or not FB_AD_ACCOUNT_ID:
        raise HTTPException(status_code=500, detail="Missing FB access token or ad account ID")

    url = f"https://graph.facebook.com/v17.0/{FB_AD_ACCOUNT_ID}/insights"
    params = {
        "fields": "campaign_name,clicks,impressions,ctr,spend",
        "access_token": FB_ACCESS_TOKEN
    }

    async with httpx.AsyncClient() as client:
        resp = await client.get(url, params=params)
        if resp.status_code != 200:
            raise HTTPException(status_code=resp.status_code, detail=resp.json())
        return resp.json()
