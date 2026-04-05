import uuid
from sqlalchemy.ext.asyncio import AsyncSession
from backend.repositories.auth_repo import create_user
from schemas.user import UserRequest
from models.db_tables import User
from core.security import hash_password

async def register_user(session: AsyncSession, user_request: UserRequest):
    user = User(
        id=str(uuid.uuid4()),
        email=user_request.email,
        password= await hash_password(user_request.password)
    )
    await create_user(session, user)
    