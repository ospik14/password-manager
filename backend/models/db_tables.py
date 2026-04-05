from datetime import datetime

from sqlalchemy import String, DateTime, func
from backend.core.database import Base
from sqlalchemy.orm import Mapped, mapped_column

class User(Base):
    __tablename__='users'

    id: Mapped[str] = mapped_column(primary_key=True)
    email: Mapped[str] = mapped_column(String(254), unique=True)
    master_password_hash: Mapped[str] 
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
