from fastapi import Depends
from typing import Annotated
from sqlalchemy.ext.asyncio import AsyncSession
from backend.core.database import get_session

db_dep = Annotated[AsyncSession, Depends(get_session)]