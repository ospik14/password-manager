from datetime import datetime, timedelta, timezone
from sqlalchemy.ext.asyncio import AsyncSession
from core.security import create_token, hash_password
from models.db_tables import RefreshToken
from repositories.auth_repo import save_refresh_token
from schemas.token import TokenBase


async def get_payload(user_id: str, token_type: str, expires_time: timedelta):
    current_time = datetime.now(timezone.utc)
    expires_at = current_time + expires_time
    payload = {
        'sub': user_id,
        'type': token_type,
        'exp': expires_at
    }

    return payload

async def get_tokens(session: AsyncSession, user_id: str):
    access_payload = await get_payload(user_id, 'access', timedelta(minutes=20))
    refresh_payload = await get_payload(user_id, 'refresh', timedelta(days=30))
    
    access_token = create_token(access_payload)
    refresh_token = create_token(refresh_payload)

    exp_at = datetime.fromtimestamp(refresh_payload.get('exp'), tz=timezone.utc)
    refresh_data = RefreshToken(
        user_id = user_id,
        token = await hash_password(refresh_token),
        expires_at = exp_at
    )
    await save_refresh_token(session, refresh_data)

    return TokenBase(
        access_token=access_token,
        refresh_token=refresh_token
    )