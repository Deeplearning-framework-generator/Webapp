from typing import Annotated

from fastapi import Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.block import Block
from app.repositories.base import BaseRepository


class BlockRepository(BaseRepository[Block]):
    def __init__(self, db: Annotated[Session, Depends(get_db)]):
        super().__init__(db, Block)

    def get(self, id: int) -> Block | None:
        block = super().get(id)
        return block if (block and block.delete_date is None) else None
    