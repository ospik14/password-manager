from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update, delete, func
from models.db_tables import VaultItem
from core.exceptions import NotFoundError

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

async def update_item(session: AsyncSession, id: str, user_id: str, data: dict):
    stmt = (
        update(VaultItem)
        .where(
            VaultItem.id == id,
            VaultItem.user_id == user_id
        )
        .values(**data, updated_at = func.now())
        .returning(VaultItem)
    )
    updated_item = await session.execute(stmt)
    await session.commit()

    return updated_item.scalar_one_or_none()

async def delete_item(session: AsyncSession, id: str, user_id: str):
    stmt = (
        delete(VaultItem)
        .where(
            VaultItem.id == id,
            VaultItem.user_id == user_id
        )
    )
    result = await session.execute(stmt)

    if result.rowcount == 0:
        raise NotFoundError
    
    await session.commit()