import uuid
from datetime import datetime, timedelta, timezone
from sqlalchemy.ext.asyncio import AsyncSession
from repositories.auth_repo import create_user, save_refresh_token
from schemas.user import UserRequest
from schemas.token import TokenBase
from models.db_tables import User, RefreshToken
from core.security import hash_password, create_token

async def register_user(session: AsyncSession, user_request: UserRequest):
    user_id = str(uuid.uuid4())
    user = User(
        id=user_id,
        email=user_request.email,
        master_password_hash= await hash_password(user_request.password)
    )
    await create_user(session, user)

    current_time = datetime.now(timezone.utc)
    expires_time = current_time + timedelta(minutes=20)
    payload = {
        'sub': user_id,
        'type': 'access',
        'exp': expires_time
    }
    access_token = create_token(payload)

    expires_time = current_time + timedelta(days=30)
    payload.update({'type': 'refresh'})
    payload.update({'exp': expires_time})

    refresh_token = create_token(payload)

    refresh_data = RefreshToken(
        user_id = user_id,
        token = await hash_password(refresh_token),
        expires_at = expires_time
    )
    await save_refresh_token(session, refresh_data)

    return TokenBase(
        access_token=access_token,
        refresh_token=refresh_token
    )
    