from typing import Union, List

from loguru import logger
from morpheus_data.models.models import User, Role
from morpheus_data.models.schemas import User as UserCreate
from morpheus_data.repository.files.s3_files_repository import IMAGES_BUCKET
from sqlalchemy.orm import Session


class UserRepository:
    @classmethod
    def get_user(cls, *, db: Session, user_id: str) -> User:
        db_user = db.query(User).filter(User.id == user_id).first()
        if db_user:
            db_user.roles = db_user.roles
        return db_user

    @classmethod
    def get_user_by_email(cls, *, db: Session, email: str) -> User:
        user_db = db.query(User).filter(User.email == email).first()
        if user_db:
            if user_db.avatar and not user_db.avatar.startswith("https://"):
                user_db.avatar = (
                    f"https://{IMAGES_BUCKET}.s3.amazonaws.com/{user_db.avatar}"
                )
            user_db.roles = user_db.roles
        return user_db

    @classmethod
    def get_user_data(cls, *, db: Session, email: str) -> Union[User, None]:
        db_user = UserRepository.get_user_by_email(db=db, email=email)
        if not db_user:
            raise ValueError(f"User with email {email} not found")
        return db_user

    @classmethod
    def get_user_roles(cls, *, db: Session, user: UserCreate) -> List[Role]:
        if not user.roles:
            raise ValueError("User must have at least one role")

        db_roles = []
        for role in user.roles:
            db_role = db.query(Role).filter(Role.name == role.name).first()
            if not db_role:
                raise ValueError(f"Role {role.name} not found")
            db_roles.append(db_role)
        return db_roles

    @classmethod
    def get_users(cls, *, db: Session, skip: int = 0, limit: int = 100) -> List[User]:
        return db.query(User).offset(skip).limit(limit).all()

    @classmethod
    def get_users_by_role(cls, *, db: Session, role: str) -> List[User]:
        return db.query(User).join(User.roles).filter(Role.name == role).all()

    @classmethod
    def create_user(cls, *, db: Session, user: UserCreate) -> User:
        db_user = UserRepository.get_user_by_email(db=db, email=user.email)
        if db_user:
            raise ValueError(f"User with email {user.email} already exists")

        db_roles = UserRepository.get_user_roles(db=db, user=user)
        logger.info(f"Creating user {user.email} with roles {db_roles}")
        avatar_seed = user.name if user.name else user.email
        db_user = User(
            name=user.name,
            email=user.email,
            bio=user.bio,
            avatar=f"https://ui-avatars.com/api/?name={avatar_seed}&background=random&size=128",
        )
        db_user.roles = db_roles
        db.add(db_user)
        db.commit()
        return db_user

    @classmethod
    def update_user(cls, *, db: Session, user: UserCreate) -> Union[User, None]:
        db_user = UserRepository.get_user_by_email(db=db, email=user.email)
        if not db_user:
            raise ValueError(f"User with email {user.email} not found")

        db_roles = UserRepository.get_user_roles(db=db, user=db_user)
        db_user.name = user.name
        db_user.bio = user.bio
        db_user.avatar = user.avatar
        db_user.roles = db_roles
        db.commit()
        return db_user

    @classmethod
    def add_admin_role_to_user(
            cls, *, db: Session, user: UserCreate
    ) -> Union[User, None]:
        db_user = UserRepository.get_user_by_email(db=db, email=user.email)
        if not db_user:
            raise ValueError(f"User with email {user.email} not found")

        db_roles = UserRepository.get_user_roles(db=db, user=db_user)
        admin_role = db.query(Role).filter(Role.name == "admin").first()
        db_roles.append(admin_role)
        db_user.roles = db_roles
        db.commit()
        return db_user

    @classmethod
    def delete_user(cls, *, db: Session, email: str) -> bool:
        db_user = UserRepository.get_user_by_email(db=db, email=email)
        if not db_user:
            return True

        # db_user.is_active = False  # logical deletion
        db.delete(db_user)  # Physical deletion
        db.commit()
        return True
