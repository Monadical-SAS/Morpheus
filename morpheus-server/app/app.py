import os
import time
from pathlib import Path

import sentry_sdk
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.artwork_api import router as ArtworksRouter
from app.api.auth_api import router as AuthRouter
from app.api.collections_api import router as CollectionsRouter
from app.api.files_api import router as FilesRouter
from app.api.model_category_api import router as ModelCategoryRouter
from app.api.models_api import router as ModelsRouter
from app.api.samplers_api import router as SamplersRouter
from app.api.sdiffusion_api import router as SDiffusionRouter
from app.api.user_api import router as UserRouter
from app.database.database import Base
from app.database.database import engine
from app.database.init_db import init_morpheus_data
from config.logger import InitLogger

SENTRY_DSN = os.environ.get("SENTRY_DSN", "")

sentry_sdk.init(
    dsn=SENTRY_DSN,
)

app = FastAPI()


@app.on_event("startup")
async def startup_db():
    Base.metadata.create_all(bind=engine)
    init_morpheus_data()


config_path = Path("config").absolute() / "logging-conf.yml"
logger = InitLogger.create_logger(config_path)

ALLOWED_ORIGINS = os.environ.get("ALLOWED_ORIGINS")
if ALLOWED_ORIGINS is None:
    origins = ["http://localhost:3000", "http://localhost:3001"]
else:
    origins = ALLOWED_ORIGINS.split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(AuthRouter, tags=["auth"], prefix="/auth")
app.include_router(UserRouter, tags=["users"], prefix="/users")
app.include_router(SDiffusionRouter, tags=["stable diffusion"], prefix="/sdiffusion")
app.include_router(FilesRouter, tags=["files"], prefix="/files")
app.include_router(CollectionsRouter, tags=["collections"], prefix="/collections")
app.include_router(ArtworksRouter, tags=["artworks"], prefix="/artworks")
app.include_router(ModelsRouter, tags=["models"], prefix="/models")
app.include_router(ModelCategoryRouter, tags=["categories"], prefix="/categories")
app.include_router(SamplersRouter, tags=["samplers"], prefix="/samplers")


@app.get("/", tags=["Root"])
async def read_root():
    return {"message": f"Welcome to morpheus, servertime {time.time()}"}
