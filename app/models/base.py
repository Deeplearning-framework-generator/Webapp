from datetime import datetime

from sqlalchemy import String
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column

class Base(DeclarativeBase):
    pass

class BaseEntity:
    create_date: Mapped[datetime | None] = mapped_column(default=None)
    create_by: Mapped[str | None] = mapped_column(String(255), default=None)
    update_date: Mapped[datetime | None] = mapped_column(default=None)
    update_by: Mapped[str | None] = mapped_column(String(255), default=None)
    delete_date: Mapped[datetime | None] = mapped_column(default=None)
    delete_by: Mapped[str | None] = mapped_column(String(255), default=None)