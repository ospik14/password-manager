from sqlalchemy.ext.asyncio import AsyncSession
from schemas.token import TokenPayload
from schemas.vaultIiem import VaultItemRequest

async def process_new_item(
    session: AsyncSession, 
    item: VaultItemRequest, 
    current_payload: TokenPayload
):
    return