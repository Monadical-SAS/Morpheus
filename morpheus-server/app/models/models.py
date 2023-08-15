import uuid

from sqlalchemy import Boolean, Column, String, ForeignKey, Integer, Float, Numeric, JSON
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from app.database.database import Base


class User(Base):
    __tablename__ = "user"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email = Column(String(64), unique=True, index=True)
    name = Column(String(64), nullable=True)
    bio = Column(String(512), nullable=True)
    avatar = Column(String(512), nullable=True)
    phone = Column(String(16), nullable=True)
    is_active = Column(Boolean, default=True)
    collections = relationship("Collection", back_populates="owner")
    prompts = relationship("Prompt", back_populates="owner")
    artworks = relationship("ArtWork", back_populates="owner")


class Collection(Base):
    __tablename__ = "collection"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(64), nullable=False)
    description = Column(String(512), nullable=True)
    image = Column(String(512), nullable=True)
    is_active = Column(Boolean, default=True)
    owner_id = Column(UUID(as_uuid=True), ForeignKey("user.id"))
    owner = relationship("User", back_populates="collections")
    artworks = relationship("ArtWork", back_populates="collection")


class Prompt(Base):
    __tablename__ = "prompt"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    prompt = Column(String(2048), nullable=True)
    negative_prompt = Column(String(2048), nullable=True)
    model = Column(String(64), nullable=True)
    sampler = Column(String(64), nullable=True)
    width = Column(Integer, nullable=True)
    height = Column(Integer, nullable=True)
    num_inference_steps = Column(Integer, nullable=True)
    guidance_scale = Column(Integer, nullable=True)
    num_images_per_prompt = Column(Integer, nullable=True)
    use_lora: Column(Boolean, nullable=True)
    lora_path: Column(String(512), nullable=True)
    lora_scale: Column(Float, nullable=True)
    use_embedding: Column(Boolean, nullable=True)
    embedding_path: Column(String(512), nullable=True)
    generator = Column(Numeric, nullable=True)
    strength = Column(Float, nullable=True)
    owner_id = Column(UUID(as_uuid=True), ForeignKey("user.id"))
    owner = relationship("User", back_populates="prompts")
    artworks = relationship("ArtWork", back_populates="prompt")


class ArtWork(Base):
    __tablename__ = "artwork"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    title = Column(String(64), nullable=True)
    image = Column(String(512), nullable=True)
    is_active = Column(Boolean, default=True)
    collection_id = Column(UUID(as_uuid=True), ForeignKey("collection.id"))
    collection = relationship("Collection", back_populates="artworks")
    owner_id = Column(UUID(as_uuid=True), ForeignKey("user.id"))
    owner = relationship("User", back_populates="artworks")
    prompt_id = Column(UUID(as_uuid=True), ForeignKey("prompt.id"))
    prompt = relationship("Prompt", back_populates="artworks")


class ModelCategory(Base):
    __tablename__ = "model_category"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(64), nullable=True)
    description = Column(String(512), nullable=True)
    models = relationship(
        "MLModel",
        secondary="model_category_association",
        back_populates="categories"
    )


class MLModel(Base):
    __tablename__ = "ml_model"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(64), nullable=True)
    source = Column(String(512), nullable=True)
    description = Column(String(512), nullable=True)
    url_docs = Column(String(512), nullable=True)
    categories = relationship(
        "ModelCategory",
        secondary="model_category_association",
        back_populates="models"
    )
    extra_params = Column(JSON, nullable=True)
    is_active = Column(Boolean, default=True)


class ModelCategoryAssociation(Base):
    __tablename__ = "model_category_association"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    model_id = Column(UUID(as_uuid=True), ForeignKey("ml_model.id"))
    category_id = Column(UUID(as_uuid=True), ForeignKey("model_category.id"))
