
import ast
from typing import Annotated

from fastapi import Depends, HTTPException

from app.api.v1 import block
from app.repositories.block_repository import BlockRepository
from app.repositories.type_repository import TypeRepository
from app.schemas.block import BlockCreate, BlockDto, BlockFilter
from app.schemas.common.page import PAGE_SIZE, PageParams, PageWrapper
from app.schemas.type import TypeDto
from app.utils import provide


class BlockService:
    def __init__(self, 
                 block_repo: Annotated[BlockRepository, Depends(BlockRepository)], 
                 type_repo: Annotated[TypeRepository, Depends(TypeRepository)]
                 ):
        self.block_repo = block_repo
        self.type_repo = type_repo

    def getBlockList(self, block_filters: BlockFilter, page_params: PageParams) -> PageWrapper[BlockDto]:
        count = self.block_repo.count_block_list()
        block_list = []
        if count > 0:
            block_list = self.block_repo.search_block_list(block_filters, page_params.offset, PAGE_SIZE)

        return PageWrapper.create(
            params = page_params,
            data=block_list,
            total=count
        )
    
    def save_block(self, block_create: BlockCreate):
        
        self.block_repo.save(block_create)
    def _check_structure(self, block_create: BlockCreate):
        try:
            tree = ast.parse(block_create.code)
        except SyntaxError as e:
            raise HTTPException(422, f"Syntax error on line {e.lineno}: {e.msg}")

        cls = next(
            (n for n in tree.body if isinstance(n, ast.ClassDef) and n.name == block_create.name),
            None,
        )
        if cls is None:
            raise HTTPException(422, f"No class named {block_create.name} in the code") 

        methods = {n.name for n in cls.body if isinstance(n, ast.FunctionDef)}
        missing = {"__init__", "forward"} - methods
        if missing:
            raise HTTPException(422, f"Missing method(s): {','.join(sorted(missing))}")
        
    def validate_block(self, block_create: BlockCreate):
        self._check_structure(block_create)

        

    def get_type_dtos(self) -> list[TypeDto]:
        return self.type_repo.get_all_dto()
        
