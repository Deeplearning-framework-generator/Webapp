from typing import Generic, TypeVar
from sqlalchemy import select, or_
from sqlalchemy.orm import Session

ModelT = TypeVar("ModelT")

class BaseRepository(Generic[ModelT]):
    def __init__(self, db: Session, model: type[ModelT]):
        self.db = db
        self.model = model

    def get(self, id: int) -> ModelT | None:
        return self.db.get(self.model, id)

    def list(self, offset: int = 0, limit: int = 20) -> list[ModelT]:
        return list(self.db.scalars(select(self.model).offset(offset).limit(limit)))

    def add(self, obj: ModelT) -> ModelT:
        self.db.add(obj)
        self.db.flush()
        return obj

    def delete(self, obj: ModelT) -> None:
        self.db.delete(obj)
