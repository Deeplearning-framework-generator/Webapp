
from typing import Annotated

from fastapi import Depends

from app.repositories.block_repository import BlockRepository
from app.schemas.block import BlockDto, BlockFilter
from app.schemas.common.page import PAGE_SIZE, PageParams, PageWrapper
from app.utils import provide


class BlockService:
    def __init__(self, repo: Annotated[BlockRepository, Depends(provide(BlockRepository))]):
        self.repo = repo
    def getBlockList(self, block_filters: BlockFilter, page_params: PageParams) -> PageWrapper[BlockDto]:
        count = self.repo.count_block_list()
        block_list = []
        if count > 0:
            block_list = self.repo.search_block_list(block_filters, page_params.offset, PAGE_SIZE)

        return PageWrapper.create(
            params = page_params,
            data=block_list,
            total=count
        )
