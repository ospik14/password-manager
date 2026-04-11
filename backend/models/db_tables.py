from datetime import datetime
from sqlalchemy import ForeignKey, String, LargeBinary, DateTime, func
from core.database import Base
from sqlalchemy.orm import Mapped, mapped_column

class User(Base):
    __tablename__='users'

    id: Mapped[str] = mapped_column(primary_key=True)
    email: Mapped[str] = mapped_column(String(254), unique=True)
    master_password_hash: Mapped[str] 
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

class VaultItem(Base):
    __tablename__='vault_items'

    id: Mapped[str] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey('users.id', ondelete='CASCADE'))
    title: Mapped[str] = mapped_column(String(100))
    encrypted_login: Mapped[bytes] = mapped_column(LargeBinary)
    encrypted_password: Mapped[bytes] = mapped_column(LargeBinary)
    url: Mapped[str | None] = mapped_column(default=None)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())


class RefreshToken(Base):
    __tablename__="refresh_tokens"

    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey('users.id', ondelete='CASCADE'))
    token: Mapped[str]
    expires_at: Mapped[datetime] = mapped_column(DateTime(timezone=True))
