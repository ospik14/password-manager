import uuid
from sqlalchemy.ext.asyncio import AsyncSession
from repositories.auth_repo import create_user, get_user_by_email
from schemas.user import UserRequest
from models.db_tables import User
from core.security import hash_password, verify_hash
from core.exceptions import InvalidCredentialsError
from services.tokens_se import get_tokens


async def register_user(session: AsyncSession, user_request: UserRequest):
    user_id = str(uuid.uuid4())
    user = User(
        id=user_id,
        email=user_request.email,
        master_password_hash= await hash_password(user_request.password)
    )
    await create_user(session, user)
    tokens = await get_tokens(session, user_id)

    return tokens

    
async def authenticate_user(session: AsyncSession, user_data: UserRequest):
    current_user = await get_user_by_email(session, user_data.email)

    if not current_user:
        raise InvalidCredentialsError()
    
    if not await verify_hash(
        current_user.master_password_hash, 
        user_data.password
    ):
        return InvalidCredentialsError()

    tokens = await get_tokens(session, current_user.id)

    return tokens