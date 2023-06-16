from typing import Union

from fastapi import APIRouter
from fastapi import Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.integrations.firebase import get_user
from app.models.schemas import User, Response
from app.services.user_services import UserService

router = APIRouter()
user_service = UserService()


@router.post("", response_model=Union[Response, User])
async def load_or_create_user(user: User, db: Session = Depends(get_db)):
    new_user = await user_service.load_or_create_user(db=db, user=user)
    if not new_user:
        return Response(success=False, message="error loading and adding the user")

    return new_user


@router.get("/email/{email}", response_model=Union[Response, User])
async def get_user_data_by_email(email: str, db: Session = Depends(get_db), user=Depends(get_user)):
    request_email = user["email"]
    user = await user_service.get_user_by_email(db=db, email=email, request_email=request_email)
    if not user:
        return Response(success=False, message="user doesn't exist")

    return user


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
