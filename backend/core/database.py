from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from sqlalchemy.orm import DeclarativeBase

DATABASE_URL = 'postgresql+asyncpg://postgres:password@localhost:5432/test'

engine = create_async_engine(DATABASE_URL, echo=True)

async_session_local = async_sessionmaker(
    autoflush=False, 
    expire_on_commit=False, 
    class_=AsyncSession,
    bind=engine
)

class Base(DeclarativeBase):
    pass

async def get_session():
    async with async_session_local() as session:
        yield session