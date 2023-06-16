import pytest
from httpx import AsyncClient

from app.app import app
from app.database import get_db
from app.models.schemas import User
from app.repository.firebase_repository import FirebaseRepository
from app.repository.user_repository import UserRepository

db = next(get_db())


class DemoUser:
    def __init__(self):
        self.email = "demo@morpheus.com"
        self.name = "Demo User"
        self.password = "DemoPass88"


@pytest.fixture(scope="session")
def anyio_backend():
    return "asyncio"


@pytest.fixture(scope="session")
def demo_user():
    fake_user = DemoUser()
    yield fake_user


@pytest.fixture(scope="session")
async def async_app_client():
    async with AsyncClient(app=app, base_url="https://servertest") as client:
        yield client


@pytest.fixture(scope="session")
async def auth_header(async_app_client, demo_user):
    firebase_repository = FirebaseRepository()
    user = firebase_repository.get_firebase_user(email=demo_user.email)
    if user is None:
        firebase_repository.register_firebase_user(email=demo_user.email, password=demo_user.password)

    user_repository = UserRepository()
    user = user_repository.get_user_by_email(db=db, email=demo_user.email)
    if user is None:
        new_user = User(email=demo_user.email, name=demo_user.name)
        user_repository.create_user(db=db, user=new_user)

    response = await firebase_repository.sign_in_with_email_and_password(
        email=demo_user.email, password=demo_user.password
    )
    token = response["idToken"]
    yield {"Authorization": f"Bearer {token}"}

    firebase_repository.remove_firebase_user(email=demo_user.email)
    user_repository.delete_user(db=db, email=demo_user.email)
