from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from models.db_tables import User, RefreshToken
from core.exceptions import UserExists

async def create_user(session: AsyncSession, user: User):
    session.add(user)
    try: 
        await session.commit()
    except IntegrityError:
        session.rollback()
        raise UserExists
    
async def save_refresh_token(session: AsyncSession, token: RefreshToken):
    session.add(token)
    await session.commit()
    
async def get_user_by_email(session: AsyncSession, email: str):
    query = (select(User).where(User.email == email))
    user = await session.execute(query)

    return user.scalar_one_or_none()
