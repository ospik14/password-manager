import hashlib
from httpx import AsyncClient
import asyncio


async def check_password_leak(password: str):
    sha1_hash = hashlib.sha1(password.encode('utf-8')).hexdigest().upper()
    prefix = sha1_hash[:5]
    suffix = sha1_hash[5:]

    url = f'https://api.pwnedpasswords.com/range/{prefix}'
    async with AsyncClient() as client:
        response = await client.get(url, headers={'User-Agent': 'VaultAPI-App'})

        if response.status_code != 200:
            return 0
        
        hashes = {
            line.split(':')[0]: line.split(':')[-1]
            for line in response.text.splitlines()
        }
        count = int(hashes.get(suffix)) or 0
        
        return count


