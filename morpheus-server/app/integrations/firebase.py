from app.config import get_settings
from app.error.user import UserNotFoundError
from fastapi import Depends, HTTPException, status, Response
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from firebase_admin import auth, credentials, initialize_app
from loguru import logger
from morpheus_data.database.database import get_db
from morpheus_data.repository.user_repository import UserRepository
from sqlalchemy.exc import PendingRollbackError

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


def validate_firebase_user(authorization: HTTPAuthorizationCredentials):
    if authorization is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Bearer authentication required",
            headers={"WWW-Authenticate": 'Bearer realm="auth_required"'},
        )
    try:
        decoded_token = auth.verify_id_token(authorization.credentials)
        logger.info(f"User {decoded_token['email']} authenticated successfully with Firebase")
        return decoded_token
    except Exception as error:
        logger.error(f"Invalid authentication credentials. {error}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Invalid authentication credentials. {error}",
            headers={"WWW-Authenticate": 'Bearer error="invalid_token"'},
        )


def validate_morpheus_user_and_role(user_email: str, role: str):
    try:
        user = user_repository.get_user_by_email(db=db, email=user_email)
        if user is None:
            raise UserNotFoundError(f"User with email {user_email} not found")
        user_roles = user.roles
        if role not in [user_role.name for user_role in user_roles]:
            logger.error(f"User {user.email} does not have {role} permission to access this resource")
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"User {user.email} does not have {role} permission to access this resource",
            )
        logger.info(f"User {user.email} authenticated with role {role} successfully with Morpheus")
    except PendingRollbackError as e:
        logger.error("PendingRollbackError occurred: {}".format(str(e)))
        db.rollback()
        db.close()
    except Exception as e:
        logger.error("Exception occurred: {}".format(str(e)))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Exception occurred: {str(e)}",
        )


def get_user(
        res: Response,
        authorization: HTTPAuthorizationCredentials = Depends(HTTPBearer(auto_error=False)),
):
    decoded_token = validate_firebase_user(authorization=authorization)
    validate_morpheus_user_and_role(user_email=decoded_token["email"], role="user")
    res.headers["WWW-Authenticate"] = 'Bearer realm="auth_required"'
    return decoded_token


def get_admin(
        res: Response,
        authorization: HTTPAuthorizationCredentials = Depends(HTTPBearer(auto_error=False)),
):
    decoded_token = validate_firebase_user(authorization=authorization)
    validate_morpheus_user_and_role(user_email=decoded_token["email"], role="admin")
    res.headers["WWW-Authenticate"] = 'Bearer realm="auth_required"'
    return decoded_token
