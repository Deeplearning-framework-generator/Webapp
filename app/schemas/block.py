from typing import Literal

from pydantic import BaseModel, ConfigDict, Field
from datetime import datetime

from app.schemas.common.base import AuditFields, ORMModel


class BlockBase(BaseModel):
    name: str
    kind: str
    description: str = ""
    # TODO: consider user request for their block to remain private 
    # visibility: Visibility = Visibility

class BlockCreate(BlockBase):
    source: str = Field(max_length=200_000)

class BlockDto(ORMModel, BlockBase, AuditFields):
    id: int
class BlockFilter(BaseModel):
    q: str | None = None
    kind: str | None = None
    sort: Literal["name", "newest"] = "newest"


