from datetime import datetime

from pydantic import BaseModel, ConfigDict

class ORMModel(BaseModel):
    model_config = ConfigDict(from_attributes=True)

class AuditFields(BaseModel): 
    create_date: datetime | None = None
    create_by: str | None = None
    update_date: datetime | None = None
    update_by: str | None = None
    delete_date: datetime | None = None
    delete_by: str | None = None