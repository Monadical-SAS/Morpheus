<h1>Morpheus<br/><sub>A WebApp to generate artwork with stable diffusion models.</sub></h1>

▶️ <a href="#quickstart">Quickstart</a> |
<a href="https://morpheus.monadical.io/">Demo</a> |
<a href="https://github.com/Monadical-SAS/Morpheus">GitHub</a> |
<a href="https://github.com/Monadical-SAS/Morpheus/wiki">Documentation</a> |
<a href="#background--motivation">Info & Motivation</a> |
<a href="https://github.com/Monadical-SAS/Morpheus/wiki/similar-projects">Similar Projects</a> |
<a href="https://github.com/Monadical-SAS/Morpheus/wiki/Roadmap">Roadmap</a>

<a href="https://github.com/Monadical-SAS/Morpheus/blob/master/LICENSE"><img src="https://img.shields.io/badge/Open_source-LGPL-green.svg?logo=git&logoColor=green"/></a>
<a href="https://github.com/Monadical-SAS/Morpheus/"><img src="https://img.shields.io/github/stars/Monadical-SAS/Morpheus.svg?logo=github&label=Stars&logoColor=blue"/></a>
<a href="https://github.com/Monadical-SAS/Morpheus/commits/main"><img src="https://img.shields.io/github/last-commit/Monadical-SAS/Morpheus.svg?logo=Sublime+Text&logoColor=green&label=active"/></a>
&nbsp;
<hr/>
</div>

**Morpheus is an open-source project that offers a creative and innovative platform for generating stunning artworks
using image editing and stable diffusion models.**


<div align="center">
<sub>. . . . . . . . . . . . . . . . . . . . . . . . . . . .</sub>
</div>

<br/>

## Key Features

- **Free & open source**, you can create your own server and keep your data
- **Powerful, modular design to support and load many models**
- **Several use cases supported**, we provide Image to image support, Controlnet and Pix2pix
- **Local Setup or Cloud**
- **Infrastructure as Code**, We also open source the infrastructure as code to run it on scale.

<br/><br/>

<div align="center">
<br/>
<img src="https://i.imgur.com/T2UAGUD.png" width="49%" alt="grass"/><img src="https://i.imgur.com/T2UAGUD.png" width="49%" alt="grass"/>
</div>

# Quickstart

**🖥&nbsp; Supported OSs:** Linux, macOS (M1-M2) &nbsp; **👾**

Prequisites:

> Morpheus uses Firebase for authentication: Generate a service account credentials JSON file in Firebase before
> starting.

> Install <a href="https://docs.docker.com/get-docker/">Docker</a>
> and <a href="https://docs.docker.com/compose/install/#install-using-pip">Docker Compose</a> on your system (if not
> already installed, skip if using k8s setup)
<br/>

```bash
# make sure you've installed docker: https://docs.docker.com/engine/install/
# and docker-compose: https://docs.docker.com/compose/install/
# you may also have to add your user to the docker group: https://docs.docker.com/engine/install/linux-postinstall/

# Clone the repository
git clone git@github.com:Monadical-SAS/Morpheus.git

# Move to the directory
cd Morpheus

# Create secrets file
cp -p morpheus-server/secrets.env.dist morpheus-server/secrets.env
cp -p morpheus-client/env.local.dist morpheus-client/.env.local

# Edit the secrets file with your values
nano morpheus-server/secrets.env
# Make sure to replace the firebase variables with the ones from the firebase-admin-dk.json file from your firebase account

# Build the docker images
docker-compose build
```

Follow one,

<details>
<summary><b><img src="https://user-images.githubusercontent.com/511499/117447182-29758200-af0b-11eb-97bd-58723fee62ab.png" alt="Docker" height="28px" align="top"/> <code>docker-compose</code></b>  (Linux/Nvidia GPU) &nbsp; <b>👈&nbsp; recommended</b> &nbsp; <i>(click to expand)</i></summary>
<br/>

```bash
# Run using the staging profile
docker-compose --profile=staging up
```

</details>

<details>
<summary><b><img src="https://user-images.githubusercontent.com/511499/117447182-29758200-af0b-11eb-97bd-58723fee62ab.png" alt="Docker" height="28px" align="top"/> <code>docker-compose</code></b>  (macOS/M1-M2)</summary>
<br/>

Update the environment variable for environment in `morpheus-server/secrets.env`

```shell
ENVIRONMENT=local-mps
```

Run the image locally if you have an M1/M2 Mac

```shell
# Make sure you don't have any other morpheus docker containers running or images built
docker-compose --file docker-compose-local-mps.yaml up
```

In a new terminal window, run the following commands to run the celery workers (for stable-diffusion and magic-prompt)
locally:

```shell
# Move to the morpheus-server directory
cd morpheus-server

# Install the dependencies
# If you encounter a problem with torch try installing torch first
# pipenv install torch && pipenv install
pipenv install

# Activate the virtual environment
pipenv shell

# And then run the celery locally in other terminals or in separate tabs within a terminal

# 1. Stable Diffusion worker
CELERY_BROKER_URL=redis://localhost:6379/0 CELERY_RESULT_BACKEND=redis://localhost:6379/0 celery -A app.celery.
workers.stable_diffusion_app worker --loglevel=info --max-tasks-per-child=1 --pool=threads -Q stable_diffusion

# 2.MagicPrompt worker 
CELERY_BROKER_URL=redis://localhost:6379/0 CELERY_RESULT_BACKEND=redis://localhost:6379/0 celery -A app.celery.
workers.magic_prompt_app worker --loglevel=info --max-tasks-per-child=1 --pool=threads -Q magic_prompt
```

</details>

</br>



The Morpheus client should be running at https://localhost:3000

### Installing models locally

#### Build model-script

If you are running this script for the first time or have made changes to it, you will need to perform a build:

```sh
docker compose --profile manage build

#or 

docker compose build model-script
```

Once you have completed the build process, you will be able to use it.

#### Stable diffusion models

In order to be able to use SD models and therefore Morpheus **locally**, they must first be downloaded and
registered in the database:

```bash
# Only at first time
mkdir morpheus-server/tmp

# register models specified in morpheus-server/scripts/models/models-info.yaml
docker compose run --rm model-script upload local sdiffusion
```

This script allows you to download the models on your local machine (`morpheus-server/tmp`) and register them in the S3
bucket and in the database. Note that *you need to have the project running to be able to do the database registration*.

In case that model is already registered on database, this command allows you update the register on it. If you want
only interact with the database, you can run this command to update the register:

```bash
docker compose run --rm model-script db update local sdiffusion
```

You only need to change the information in yaml file in order to update the information in db.

If you want to add a new model, you only need to add its information in the
file [models-info.yaml](./morpheus-server/scripts/models/models-info.yaml)

#### ControlNet models

In order to use ControlNet **locally**, you need to download and register the model in the application:

```bash
# register models specified in morpheus-server/scripts/models/controlnet-models-info.yaml
docker compose run --rm model-script upload local controlnet
```

ControlNet models will also be downloaded to the directory `morpheus-server/tmp`. If you want to add a new model, you
only
need to add its information in the
file [controlnet-models-info.yaml](./morpheus-server/scripts/models/controlnet-models-info.yaml)

In the same way, if model is already registered on database, this command allows you update the register on it. If you
want only interact with the database, you can run this command to update the register:

```bash
docker compose run --rm model-script db update local controlnet
```

You only need to change the information in yaml file in order to update the information in db.

#### MagicPrompt model

In order to use MagicPrompt **locally**, you need to download and upload the model to the S3 bucket:

```bash
# register models specified in morpheus-server/scripts/models/magicprompt-models-info.yaml
docker compose run --rm model-script upload local magicprompt
```

MagicPrompt model will also be downloaded to the directory `morpheus-server/tmp`. If you want to add a new model, you
only
need to add its information in the
file [magicprompt-models-info.yaml](./morpheus-server/scripts/models/magicprompt-models-info.yaml)

For more information about this script, you can read the [README](./morpheus-server/scripts/models/README.md).

## Development

### Running the backend tests

```shell
# Running all the tests
docker compose run --rm api pytest

# Running a specific test
docker compose run --rm api pytest tests/test_module.py

# Running a specific test function
docker compose run --rm api pytest tests/test_module.py::test_function
```

### Running the migrations

```shell
# Create migration
docker-compose run --rm api alembic revision --autogenerate -m "Initial migration"

# Migrate / Update the head
docker-compose run --rm api alembic upgrade head
```

### PG admin

PGadmin is available in: localhost:8002

The user and password must be added in secrets.env file.

```
# example values
PGADMIN_DEFAULT_EMAIL=admin@admin.com
PGADMIN_DEFAULT_PASSWORD=password
```

### Adding a new dependency to the backend

```shell
# Add a new dependency to the requirements.txt file
docker-compose run --rm api pipenv install <dependency>

# Update the lock file
docker-compose run --rm api pipenv lock 

# Update the docker image
docker-compose build api

# Run the image
docker-compose up
```

Or in case you are using the pipenv command directly, you can update the dependencies as follows (in the
morpheus-server directory):

```shell
# Add a new dependency
pipenv install <dependency>

# Update the lock file
pipenv lock

# Update the requirements.txt
jq -r '.default | to_entries[] | .key + .value.version' Pipfile.lock > requirements.txt

```

**Note:** This project doesn't use requirements.txt to manage dependencies. requirements.lint.txt is only used for using
cache in ci workflow linting job.

### Adding a new dependency to the frontend

```shell
# Add a new dependency to the npm package.json file
docker-compose run --rm client yarn install <dependency>

# Update the docker image
docker-compose build client

# Run the image
docker-compose up
```

### Add new diffusion models

To add/list/delete models, you can use the script found in morpheus server directory:  `scripts/models/cli.py` and the
file `scripts/models/models-info.yaml`

```bash
# To show the help
docker compose run --rm model-script --help

# To add/update a new model
docker compose run --rm model-script upload <server> <target>

# To list content of S3 bucket
docker compose run --rm model-script s3 list

# To list content of db from a specific api server
docker compose run --rm model-script db list <server> --target <target>

# To add models to the s3 bucket
docker compose run --rm model-script s3 register <target>

# To add model to the db of a specific api server
docker compose run --rm model-script db register <server> <target>

# To update model in the db of a specific api server
docker compose run --rm model-script db update <server> <target>

# To delete a model from s3, db and local
docker compose run --rm model-script delete <model-source> --api-server <server> --target <target>

# To delete a model from s3
docker compose run --rm model-script s3 delete <model-source>

# To delete a model from db of a specific api server
docker compose run --rm model-script db delete <model-source> <server> --target <target>

```

### Running without GPU (this returns fixed fake images from the models)

```shell
# Build the docker image if you don't have gpu
docker-compose --profile=local build

# Run the image locally if you don't have gpu
docker-compose --profile=local up
```

### Adding a new feature

If you want to add a new feature, you should follow the next steps:

- Choose an issue from the [issues list](https://github.com/Monadical-SAS/Morpheus/issues) or create a new one
- Assign yourself to the issue
- Create a new branch from the main branch
- Make your changes
- Write tests for your changes
- Make sure to run the QA tools and the tests
- Push your changes
- Create a pull request
- If the pull request includes frontend changes, you should also upload some screenshots of the changes
- Request a review from a team member

### Important

Before pushing your changes, make sure to run the QA tools and the tests

```bash
# Run the QA tools
docker-compose run --rm api flake8 --max-line-length 120 --exclude app/migrations/ .
docker-compose run --rm api black --line-length 120 --exclude app/migrations/ .
  
# Run the tests
docker-compose run --rm api pytest
```

If all the checks pass, you can push your changes

## See also

[Backend documentation](./morpheus-server/README.md)  
[Frontend documentation](./morpheus-client/README.md)

# Production Setup

## Configuring k8s cluster

Some templates have been included to help create the Kubernetes cluster and the necessary infrastructure. For additional
configuration documentation, please refer to
this [link](https://github.com/Monadical-SAS/Morpheus/tree/main/infra/modules).

To configure Terraform, please follow these steps:

* Create a new SSL certificate using the ACM (Amazon Certificate Manager) service in AWS to obtain the ARN (Amazon
  Resource Name). Remember to save the ARN for the next steps.
* Create a DB secret using the "Secrets Manager" service in the AWS console. The secret should be an "Other type of
  secret". The value must be in this format: ```{"username":"username","password":"xxxxxxxxxxxxxxxxx"}```. Save the
  secret name for the next steps.
* Create a terraform.tfvars file in the ./infra/envs/staging/ folder with the information obtained from your AWS
  account. Use the ARN for the <em>arn_ssl_certificate_cf_distribution</em> field and the DB secret name for <em>
  db_password_secret_manager_name</em>. Additionally, update cname_frontend with a domain that you manage.

```
AWS_ACCESS_KEY = ""
AWS_SECRET_KEY = ""
ACCOUNT_ID = "xxxxxxxxxxx"
db_password_secret_manager_name = "morpheus_db_password"
arn_ssl_certificate_cf_distribution = "arn:aws:acm:us-east-1:xxxxxxxxxxxxx:certificate/xxxxxxxx-xxxx-xxxx-xxxxx-xxxxxxxxxxxx"
cname_frontend = "morpheus.web.site"
vpc_cidr = "172.21.0.0/16"
vpc_public_subnets = ["172.21.0.10/24", "172.21.0.11/24"]
vpc_private_subnets = ["172.21.0.12/24", "172.21.0.13/24"]
db_allocated_storage = 20
self_managed_gpu_nodes_device_size = 30
region = "us-east-1"
```

To manage Terraform backends, follow these steps:

* Create an S3 bucket to manage the Terraform backends.
* Create a backend.conf file in ./infra/envs/staging/ based on backend.conf.dist. Make sure to update the route if you
  prefer to use a different one.

```conf
bucket = "morpheus-infra-backend"
key = "env/staging/infra/state.tfstate"
region = "us-east-1"
```

* Create the cluster:

```bash
cd ./infra/envs/staging
terraform init -backend-config=backend.conf
# write yes to apply changes
terraform apply
```

* Save the Terraform outputs to a separate file.
* Create a kubectl configuration file to access the cluster. Use the Terraform outputs to complete the arguments for the
  region and cluster name.

```bash
aws eks --region us-east-1 update-kubeconfig --name cluster-name-from-outputs
```

### Installing helm charts - Nginx ingress

* Create a backend.conf file in the ./infra/charts/staging/ folder based on the backend.conf.dist file provided.

```
bucket = "morpheus-infra-backend"
key = "env/staging/charts/state.tfstate"
region = "us-east-1"
```

* Create a terraform.tfvars file in the ./infra/envs/staging/ folder that includes the path to your Kubernetes
  configuration.

```
kubeconfig_path = "/home/user/.kube/config"
```

* To apply the Ingress Helm chart (this step should be performed after creating the cluster):

```bash
cd ./infra/test/eks-charts
terraform init -backend-config=backend.conf
# write yes to apply changes
terraform apply
```

### Creating secrets

create a file called morpheus-secrets.yaml based on ./infra/tools/k8s/morpheus-secrets.yaml.example.
Make sure to update the values with the secrets that are coded in base64.

```bash
# To code for example POSTGRES_USER
echo -n "dbpassword" | base64 -w 0
```

```yaml
apiVersion: v1
kind: Secret
metadata:
  name: morpheus-secret
type: Opaque
data:
  POSTGRES_USER: XXXXXXX=
  POSTGRES_DB: XXXXXXX=
  POSTGRES_PASSWORD: XXXXXX=
  POSTGRES_HOST: XXXXXXX=
  FIREBASE_PROJECT_ID: XXXXXX=
  FIREBASE_PRIVATE_KEY: XXXXXXX=
  FIREBASE_CLIENT_EMAIL: XXXXXXX=
  AWS_ACCESS_KEY_ID: XXXXXXX=
  AWS_SECRET_ACCESS_KEY: XXXXXXX=
  SENTRY_DSN: XXXXXXX=
  FLOWER_ADMIN_STRING: XXXXXXX
  IMAGES_BUCKET: XXXXXXX
  IMAGES_TEMP_BUCKET: XXXXXXXXX
  MODELS_BUCKET: XXXXXXX
```

Apply secrets:

```
kubectl apply -f morpheus-secrets.yaml
```

To enable the pulling and pushing of images to your registry, create a secret called regcred for Docker credentials.

```bash
# https://kubernetes.io/docs/tasks/configure-pod-container/pull-image-private-registry/
kubectl create secret docker-registry regcred --docker-server=https://index.docker.io/v1/ --docker-username=dockeruser --docker-password=xxxxxxxxxxxxxxxxx --docker-email=xxxxxxxxxxxxxxxxxxx
```

### Install nvidia plugin for k8s

Apply the nvidia plugin.

```bash
kubectl create -f https://raw.githubusercontent.com/NVIDIA/k8s-device-plugin/v0.13.0/nvidia-device-plugin.yml
```

## Run with supervisor

```bash
# In repo directory
mkdir -p data/logs

sudo supervisortctl reread
sudo supervisortctl update
```

This starts all supervisor services automatically

### Start/Stop/Status check with supervisor

```bash
# To check status
sudo supervisorctl status 

# To start stable-diffusion-webui
sudo supervisorctl start stablediffusion

# To stop stable-diffusion-webui
sudo supervisorctl stop stablediffusion
docker compose down
```

When using the stop instruction, you need to down the containers manually using docker compose because supervisor can't
handle docker
processes, only start and check that the service is running

# CI/CD configuration

The platform currently uses GitHub Actions for deployment. To integrate this with your custom project, you should set
the following secrets in GitHub:

AWS access variables:

- AWS_ACCESS_KEY_ID: Aws credential
- AWS_SECRET_ACCESS_KEY: Aws credential
- AWS_CLUSTER_NAME: Name of the eks cluster. This is used to generate the kube config.
- AWS_REGION: Aws region where is located the eks cluster. Eg. us-east-1

Cloudflare tokens to clear the cache:

- CLOUDFLARE_API_TOKEN
- CLOUDFLARE_ZONE_ID

Dockerhub tokens to push and pull images in the deploy process:

- DOCKER_HUB_TOKEN
- DOCKER_HUB_USER

Firebase configuration:

- FIREBASE_CLIENT_EMAIL
- FIREBASE_PRIVATE_KEY
- FIREBASE_PROJECT_ID

Other infra configuration:

- FRONTEND_DOMAIN: Platform domain (Eg. morpheus.com)

Sentry configuration:

- SENTRY_AUTH_TOKEN
- SENTRY_ENV
- SENTRY_ORG
- SENTRY_PROJECT
- SENTRY_URL

Monorepo configuration:

- CICD_REPO_PATH: Repo path in the GitHub actions runner. Usually the repo name. E.g.
  /home/runner/work/Morpheus/Morpheus

# How to collaborate

### Forking the Repository

* Go to the Morpheus's GitHub repository.
* Click on the "Fork" button in the top-right corner of the repository page.
* This will create a copy of the repository under your GitHub account.

### Cloning the Forked Repository

* On your GitHub account, navigate to the forked repository.
* Click on the "Code" button and copy the repository URL.
* Clone the repository locally

### Adding an Upstream Remote

Change to the repository directory using cd.

```
git remote add upstream https://github.com/Monadical-SAS/Morpheus.git
```

### Creating a New Branch for your changes

### Create a Pull request

* Go to the original project's GitHub repository.
* Create a new PR selecting your forked repository and the branch containing your changes.

### Updating Your Fork with Upstream Changes:

* Fetch the upstream repository changes using the git fetch command.

```
git fetch upstream
```

* Switch to your local main branch using git checkout main and merge the upstream changes into your local main branch
  using git merge.

```
git merge upstream/main
```

* Push the updated changes to your forked repository on GitHub using git push.

```
git push origin main
```

