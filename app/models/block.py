from datetime import datetime

from sqlalchemy import ForeignKey, String, Text, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.postgresql import JSONB
from .base import Base, AuditFields

class Block(Base,AuditFields):
    __tablename__ = "block"
    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(255))
    registry_name: Mapped[str] = mapped_column(String(255))
    type: Mapped[str] = mapped_column(String(255))
    modality: Mapped[str | None] = mapped_column(String(255))

    versions: Mapped[list["BlockVersion"]] = relationship(back_populates="block")

class BlockVersion(Base):
    __tablename__ = "block_version"
    __table_args__ = (UniqueConstraint("block_id", "version"),)
    id: Mapped[int] = mapped_column(primary_key=True)
    block_id: Mapped[int] = mapped_column(ForeignKey("block.id"))
    version: Mapped[int]
    code: Mapped[str] = mapped_column(Text)
    params: Mapped[list | None] = mapped_column(JSONB)
    inputs: Mapped[list | None] = mapped_column(JSONB)
    outputs: Mapped[list | None] = mapped_column(JSONB)
    validated_at: Mapped[datetime | None] = mapped_column(default=None)
    create_date: Mapped[datetime | None] = mapped_column(default=None)
    create_by: Mapped[str | None] = mapped_column(String(255), default=None)

    block: Mapped["Block"] = relationship(back_populates="versions")
