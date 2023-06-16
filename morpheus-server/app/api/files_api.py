from typing import Union

from fastapi import APIRouter, UploadFile, File, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.integrations.firebase import get_user
from app.models.schemas import Response
from app.services.files_services import FilesService

router = APIRouter()
file_service = FilesService()


@router.post("/upload", response_model=Union[Response, str])
async def upload_file_to_s3(
    folder: str, file: UploadFile = File(...), db: Session = Depends(get_db), user=Depends(get_user)
):
    email = user["email"]
    filename = file_service.upload_file_to_s3(file=file, db=db, email=email, folder=folder)
    if not filename:
        return {"success": False, "message": "error uploading the file"}

    return filename


@router.post("/upload/multiple", response_model=Union[Response, list[str]])
async def upload_multiple_files_to_s3(
    files: list[UploadFile] = File(...), db: Session = Depends(get_db), user=Depends(get_user)
):
    email = user["email"]
    filenames = file_service.upload_multiple_files_to_s3(db=db, files=files, email=email)
    if not filenames:
        return {"success": False, "message": "error uploading the files"}

    return filenames


@router.get("/user", response_model=Union[Response, list[str]])
async def get_user_images(db=Depends(get_db), user=Depends(get_user)):
    email = user["email"]
    images = file_service.get_user_images(db=db, email=email)
    if not images:
        return {"success": False, "message": "error getting the images"}

    return images
