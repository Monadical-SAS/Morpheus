from loguru import logger

from app.database.database import get_db
from app.database.init_data.categories import all_categories
from app.database.init_data.colelctions import public_collection
from app.database.init_data.controlnet_models import controlnet_models
from app.database.init_data.sd_models import sd_models
from app.database.init_data.users import morpheus_user, morpheus_admin
from app.models.schemas import ModelCategory, User, CollectionCreate, MLModelCreate
from app.repository.collection_repository import CollectionRepository
from app.repository.model_category_repository import ModelCategoryRepository
from app.repository.model_repository import ModelRepository
from app.repository.user_repository import UserRepository

db = next(get_db())

user_repository = UserRepository()
categories_repository = ModelCategoryRepository()
collections_repository = CollectionRepository()
model_repository = ModelRepository()


def init_user():
    user_email = morpheus_user.get("email", None)
    user = user_repository.get_user_by_email(db=db, email=user_email)
    if not user:
        user_repository.create_user(db=db, user=User(**morpheus_user))
    logger.info(f"Morpheus user {user_email} created")


def init_admin():
    admin_email = morpheus_admin.get("email", None)
    user = user_repository.get_user_by_email(db=db, email=admin_email)
    if not user:
        user_repository.create_user(db=db, user=User(**morpheus_admin))
    logger.info(f"Morpheus admin {admin_email} created")


def init_categories():
    for category in all_categories:
        category_name = category.get("name", None)
        db_category = categories_repository.get_category_by_name(db=db, name=category_name)
        if not db_category:
            categories_repository.create_category(db=db, category=ModelCategory(**category))
        logger.info(f"Category Collection {category_name} created")


def init_collections():
    collection_name = public_collection.get("name", None)
    admin_email = morpheus_admin.get("email", None)
    db_collection = collections_repository.get_collection_by_name(db=db, name=collection_name)
    db_user = user_repository.get_user_by_email(db=db, email=admin_email)
    if not db_collection:
        collections_repository.create_collection(
            db=db,
            collection=CollectionCreate(**public_collection),
            owner=db_user
        )
    logger.info(f"Collection {collection_name} created")


def init_models():
    all_models = sd_models + controlnet_models
    for sd_model in all_models:
        model_source = sd_model.get("source", None)
        db_model = model_repository.get_model_by_source(db=db, model_source=model_source)
        if not db_model:
            db_categories = [
                categories_repository.get_category_by_name(db=db, name=category.get("name", None))
                for category in sd_model.get("categories", [])
            ]
            model_repository.create_model(db=db, model=MLModelCreate(**sd_model), categories=db_categories)
        logger.info(f"Model {model_source} created")


def init_morpheus_data():
    init_user()
    init_admin()
    init_categories()
    init_collections()
    init_models()
    db.close()


if __name__ == "__main__":
    init_morpheus_data()
