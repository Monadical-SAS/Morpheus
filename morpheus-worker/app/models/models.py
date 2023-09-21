import uuid

from app.settings.database import Base
from sqlalchemy import Column, String, ARRAY, DateTime, Enum
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func


class BaseModel(Base):
    __abstract__ = True

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())


class Generation(BaseModel):
    __tablename__ = "generation"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    results = Column(ARRAY(String), nullable=True)
    status = Column(
        Enum("PENDING", "COMPLETED", "FAILED", name="generation_status"),
        nullable=False,
        default="PENDING"
    )
