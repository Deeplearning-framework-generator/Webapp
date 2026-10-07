from typing import Literal

from pydantic import BaseModel, ConfigDict, Field
from datetime import datetime

from app.schemas.common.base import AuditFields, ORMModel


class TypeBase(BaseModel):
    name: str
    code: str | None = None

class TypeDto(ORMModel, TypeBase, AuditFields):
    id: int


