import uuid
from datetime import timedelta
from sqlalchemy.ext.asyncio import AsyncSession
from repositories.auth_repo import create_user
from schemas.user import UserRequest
from models.db_tables import User
from core.security import hash_password, create_access_token

async def register_user(session: AsyncSession, user_request: UserRequest):
    user_id = str(uuid.uuid4())
    user = User(
        id=user_id,
        email=user_request.email,
        master_password_hash= await hash_password(user_request.password)
    )
    await create_user(session, user)

    payload = {
        'sub': user_id,
        'type': 'access'
    }

    access_token = create_access_token(payload, timedelta(minutes=20))
    