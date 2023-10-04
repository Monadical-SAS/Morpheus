from typing import Union

from app.config import get_file_handlers
from app.integrations.firebase import get_user
from app.models.schemas import Response
from app.services.files_services import FilesService
from fastapi import APIRouter, Depends, File, UploadFile
from morpheus_data.database.database import get_db
from sqlalchemy.orm import Session

router = APIRouter()
files_repository = get_file_handlers()
file_service = FilesService(files_repository=files_repository)


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
        folder: str, files: list[UploadFile] = File(...), db: Session = Depends(get_db), user=Depends(get_user)
):
    email = user["email"]
    filenames = file_service.upload_multiple_files_to_s3(db=db, files=files, email=email, folder=folder)
    if not filenames:
        return {"success": False, "message": "error uploading the files"}

    return filenames


@router.get("/user", response_model=Union[Response, list[str]])
async def get_user_images(folder: Union[str, None], user=Depends(get_user)):
    email = user["email"]
    images = file_service.get_user_images(email=email, folder=folder)
    if not images:
        return {"success": False, "message": "error getting the images"}

    return images
