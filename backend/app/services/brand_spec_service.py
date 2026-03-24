import json

from sqlalchemy import select

from app.database import async_session
from app.models import BrandSpec


async def get_brand_spec(project_id: str) -> dict:
    async with async_session() as session:
        record = await session.scalar(
            select(BrandSpec).where(BrandSpec.project_id == project_id)
        )
        if not record:
            return {}
        try:
            return json.loads(record.spec_json or "{}")
        except json.JSONDecodeError:
            return {}


async def save_brand_spec(project_id: str, spec: dict) -> None:
    async with async_session() as session:
        record = await session.scalar(
            select(BrandSpec).where(BrandSpec.project_id == project_id)
        )
        if record:
            record.spec_json = json.dumps(spec)
        else:
            session.add(BrandSpec(project_id=project_id, spec_json=json.dumps(spec)))
        await session.commit()


async def append_canvas_assets(project_id: str, assets: list[dict]) -> None:
    current = await get_brand_spec(project_id)
    existing = current.get("canvasAssets")
    if not isinstance(existing, list):
        existing = []
    current["canvasAssets"] = [*existing, *assets]
    await save_brand_spec(project_id, current)
