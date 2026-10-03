from pydantic import BaseModel, Field
from typing import Generic, TypeVar
import math

T = TypeVar("T")
PAGE_SIZE = 10
MAX_PAGE = 5


class PageItem(BaseModel):
    number: int
    current: bool

class PageParams(BaseModel):
    current_page: int = Field(1, ge=1)

    @property
    def offset(self) -> int:
        return (self.current_page - 1) * PAGE_SIZE

class PageWrapper(BaseModel, Generic[T]):
    data: list[T]
    page_items: list[PageItem]
    current_page: int
    page_size: int
    total_pages: int
    total_items: int
    prev_block_page: int | None
    next_block_page: int | None

    @classmethod
    def create(cls, params: PageParams, data: list[T], total: int) -> "PageWrapper[T]":
        total_pages = math.ceil(total / PAGE_SIZE)
        block = math.ceil(params.current_page / MAX_PAGE)
        start = (block - 1) * MAX_PAGE + 1
        end = min(start + MAX_PAGE -1, total_pages)

        return cls(
            data = data,
            page_items = [PageItem(number=n, current = (n == params.current_page)) for n in range(start, end + 1)],
            current_page = params.current_page,
            page_size = PAGE_SIZE,
            total_pages = total_pages,
            total_items = total,
            prev_block_page = start - 1 if start > 1 else None,
            next_block_page = end + 1 if end < total_pages else None

        )





