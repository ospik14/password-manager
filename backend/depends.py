from fastapi import Depends
from fastapi.security.oauth2 import OAuth2PasswordRequestForm, OAuth2PasswordBearer
from typing import Annotated
from sqlalchemy.ext.asyncio import AsyncSession
from core.database import get_session

oauth2 = OAuth2PasswordBearer(tokenUrl='/auth/login')

db_dep = Annotated[AsyncSession, Depends(get_session)]
form_dep = Annotated[OAuth2PasswordRequestForm, Depends()]