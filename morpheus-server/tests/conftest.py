import pytest
from httpx import AsyncClient

from morpheus_data.database.database import get_db
from morpheus_data.models.schemas import User, CollectionCreate, ArtWorkCreate, Collection, ArtWork, Prompt, ModelCategory
from morpheus_data.repository.firebase_repository import FirebaseRepository
from morpheus_data.repository.user_repository import UserRepository
from morpheus_data.repository.collection_repository import CollectionRepository
from morpheus_data.repository.artwork_repository import ArtWorkRepository
from morpheus_data.repository.prompt_repository import PromptRepository
from morpheus_data.repository.model_category_repository import ModelCategoryRepository
from moto import mock_s3
import boto3
import os

from app.config import get_settings

from tests.utils.prompts import generate_random_prompt

from app.app import app

db = next(get_db())


class DemoUserCredentials:
    def __init__(self):
        self.email = "demo@morpheus.com"
        self.name = "Demo User"
        self.password = "DemoPass88"

@pytest.fixture(scope="session")
def aws_credentials():
    """Mocked AWS Credentials for moto."""
    os.environ["AWS_ACCESS_KEY_ID"] = "testing"
    os.environ["AWS_SECRET_ACCESS_KEY"] = "testing"
    os.environ["AWS_SECURITY_TOKEN"] = "testing"
    os.environ["AWS_SESSION_TOKEN"] = "testing"
    os.environ["AWS_DEFAULT_REGION"] = "us-east-1"

@pytest.fixture(scope="session")
def mock_settings(aws_credentials):
    return get_settings()

@pytest.fixture(scope="session")
def anyio_backend():
    return "asyncio"


@pytest.fixture(scope="session")
def demo_user_credentials():
    fake_user = DemoUserCredentials()
    yield fake_user

@pytest.fixture(scope="session")
def demo_user(demo_user_credentials):
    user_repository = UserRepository()
    user = user_repository.get_user_by_email(db=db, email=demo_user_credentials.email)
    if user is None:
        new_user = User(email=demo_user_credentials.email, name=demo_user_credentials.name)
        user = user_repository.create_user(db=db, user=new_user)
    yield user
    user_repository.delete_user(db=db, email=demo_user_credentials.email)


@pytest.fixture(scope="session")
async def async_app_client(mock_settings):
    def mocked_app(*args, **kwargs):
        with mock_s3():
            s3 = boto3.client("s3")
            s3.create_bucket(Bucket=mock_settings.images_bucket)
            s3.create_bucket(Bucket=mock_settings.images_temp_bucket)
            s3.create_bucket(Bucket=mock_settings.models_bucket)
            return app(*args, **kwargs)
    async with AsyncClient(app=mocked_app, base_url="https://servertest") as client:
        yield client

@pytest.fixture(scope="session")
async def auth_header(async_app_client, demo_user_credentials, demo_user):
    firebase_repository = FirebaseRepository()
    user = firebase_repository.get_firebase_user(email=demo_user_credentials.email)
    if user is None:
        firebase_repository.register_firebase_user(email=demo_user_credentials.email, password=demo_user_credentials.password)

    response = await firebase_repository.sign_in_with_email_and_password(
        email=demo_user_credentials.email, password=demo_user_credentials.password
    )
    token = response["idToken"]
    yield {"Authorization": f"Bearer {token}"}

    firebase_repository.remove_firebase_user(email=demo_user_credentials.email)

@pytest.fixture(scope="function")
def collection(demo_user):
    collection_create = CollectionCreate(
        name="test collection", 
        description="test description",
        image="https://commons.wikimedia.org/wiki/File:Trier_100_Millionen.jpg",
    )
    collection_repository = CollectionRepository()
    new_collection = collection_repository.create_collection(db=db, collection=collection_create, owner=demo_user)
    yield new_collection
    collection_repository.delete_collection(db=db, collection_id=new_collection.id)

@pytest.fixture(scope="function")
def model_category():
    category = ModelCategory(
        name="test_model_category",
        description="test_description"
    )
    category_repository = ModelCategoryRepository()
    new_category = category_repository.create_category(db=db, category=category)
    yield new_category
    category_repository.delete_category(db=db, category_id=new_category.id)

@pytest.fixture(scope="function")
def make_artwork(demo_user, collection):
    artworks = []
    prompts = []

    artwork_repository = ArtWorkRepository()
    prompt_repository = PromptRepository()

    def _make_artwork(
            title: str, 
            collection: Collection = collection,
            image: str = "https://commons.wikimedia.org/wiki/File:Trier_100_Millionen.jpg",
        ) -> ArtWork:
        prompt_random = generate_random_prompt()
        prompt = prompt_repository.get_or_create_prompt(db=db, prompt=Prompt(**prompt_random), owner=collection.owner)

        artwork_create = ArtWorkCreate(
            title = title,
            image = image,
            prompt = prompt,
            collection_id = collection.id,
        )
        new_artwork = artwork_repository.create_artwork(db=db, artwork=artwork_create, prompt=prompt)
        artworks.append(new_artwork)
        prompts.append(prompt)
        return new_artwork

    yield _make_artwork

    for artwork in artworks:
        artwork_repository.delete_artwork(db=db, artwork_id=artwork.id)
    for prompt in prompts:
        # method not present in repository
        #prompt_repository.delete_prompt(db=db, prompt_id=prompt.id)
        pass

