from app.repositories.base import BaseRepository


class BlockRepository(BaseRepository[Block]):
    def __init__(self, db, model):
        super().__init__(db, model)