from pydantic import BaseModel, Field
from typing import Generic, TypeVar
import math

T = TypeVar("T")

class PageItem(BaseModel):
    number: int
    current: bool

class PageParams(BaseModel):
    current_page: int = Field(1, ge=1)
    page_size: int = Field(20)
    max_page: int = Field(5)

    @property
    def offset(self) -> int:
        return (self.current_page - 1) * self.page_size

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
        total_pages = math.ceil(total / params.page_size)
        block = math.ceil(params.current_page / params.max_page)
        start = (block - 1) * params.max_page + 1
        end = min(start + params.max_page -1, total_pages)

        return cls(
            data = data,
            page_items = [PageItem(number=n, current = (n == params.current_page)) for n in range(start, end + 1)],
            current_page = params.current_page,
            page_size = params.page_size,
            total_pages = total_pages,
            total_items = total,
            prev_block_page = start - 1 if start > 1 else None,
            next_block_page = end + 1 if end < total_pages else None

        )





