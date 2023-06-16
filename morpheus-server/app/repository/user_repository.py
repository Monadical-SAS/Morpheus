from typing import Union, List

from sqlalchemy.orm import Session

from app.models.models import User
from app.repository.files_repository import IMAGES_BUCKET


class UserRepository:
    @classmethod
    def get_user(cls, *, db: Session, user_id: str) -> User:
        return db.query(User).filter(User.id == user_id).first()

    @classmethod
    def get_user_by_email(cls, *, db: Session, email: str) -> User:
        user_db = db.query(User).filter(User.email == email).first()
        if user_db:
            if user_db.avatar and not user_db.avatar.startswith("https://"):
                user_db.avatar = f"https://{IMAGES_BUCKET}.s3.amazonaws.com/{user_db.avatar}"
        return user_db

    @classmethod
    def get_user_data(cls, *, db: Session, email: str) -> Union[User, None]:
        db_user = UserRepository.get_user_by_email(db=db, email=email)
        if not db_user:
            raise ValueError(f"User with email {email} not found")
        return db_user

    @classmethod
    def get_users(cls, *, db: Session, skip: int = 0, limit: int = 100) -> List[User]:
        return db.query(User).offset(skip).limit(limit).all()

    @classmethod
    def create_user(cls, *, db: Session, user: User) -> User:
        avatar_seed = user.name if user.name else user.email
        db_user = User(
            name=user.name,
            email=user.email,
            bio=user.bio,
            avatar=f"https://ui-avatars.com/api/?name={avatar_seed}&background=random&size=128",
        )
        db.add(db_user)
        db.commit()
        return db_user

    @classmethod
    def update_user(cls, *, db: Session, user: User) -> Union[User, None]:
        db_user = UserRepository.get_user_by_email(db=db, email=user.email)
        if not db_user:
            return None

        db_user.name = user.name
        db_user.phone = user.phone
        db_user.bio = user.bio
        db_user.avatar = user.avatar
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
