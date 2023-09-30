from typing import Union

from app.integrations.firebase import get_user, get_admin
from app.models.schemas import Response
from app.services.user_services import UserService
from fastapi import APIRouter
from fastapi import Depends
from loguru import logger
from morpheus_data.database.database import get_db
from morpheus_data.models.schemas import User
from sqlalchemy.orm import Session

router = APIRouter()
user_service = UserService()


@router.post("", response_model=Union[Response, User])
async def load_or_create_user(user: User, db: Session = Depends(get_db)):
    new_user = await user_service.load_or_create_user(db=db, user=user)
    if not new_user:
        return Response(success=False, message="error loading and adding the user")

    return new_user


@router.post("/admin", response_model=Union[Response, User])
async def create_admin(user: User, db: Session = Depends(get_db), admin=Depends(get_admin)):
    logger.info(f"creating new admin user {user} by {admin}")
    new_admin = await user_service.create_admin(db=db, user=user)
    if not new_admin:
        return Response(success=False, message="error loading and adding the user")

    return new_admin


@router.get("/admins", response_model=Response)
async def get_admins(db: Session = Depends(get_db), admin=Depends(get_admin)):
    logger.info(f"getting all admins by {admin}")
    users = await user_service.get_users_by_role(db=db, role="admin")
    if not users:
        return Response(success=False, message="No admins found")

    return Response(success=True, message="admins found", data=users)


@router.get("/email/{email}", response_model=Union[Response, User])
async def get_user_data_by_email(email: str, db: Session = Depends(get_db), user=Depends(get_user)):
    request_email = user["email"]
    user = await user_service.get_user_by_email(db=db, email=email, request_email=request_email)
    if not user:
        return Response(success=False, message="user doesn't exist")

    return user


@router.get("/admin/email/{email}", response_model=Union[Response, User])
async def get_admin_data_by_email(email: str, db: Session = Depends(get_db), user=Depends(get_admin)):
    request_email = user["email"]
    admin = await user_service.get_user_by_email(db=db, email=email, request_email=request_email)
    if not admin:
        return Response(success=False, message=f"admin with email {email} doesn't exist")

    return admin


@router.put("", response_model=Union[Response, User])
async def update_user_data(user: User, db: Session = Depends(get_db), request_user=Depends(get_user)):
    request_email = request_user["email"]
    updated_user = await user_service.update_user(db=db, user=user, request_email=request_email)
    if not updated_user:
        return Response(success=False, message="error updating the user")

    return updated_user


@router.delete("/{email}", response_model=Union[Response, bool])
async def delete_user_data(email: str, db: Session = Depends(get_db), user=Depends(get_user)):
    request_email = user["email"]
    deleted_user = await user_service.delete_user(db=db, email=email, request_email=request_email)
    if not deleted_user:
        return Response(success=False, message="error deleting the user")

    return Response(success=True, message="user deleted successfully")
