from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from models.db_tables import VaultItem

async def create_item(session: AsyncSession, vault_item: VaultItem):
    session.add(vault_item)
    await session.commit()

async def get_all_items_for_user(session: AsyncSession, user_id: str):
    query = (
        select(VaultItem.id, VaultItem.title)
        .where(VaultItem.user_id == user_id)
    )
    items = await session.execute(query)

    return items.mappings().all()

async def get_item_by_id(session: AsyncSession, id: str, user_id: str):
    query = (
        select(VaultItem)
        .where(
            VaultItem.id == id,
            VaultItem.user_id == user_id
        )
    )
    item = await session.execute(query)

    return item.scalar_one_or_none()