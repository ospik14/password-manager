from passlib.context import CryptContext
from fastapi.concurrency import run_in_threadpool

crypto_context = CryptContext(schemes=['argon2'], deprecated='auto')

def sync_hash_password(password: str):
    return crypto_context.hash(password)

async def hash_password(password: str):
    return await run_in_threadpool(sync_hash_password, password)