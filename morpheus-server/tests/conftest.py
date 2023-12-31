import pytest
from app.app import app
from httpx import AsyncClient
from morpheus_data.database.database import get_db
from morpheus_data.models.schemas import User, Role
from morpheus_data.repository.firebase_repository import FirebaseRepository
from morpheus_data.repository.role_repository import RoleRepository
from morpheus_data.repository.user_repository import UserRepository

db = next(get_db())


class DemoUser:
    def __init__(self):
        self.email = "demo@morpheus.com"
        self.name = "Demo User"
        self.password = "DemoPass88"
        self.roles = [{"name": "user"}]


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
    role_repository = RoleRepository()

    # Create user role if not exists
    role = role_repository.get_role_by_name(db=db, name="user")
    if role is None:
        role = demo_user.roles[0]
        role_repository.create_role(db=db, role=Role(**role))

    # Register user in firebase if not exists
    user = firebase_repository.get_firebase_user(email=demo_user.email)
    if user is None:
        firebase_repository.register_firebase_user(email=demo_user.email, password=demo_user.password)

    # Create user in database if not exists
    user_repository = UserRepository()
    user = user_repository.get_user_by_email(db=db, email=demo_user.email)
    if user is None:
        new_user = User(email=demo_user.email, name=demo_user.name, roles=demo_user.roles)
        user_repository.create_user(db=db, user=new_user)

    # Sign in user in firebase and get token
    response = await firebase_repository.sign_in_with_email_and_password(
        email=demo_user.email, password=demo_user.password
    )
    token = response["idToken"]
    yield {"Authorization": f"Bearer {token}"}

    # Delete user from firebase and database
    firebase_repository.remove_firebase_user(email=demo_user.email)
    user_repository.delete_user(db=db, email=demo_user.email)
    role_repository.delete_role(db=db, name="user")
