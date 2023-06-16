from fastapi import APIRouter, Depends

from app.integrations.firebase import get_user

router = APIRouter()


@router.get("/me", status_code=200)
async def hello_user(user=Depends(get_user)):
    return {"success": True, "message": f"Hello {user['uid']}"}
