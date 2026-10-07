
from typing import Annotated

from fastapi import Depends

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

    def get_type_dtos(self) -> list[TypeDto]:
        return self.type_repo.get_all_dto()
        
