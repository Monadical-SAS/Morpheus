from app.config import get_settings
from app.error.user import UserNotFoundError
from fastapi import Depends, HTTPException, status, Response
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from firebase_admin import auth, credentials, initialize_app
from morpheus_data.database.database import get_db
from morpheus_data.repository.user_repository import UserRepository

settings = get_settings()
user_repository = UserRepository()
db = next(get_db())

credentials = credentials.Certificate(
    {
        "type": "service_account",
        "project_id": settings.firebase_project_id,
        "private_key": settings.firebase_private_key.replace("\\n", "\n"),
        "client_email": settings.firebase_client_email,
        "token_uri": "https://oauth2.googleapis.com/token",
    }
)

initialize_app(credentials)


def get_user(res: Response, authorization: HTTPAuthorizationCredentials = Depends(HTTPBearer(auto_error=False))):
    if authorization is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Bearer authentication required",
            headers={"WWW-Authenticate": 'Bearer realm="auth_required"'},
        )
    try:
        decoded_token = auth.verify_id_token(authorization.credentials)
        user = user_repository.get_user_by_email(db=db, email=decoded_token["email"])
        if user is None:
            raise UserNotFoundError(f"User with email {decoded_token['email']} not found")
    except Exception as error:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Invalid authentication credentials. {error}",
            headers={"WWW-Authenticate": 'Bearer error="invalid_token"'},
        )
    res.headers["WWW-Authenticate"] = 'Bearer realm="auth_required"'
    return decoded_token
