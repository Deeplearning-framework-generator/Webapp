from sqlalchemy import String
from sqlalchemy.orm import Mapped, mapped_column

from app.models.base import AuditFields, Base


class Type(Base, AuditFields):
    __tablename__ = "type"

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(255), unique=True, nullable=False)
    code: Mapped[str] = mapped_column(String(255))