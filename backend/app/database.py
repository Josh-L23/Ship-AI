from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from sqlalchemy.orm import DeclarativeBase

from app.config import settings


def _normalize_database_url(raw_url: str) -> str:
    url = raw_url.strip()
    if url.startswith("postgresql://"):
        return url.replace("postgresql://", "postgresql+asyncpg://", 1)
    return url


_is_sqlite = "sqlite" in settings.database_url

engine = create_async_engine(
    _normalize_database_url(settings.database_url),
    echo=False,
    pool_pre_ping=True,
    **({} if _is_sqlite else {"pool_size": 5, "max_overflow": 10}),
)
async_session = async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)


class Base(DeclarativeBase):
    pass


async def init_db():
    if _is_sqlite:
        async with engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)


async def get_session() -> AsyncSession:
    async with async_session() as session:
        yield session
