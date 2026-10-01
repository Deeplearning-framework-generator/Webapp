from typing import Annotated

from fastapi import APIRouter, Depends, Query

from app.schemas.block import BlockDto, BlockFilter
from app.schemas.common.page import PageParams, PageWrapper
from app.services import block_service

router = APIRouter(prefix="/blocks", tags=["blocks"])

@router.get("/ping")
def ping():
    return {
        "ok" : True
    }

@router.get("", response_model=PageWrapper[BlockDto])
def get_block_list(
    filters: Annotated[BlockFilter, Query()],
    params: Annotated[PageParams, Query()],
    service: Annotated[block_service.BlockService, Depends(get_block_service)]
):
    block_service = block_service.BlockService()
    