from sqlalchemy.ext.asyncio import AsyncSession
from models.db_tables import VaultItem

async def create_item(session: AsyncSession, vault_item: VaultItem):
    session.add(vault_item)
    await session.commit()