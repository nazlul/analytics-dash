import os
import httpx
from fastapi import APIRouter, HTTPException, Query

router = APIRouter()

# 🔁 Always use mock for demo (force it)
USE_MOCK = True

FB_ACCESS_TOKEN = os.getenv("FB_ACCESS_TOKEN")
FB_AD_ACCOUNT_ID = os.getenv("FB_AD_ACCOUNT_ID")

VALID_METRICS = {"clicks", "impressions", "cpc", "ctr"}


mock_monthly_data = [
    {
        "date": "2026-04-01",
        "campaign": "Campaign A",
        "publisher_platform": "facebook",
        "metric_value": 1200
    },
    {
        "date": "2026-04-02",
        "campaign": "Campaign B",
        "publisher_platform": "instagram",
        "metric_value": 900
    },
]

mock_all_time_data = {
    "limit": 100,
    "data": [
        {
            "campaign": "Campaign A",
            "date": "2026-04-01",
            "clicks": 1200,
            "impressions": 5400,
            "cpc": 0.45,
            "ctr": 2.2
        },
        {
            "campaign": "Campaign B",
            "date": "2026-04-02",
            "clicks": 800,
            "impressions": 3000,
            "cpc": 0.50,
            "ctr": 2.6
        }
    ]
}


@router.get("/fb-insights/monthly")
async def get_monthly_insights(
    since: str = Query(...),
    until: str = Query(...),
    metric: str = Query("clicks", regex="^(clicks|impressions|cpc|ctr)$")
):
    return mock_monthly_data



@router.get("/fb-insights/all-time")
async def get_all_time_insights(
    limit: int = Query(100, ge=1, le=500),
):
    return mock_all_time_data