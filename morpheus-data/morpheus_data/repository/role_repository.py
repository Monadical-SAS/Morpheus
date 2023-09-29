from typing import Union, List

from morpheus_data.models.models import Role
from morpheus_data.models.schemas import Role as RoleCreate
from sqlalchemy.orm import Session


class RoleRepository:
    @classmethod
    def get_role_by_id(cls, *, db: Session, role_id: str) -> Role:
        return db.query(Role).filter(Role.id == role_id).first()

    @classmethod
    def get_role_by_name(cls, *, db: Session, name: str) -> Role:
        return db.query(Role).filter(Role.name == name).first()

    @classmethod
    def get_roles(cls, *, db: Session, skip: int = 0, limit: int = 100) -> List[Role]:
        return db.query(Role).offset(skip).limit(limit).all()

    @classmethod
    def get_roles_by_user_id(cls, *, db: Session, user_id: str) -> List[Role]:
        return db.query(Role).filter(Role.user_id == user_id).all()

    @classmethod
    def create_role(cls, *, db: Session, role: RoleCreate) -> Role:
        db_role = Role(
            name=role.name,
            description=role.description,
        )
        db.add(db_role)
        db.commit()
        return db_role

    @classmethod
    def update_role(cls, *, db: Session, role: RoleCreate) -> Union[Role, None]:
        db_role = RoleRepository.get_role_by_id(db=db, role_id=role.id)
        if not db_role:
            return None

        db_role.name = role.name
        db_role.description = role.description
        db.commit()
        return db_role

    @classmethod
    def delete_role(cls, *, db: Session, email: str) -> bool:
        db_role = RoleRepository.get_role_by_id(db=db, role_id=email)
        if not db_role:
            return True
        db.delete(db_role)
        db.commit()
        return True
