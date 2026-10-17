from __future__ import annotations

from datetime import datetime

from sqlalchemy import ForeignKey, Integer, String, Text, UniqueConstraint
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.types import JSON

from .base import AuditFields, Base


class Block(Base, AuditFields):
    __tablename__ = "block"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    registry_name: Mapped[str] = mapped_column(String(255), nullable=False)  # registry name or file name
    type: Mapped[str] = mapped_column(String(255), nullable=False)  # type or base class name (e.g. nn.Module, LAYER, DATA, etc.)
    modality: Mapped[str | None] = mapped_column(String(255), nullable=True)  # Image, Audio, Text, All, etc.

    versions: Mapped[list["BlockVersion"]] = relationship(
        back_populates="block", cascade="all, delete-orphan", order_by="desc(BlockVersion.version)"
    )


class BlockVersion(Base):
    __tablename__ = "block_version"
    __table_args__ = (UniqueConstraint("block_id", "version", name="uq_block_version"),)

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    block_id: Mapped[int] = mapped_column(Integer, ForeignKey("block.id", ondelete="CASCADE"), nullable=False)
    version: Mapped[int] = mapped_column(Integer, nullable=False)
    code: Mapped[str] = mapped_column(Text, nullable=False)
    params: Mapped[list | None] = mapped_column(JSON().with_variant(JSONB, "postgresql"), default=list)
    inputs: Mapped[list | None] = mapped_column(JSON().with_variant(JSONB, "postgresql"), default=list)
    outputs: Mapped[list | None] = mapped_column(JSON().with_variant(JSONB, "postgresql"), default=list)
    validated_at: Mapped[datetime | None] = mapped_column(default=None)
    create_date: Mapped[datetime | None] = mapped_column(default=None)
    create_by: Mapped[str | None] = mapped_column(String(255), default=None)

    block: Mapped["Block"] = relationship(back_populates="versions")
