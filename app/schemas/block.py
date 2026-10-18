from __future__ import annotations

from datetime import datetime
from typing import Any, Literal
from pydantic import BaseModel, Field

from app.schemas.common.base import AuditFields, ORMModel


class Param(BaseModel):
    name: str
    type: str = ""
    default: str = ""


class BlockBase(BaseModel):
    name: str
    category: str = "LAYER"
    modality: str = "All"
    registry_name: str | None = None
    description: str | None = None
    footer: str | None = None
    is_builtin: bool = False
    stars_count: int = 0
    usage_count: int = 0


class BlockCreate(BlockBase):
    code: str
    file_name: str = "module.py"
    base_class: str = "torch.nn.Module"
    version: str = "v1"
    inputs: list[str] = Field(default_factory=list)
    outputs: list[str] = Field(default_factory=list)
    params: list[Param] = Field(default_factory=list)
    replace_existing: bool = False
    existing_block_id: int | None = None


class BlockVersionDto(ORMModel):
    id: int
    block_id: int
    version: int
    version_label: str = "v1"
    code: str
    params: list[dict[str, Any]] | None = None
    inputs: list[str] | None = None
    outputs: list[str] | None = None
    validated_at: datetime | None = None


class BlockDto(ORMModel, BlockBase, AuditFields):
    id: int
    version: str = "v1"
    inputs: list[str] = Field(default_factory=list)
    outputs: list[str] = Field(default_factory=list)
    latest_code: str | None = None
    user_id: int | None = None


class BlockFilter(BaseModel):
    q: str | None = None
    category: str | None = None
    kind: str | None = None  # alias for category
    modality: str | None = None
    sort: Literal["name", "newest", "default"] = "default"
    all: bool = False


class CodeUploadRequest(BaseModel):
    code: str
    file_name: str = "custom_module.py"


class BlockParsedResponse(BaseModel):
    name: str
    registry_name: str
    category: str
    base_class: str
    modality: str
    docstring: str = ""
    params: list[dict[str, str]] = Field(default_factory=list)
    inputs: list[str] = Field(default_factory=list)
    outputs: list[str] = Field(default_factory=list)
    file_name: str
    version: str = "v1"
    footer: str = ""
