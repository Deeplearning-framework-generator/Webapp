from datetime import datetime

from pydantic import BaseModel, ConfigDict

class ORMModel(BaseModel):
    model_config = ConfigDict(from_attributes=True)

class AuditFields(BaseModel): 
    create_date: datetime
    create_by: str
    update_date: datetime
    update_by: str
    delete_date: datetime
    delete_by: str