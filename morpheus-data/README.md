# Morpheus data

This service enables you to seamlessly manage all aspects of data in Morpheus. Its purpose is
to separate business logic from data logic and provide easy access to data for other Morpheus services. 

To enable other services to utilize it, morpheus-data is designed as a python library that can
be easily installed in any of the other services through a wheel created in the morpheus-data dockerfile

## What contains morpheus-data

The morpheus-data library handles the following modules:

 - **models**. This module contains all database models and data schemas of morpheus. Database models 
   are defined using [SQLAlchemy](https://www.sqlalchemy.org/) while data schemas are defined using 
   [Pydantic](https://pydantic-docs.helpmanual.io/).
    ```
    morpheus-data/morpheus_data/models/
    ├── __init__.py
    ├── models.py
    └── schemas.py
    ```
 - **repository**. This module handles the interactions with the data sources: databases and storage
   bucket provider (AWS S3 by default).
    ```
    morpheus-data/morpheus_data/repository/
    ├── __init__.py
    ├── artwork_repository.py
    ├── collection_repository.py
    ├── controlnet_repository.py
    ├── files
    │   ├── __init__.py
    │   ├── files_interface.py
    │   ├── s3_files_repository.py
    │   └── s3_models_repository.py
    ├── firebase_repository.py
    ├── model_repository.py
    ├── prompt_repository.py
    └── user_repository.py
    ```
 - **migrations**. This module contains the database migrations. It uses [Alembic](https://alembic.sqlalchemy.org/en/latest/)
    to handle migrations.


## Working with morpheus-data

Every time you modify the morpheus-data library, you can change the version of the library in the 
`pyproject.toml` file, in case you consider the changes to be significant. Then you must rebuild 
to generate the new wheel


### Add a new dependency
To include a new dependency in morpheus-data, you need to first add it to the `pyproject.toml` file. 
After that, you should rebuild the morpheus-data wheel. To do this, execute the following command:
```shell
docker compose build datalib
```

### Use morpheus-data as a service
To use `morpheus-data` image to run some process as run a test or run a migration, you must include a
`secret.env` file in the root of the service. This file must contain the following variables:
```shell
POSTGRES_USER=morpheus
POSTGRES_DB=morpheus
POSTGRES_PASSWORD=password
POSTGRES_HOST=postgres
POSTGRES_PORT=5432

# PGAdmin credentials
PGADMIN_DEFAULT_EMAIL=admin@admin.com
PGADMIN_DEFAULT_PASSWORD=admin

FIREBASE_PROJECT_ID=
FIREBASE_PRIVATE_KEY=
FIREBASE_CLIENT_EMAIL=
FIREBASE_WEB_API_KEY=

# AWS credentials
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=

# S3 BUCKETS ID
#------------------------
# Bucket name where images are stored
IMAGES_BUCKET=
# Bucket name where models are stored
MODELS_BUCKET=
# Bucket/Folder where temporal images are stored
IMAGES_TEMP_BUCKET=
```

You can use the `secrets.env` file used in the morpheus-server for ease of use.

For instance, to run a migration, you can execute the following command:
```shell
docker compose run --rm datalib alembic revision --autogenerate -m "Migration description"
```
and it needs to use the `secret.env` file to connect to the database.


### Add or modify a database model
To add or modify a database model, you must do the following:
- modify the `models.py` file
- create the migration
    ```shell
    docker compose run --rm datalib alembic revision --autogenerate -m "Migration description"
    ```
- apply the migration
    ```shell
    docker compose run --rm datalib alembic upgrade head
    ```
- build the morpheus-data wheel
    ```shell
    docker compose build datalib
    ```
- update and install the wheel in the service that uses it
    ```shell
    docker compose build <service>
    ```
  
### Add or modify a data schema
To add or modify a data schema, just modify the `schemas.py` file and build the wheel of
morpheus-data as well as update and install the wheel in the service that uses it.
```shell
docker compose build datalib
docker compose build <service>
```

### Add or modify a repository
To add or modify a repository, you must modify the corresponding files in the `repository` 
module or add a new file if necessary. Then you must build the morpheus-data wheel and 
install the wheel on the service that uses it.
```shell
docker compose build datalib
docker compose build <service>
```

## How to use morpheus-data
To use morpheus-data in another service, just import the library and use the modules you need,
since the library is installed when building the service. For example
```python
from morpheus_data.repository.user_repository import UserRepository
from morpheus_data.models import User
from morpheus_data.schemas import UserCreate
from morpheus_data.repository.firebase_repository import FirebaseRepository
from morpheus_data.repository.files.s3_files_repository import S3FilesRepository
```



