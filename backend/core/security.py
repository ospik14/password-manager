import os
from dotenv import load_dotenv
from jose import jwt, JWTError
from passlib.context import CryptContext
from fastapi.concurrency import run_in_threadpool
from core.exceptions import InvalidCredentialsError
from schemas.token import TokenPayload

load_dotenv()

ALGORITHM = os.getenv('ALGORITHM')
SECRET_KEY = os. getenv('SECRET_KEY')

crypto_context = CryptContext(schemes=['argon2'], deprecated='auto')

def sync_hash_password(password: str):
    return crypto_context.hash(password)

def sync_verify_hash(original_hash: str, user_hash: str):
    return crypto_context.verify(user_hash, original_hash)

async def hash_password(password: str):
    return await run_in_threadpool(sync_hash_password, password)

async def verify_hash(original_hash: str, user_hash: str):
    return await run_in_threadpool(sync_verify_hash, original_hash, user_hash)

def create_token(payload: dict):
    token = jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)

    return token

def decode_token(token: str):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id = payload.get('sub')
        token_type = payload.get('type')

        if not user_id or not token_type:
            raise JWTError

        return TokenPayload(
            user_id=user_id,
            token_type=token_type
        )
    except JWTError:
        raise InvalidCredentialsError
    
