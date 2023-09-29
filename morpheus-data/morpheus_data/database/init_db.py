from loguru import logger
from morpheus_data.database.database import get_db
from morpheus_data.database.init_data.categories import all_categories
from morpheus_data.database.init_data.collections import public_collection
from morpheus_data.database.init_data.controlnet_models import controlnet_models
from morpheus_data.database.init_data.roles import all_roles
from morpheus_data.database.init_data.sd_models import sd_models
from morpheus_data.database.init_data.users import all_users, morpheus_admin
from morpheus_data.models.schemas import ModelCategory, User, CollectionCreate, MLModelCreate, Role
from morpheus_data.repository.collection_repository import CollectionRepository
from morpheus_data.repository.model_category_repository import ModelCategoryRepository
from morpheus_data.repository.model_repository import ModelRepository
from morpheus_data.repository.role_repository import RoleRepository
from morpheus_data.repository.user_repository import UserRepository

db = next(get_db())

role_repository = RoleRepository()
user_repository = UserRepository()
categories_repository = ModelCategoryRepository()
collections_repository = CollectionRepository()
model_repository = ModelRepository()


def init_roles():
    for role in all_roles:
        role_name = role.get("name", None)
        db_role = role_repository.get_role_by_name(db=db, name=role_name)
        if not db_role:
            role_repository.create_role(db=db, role=Role(**role))
        logger.info(f"Role {role_name} created")


def init_users():
    for user in all_users:
        user_email = user.get("email", None)
        db_user = user_repository.get_user_by_email(db=db, email=user_email)
        if not db_user:
            user_repository.create_user(db=db, user=User(**user))
        logger.info(f"Morpheus user {user_email} created")


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
    init_roles()
    init_users()
    init_categories()
    init_collections()
    init_models()
    db.close()


if __name__ == "__main__":
    init_morpheus_data()
