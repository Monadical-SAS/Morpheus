import uuid

from sqlalchemy import Boolean, Column, String, ARRAY
from sqlalchemy.dialects.postgresql import UUID

from app.settings.database import Base


class Generation(Base):
    __tablename__ = "generation"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    images = Column(ARRAY(String), nullable=True)
    failed = Column(Boolean, nullable=False, default=False)
