from typing import Literal

from pydantic import BaseModel, ConfigDict, Field
from datetime import datetime

from app.schemas.common.base import AuditFields, ORMModel


class BlockBase(BaseModel):
    name: str
    base: str
    # TODO: consider user request for their block to remain private 
    # visibility: Visibility = Visibility
class Param(BaseModel):
    name: str
    type: str = ""
    default: str = ""
class BlockCreate(BlockBase):
    registry_name: str
    file_name: str
    code: str
    params: list[Param] = []

class BlockDto(ORMModel, BlockBase, AuditFields):
    id: int
class BlockFilter(BaseModel):
    q: str | None = None
    kind: str | None = None
    sort: Literal["name", "newest"] = "newest"


