from typing import List, Union

from morpheus_data.models.schemas import User
from morpheus_data.repository.collection_repository import CollectionRepository
from morpheus_data.repository.firebase_repository import FirebaseRepository
from morpheus_data.repository.role_repository import RoleRepository
from morpheus_data.repository.user_repository import UserRepository
from sqlalchemy.orm import Session


class UserService:
    def __init__(self):
        self.user_repository = UserRepository()
        self.firebase_repository = FirebaseRepository()
        self.collection_repository = CollectionRepository()
        self.role_repository = RoleRepository()

    async def load_or_create_user(self, *, db: Session, user: User) -> Union[User, None]:
        user_db = self.user_repository.get_user_by_email(db=db, email=user.email)
        if not user_db:
            user_db = self.user_repository.create_user(db=db, user=user)
            user_db = self.user_repository.get_user_data(db=db, email=user_db.email)
            self.collection_repository.create_initial_collection(db=db, owner=user_db)
        return user_db

    async def create_admin(self, *, db: Session, user: User) -> Union[User, None]:
        user_db = self.user_repository.get_user_by_email(db=db, email=user.email)
        if user_db:
            if any(role.name == "admin" for role in user_db.roles):
                raise ValueError(f"User with email {user.email} is already an admin")
            self.user_repository.add_admin_role_to_user(db=db, user=user)

        else:
            self.user_repository.create_user(db=db, user=user)
        new_admin = self.user_repository.get_user_data(db=db, email=user.email)
        return new_admin

    async def get_users(self, *, db: Session, email: str) -> List[User]:
        self.user_repository.get_user_data(db=db, email=email)
        return self.user_repository.get_users(db=db)

    async def get_users_by_role(self, *, db: Session, role: str) -> List[User]:
        return self.user_repository.get_users_by_role(db=db, role=role)

    async def get_user_by_id(self, *, db: Session, user_id: str) -> User:
        return self.user_repository.get_user(db=db, user_id=user_id)

    async def get_user_by_email(self, *, db: Session, email: str, request_email: str) -> User:
        return self.validate_user(db=db, email=email, request_email=request_email)

    async def update_user(self, *, db: Session, user: User, request_email: str) -> User:
        self.validate_user(db=db, email=user.email, request_email=request_email)
        return self.user_repository.update_user(db=db, user=user)

    async def delete_user(self, *, db: Session, email: str, request_email: str) -> bool:
        self.validate_user(db=db, email=email, request_email=request_email)
        removed_user = self.user_repository.delete_user(db=db, email=email)
        if removed_user:
            self.firebase_repository.remove_firebase_user(email=email)
        return True

    async def delete_admin(self, *, db: Session, email: str) -> bool:
        admin_to_remove = self.user_repository.get_user_by_email(db=db, email=email)
        if not admin_to_remove:
            raise ValueError("Admin to remove not found")

        admin_roles = self.user_repository.get_user_roles(db=db, user=admin_to_remove)
        if not any(role.name == "admin" for role in admin_roles):
            raise ValueError("Admin to remove doesn't have admin role")

        if len(admin_roles) == 1:
            removed_admin = self.user_repository.delete_user(db=db, email=email)
            if removed_admin:
                self.firebase_repository.remove_firebase_user(email=email)
            return True
        else:
            admin_roles = [role for role in admin_roles if role.name != "admin"]
            admin_to_remove.roles = admin_roles
            self.user_repository.update_user(db=db, user=admin_to_remove)
            return True

    def validate_user(self, *, db: Session, email: str, request_email: str):
        if email != request_email:
            raise ValueError(f"User with email {request_email} is not the owner of the resource")
        return self.user_repository.get_user_data(db=db, email=email)
