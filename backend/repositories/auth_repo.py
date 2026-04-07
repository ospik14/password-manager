from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.exc import IntegrityError
from models.db_tables import User
from core.exceptions import UserExists

async def create_user(session: AsyncSession, user: User):
    session.add(user)
    try: 
        await session.commit()
    except IntegrityError:
        raise UserExists
    