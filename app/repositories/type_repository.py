from typing import Annotated

from fastapi import Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.type import Type
from app.repositories.base import BaseRepository
from app.schemas.type import TypeDto


class TypeRepository(BaseRepository[Type]):
    def __init__(self, db: Annotated[Session, Depends(get_db)]):
            super().__init__(db, Type)
    def get_all_dto(self) -> list[TypeDto]:
        types = super().get_all()
        return [TypeDto.model_validate(type) for type in types]