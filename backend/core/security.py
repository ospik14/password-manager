import os
from dotenv import load_dotenv
from jose import jwt
from passlib.context import CryptContext
from fastapi.concurrency import run_in_threadpool
from datetime import datetime, timedelta, timezone
from schemas.token import TokenBase

load_dotenv()

ALGORITHM = os.getenv('ALGORITHM')
SECRET_KEY = os. getenv('SECRET_KEY')

crypto_context = CryptContext(schemes=['argon2'], deprecated='auto')

def sync_hash_password(password: str):
    return crypto_context.hash(password)

async def hash_password(password: str):
    return await run_in_threadpool(sync_hash_password, password)

def create_token(payload: dict, ):
    token = jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)

    return token
    
