from fastapi import Depends
from fastapi.security.oauth2 import OAuth2PasswordRequestForm, OAuth2PasswordBearer
from typing import Annotated
from sqlalchemy.ext.asyncio import AsyncSession
from core.database import get_session
from schemas.user import UserResponse
from core.exceptions import InvalidCredentialsError
from core.security import decode_token

oauth2_bearer = OAuth2PasswordBearer(tokenUrl='/auth/login')

def get_current_user(token: Annotated[str, Depends(oauth2_bearer)]):
    current_user = decode_token(token)

    if not current_user.token_type == 'access':
        raise InvalidCredentialsError
    
    return current_user

db_dep = Annotated[AsyncSession, Depends(get_session)]
form_dep = Annotated[OAuth2PasswordRequestForm, Depends()]
user_dep = Annotated[UserResponse, Depends(get_current_user)]