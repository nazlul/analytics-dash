import os
import httpx
from fastapi import APIRouter, HTTPException, Query
from typing import Optional, List

router = APIRouter()

FB_ACCESS_TOKEN = os.getenv("FB_ACCESS_TOKEN")
FB_AD_ACCOUNT_ID = os.getenv("FB_AD_ACCOUNT_ID")

VALID_METRICS = {"clicks", "impressions", "cpc", "ctr"}

def get_default_publisher_platforms():
    return ["facebook", "instagram", "audience_network", "messenger"]

@router.get("/fb-insights/monthly")
async def get_monthly_insights(
    since: str = Query(..., description="Start date in YYYY-MM-DD"),
    until: str = Query(..., description="End date in YYYY-MM-DD"),
    metric: str = Query("clicks", description="Metric to fetch", regex="^(clicks|impressions|cpc|ctr)$")
):
    """
    Returns daily insights grouped by campaign and publisher platform
    for the given date range and metric.
    """
    if not FB_ACCESS_TOKEN or not FB_AD_ACCOUNT_ID:
        raise HTTPException(status_code=500, detail="Missing FB access token or ad account ID")

    if metric not in VALID_METRICS:
        raise HTTPException(status_code=400, detail=f"Invalid metric: {metric}")

    url = f"https://graph.facebook.com/v23.0/act_{FB_AD_ACCOUNT_ID}/insights"
    params = {
        "fields": f"date_start,campaign_name,clicks,impressions,cpc,ctr",
        "breakdowns": "publisher_platform",
        "time_range": f'{{"since":"{since}","until":"{until}"}}',
        "time_increment": "1",
        "level": "ad",  
        "access_token": FB_ACCESS_TOKEN,
        "limit": 1000, 
    }

    async with httpx.AsyncClient() as client:
        response = await client.get(url, params=params)
        if response.status_code != 200:
            raise HTTPException(status_code=response.status_code, detail=response.json())

        data = response.json().get("data", [])


        results = []
        for item in data:
            results.append({
                "date": item.get("date_start"),
                "campaign": item.get("campaign_name"),
                "publisher_platform": item.get("publisher_platform", "unknown"),
                "metric_value": float(item.get(metric, 0)) if metric in ["cpc", "ctr"] else int(item.get(metric, 0)),
            })

        return results


@router.get("/fb-insights/all-time")
async def get_all_time_insights(
    limit: int = Query(100, ge=1, le=500),
):

    if not FB_ACCESS_TOKEN or not FB_AD_ACCOUNT_ID:
        raise HTTPException(status_code=500, detail="Missing FB access token or ad account ID")

    url = f"https://graph.facebook.com/v18.0/act_{FB_AD_ACCOUNT_ID}/insights"
    params = {
        "fields": "campaign_name,clicks,impressions,cpc,ctr",
        "level": "campaign",
        "access_token": FB_ACCESS_TOKEN,
        "limit": 100, 
        "date_preset": "maximum",
    }

    collected_data = []
    after_cursor = None

    async with httpx.AsyncClient() as client:
        while True:
            if after_cursor:
                params["after"] = after_cursor
            response = await client.get(url, params=params)
            if response.status_code != 200:
                raise HTTPException(status_code=response.status_code, detail=response.json())
            json_data = response.json()
            data = json_data.get("data", [])
            paging = json_data.get("paging", {})
            after_cursor = paging.get("cursors", {}).get("after")

            collected_data.extend(data)

            if not after_cursor or len(collected_data) >= limit:
                break

    collected_data = collected_data[:limit]

    formatted = [
        {
            "campaign": item.get("campaign_name"),
            "date": item.get("date_start"),
            "clicks": int(item.get("clicks", 0)),
            "impressions": int(item.get("impressions", 0)),
            "cpc": float(item.get("cpc", 0)),
            "ctr": float(item.get("ctr", 0)),
        }
        for item in collected_data
        if item.get("campaign_name")
    ]

    return {
        "limit": limit,
        "data": formatted,
    }
