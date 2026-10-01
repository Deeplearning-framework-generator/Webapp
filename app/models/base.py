from datetime import datetime

from sqlalchemy.orm import DeclarativeBase

class Base(DeclarativeBase):
    pass
class BaseEntity(DeclarativeBase):
    create_date: datetime
    create_by: str
    update_date: datetime
    update_by: str
    delete_date: datetime
    delete_by: str