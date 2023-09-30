from fastapi import APIRouter, Depends

from app.integrations.firebase import get_user, get_admin

router = APIRouter()


@router.get("/me", status_code=200)
async def hello_user(user=Depends(get_user)):
    return {"success": True, "message": f"Hello {user['email']}"}


@router.get("/admin", status_code=200)
async def hello_admin(user=Depends(get_admin)):
    return {"success": True, "message": f"Hello {user['email']}"}
