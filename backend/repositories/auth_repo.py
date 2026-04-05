from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.exc import IntegrityError
from sqlalchemy import select
from backend.models.db_tables import Person
from backend.core.exceptions import PersonExists

async def create_user(session: AsyncSession, person: Person):
    session.add(person)
    try: 
        await session.commit()
    except IntegrityError:
        raise PersonExists
    
async def get_person_by_email(session: AsyncSession, filters: dict):
    query = (select(Person).filter_by(**filters))
    person = await session.execute(query)

    return person.scalar_one_or_none()