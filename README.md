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

- **Freedom & Open Source**: Create your personal server and maintain complete control over your data.
- **Robust & Modular Design**: Our design supports and loads multiple models with ease.
- **Versatility**: We offer Image-to-Image support, Controlnet, and Pix2pix among other use cases.
- **Local or Cloud Setup**: Choose the setup that suits your needs best.
- **Infrastructure as Code**: We've open-sourced our infrastructure code to facilitate scalability.

<br/><br/>

<div align="center">
<br/>
<img src="https://i.imgur.com/T2UAGUD.png" width="49%" alt="grass"/><img src="https://i.imgur.com/T2UAGUD.png" width="49%" alt="grass"/>
</div>

# Quickstart

**🖥&nbsp; Supported OSs:** Linux, macOS (M1-M2) &nbsp; **👾**

## Prequisites:
Before starting, ensure you have the following:
1. **Firebase account**: You need a Firebase account for this setup. If you don't have one, create it and generate a service account credentials JSON file. This file will be used later in the setup process.
2. **Docker & Docker Compose**: Both Docker and Docker-Compose should be installed on your system. If not installed yet,
  you can download Docker from <a href="https://docs.docker.com/get-docker/">here</a> and Docker-Compose from  <a
  href="https://docs.docker.com/compose/install/#install-using-pip">here</a>. Skip this step if you're using a
  Kubernetes setup.
3. **Hardware**: The hardware requirements for this setup will vary depending on the specific application that you are developing. However, it is generally recommended to have a machine with at least 16 GB of RAM and a GPU with 16 GB of VRAM. If you don't have a GPU, you can use a cloud
  provider like AWS, GCP, or Azure. Skip this step if you're using a Kubernetes setup.
<br/>

## Setup Steps

**Step 1: Verify that Docker is installed and running**

Ensure that Docker and Docker-Compose are installed on your system. If not, install them using the links above. For
Linux users, you might also need to add your user to the docker group. For more information, see the <a href="https://docs.docker.com/engine/install/linux-postinstall/">Docker
documentation</a> for more details.

**Step 2: Clone the repository**

Clone the repository to your local system using the command below:

```bash
git clone git@github.com:Monadical-SAS/Morpheus.git
```
**Step 3: Navigate to the Morpheus directory**

Change your current directory to the cloned repository:

```bash
cd Morpheus
```


**Step 4: Create a secrets file**

Create the secrets file by copying the distributed `.env` files:

```bash
cp -p morpheus-server/secrets.env.dist morpheus-server/secrets.env
cp -p morpheus-client/env.local.dist morpheus-client/.env.local
cp -p morpheus-client/env.local.dist morpheus-admin/.env.local
```

**Step 5: Edit the `morpheus-server/secrets.env` file with your values**

This step involves editing the `secrets.env` file to provide the application with the necessary secrets to connect to
the database, Firebase, AWS, and other services.

**Parameters:**

* `POSTGRES_USER`: The username for the PostgreSQL database.
* `POSTGRES_DB`: The name of the PostgreSQL database.
* `POSTGRES_PASSWORD`: The password for the PostgreSQL database.
* `POSTGRES_HOST`: The hostname or IP address of the PostgreSQL database server.
* `POSTGRES_PORT`: The port number of the PostgreSQL database server.
* `PGADMIN_DEFAULT_EMAIL`: The email address for the PGAdmin default user.
* `PGADMIN_DEFAULT_PASSWORD`: The password for the PGAdmin default user.
* `FIREBASE_PROJECT_ID`: The ID of your Firebase project.
* `FIREBASE_PRIVATE_KEY`: The private key for your Firebase project.
* `FIREBASE_CLIENT_EMAIL`: The client email for your Firebase project.
* `FIREBASE_WEB_API_KEY`: The web API key for your Firebase project.
* `AWS_ACCESS_KEY_ID`: The access key ID for your AWS account.
* `AWS_SECRET_ACCESS_KEY`: The secret access key for your AWS account.
* `IMAGES_BUCKET`: The name of the S3 bucket where images are stored.
* `MODELS_BUCKET`: The name of the S3 bucket where models are stored.
* `IMAGES_TEMP_BUCKET`: The name of the S3 bucket where temporary images are stored.
* `ENVIRONMENT`: The environment where the application is running. This can be `local`, `staging`, or `production`.

**Instructions:**

1. Open the `secrets.env` file in your preferred text editor.
2. Replace all content with the following:


```bash
POSTGRES_USER=morpheus
POSTGRES_DB=morpheus
POSTGRES_PASSWORD=password
POSTGRES_HOST=postgres
POSTGRES_PORT=5432

# PGAdmin credentials
PGADMIN_DEFAULT_EMAIL=admin@admin.com
PGADMIN_DEFAULT_PASSWORD=admin

FIREBASE_PROJECT_ID="XXXXXXX="
FIREBASE_PRIVATE_KEY="XXXXXXX="
FIREBASE_CLIENT_EMAIL="XXXXXXX="
FIREBASE_WEB_API_KEY="XXXXXXX="

# AWS credentials
AWS_ACCESS_KEY_ID=XXXXXXX=
AWS_SECRET_ACCESS_KEY=XXXXXXX=

# S3 BUCKETS ID
#------------------------
# Bucket name where images are stored
IMAGES_BUCKET="XXXXXXX="
# Bucket name where models are stored
MODELS_BUCKET="XXXXXXX="
# Bucket/Folder where temporal images are stored
IMAGES_TEMP_BUCKET="ßXXXXXXX="

# App config
ENVIRONMENT="local"
```
3. Update the values with your own.
4. Save the file.

Once you have updated the `secrets.env` file, the application will be able to connect to the database, Firebase, AWS,
and other services using the secrets that you provided.

**Step 6. Edit the `morpheus-client/.env.local` and `morpheus-admin/.env.local` files with your values**

This step involves editing the `.env.local` files in the `morpheus-client` and `morpheus-admin` directories to provide
the client application with the necessary values to connect to the backend API, Firebase, and other services.

**Parameters:**

* `NEXT_PUBLIC_API_URL`: The URL of the backend API.
* `NEXT_PUBLIC_FIREBASE_CONFIG`: The Firebase configuration for your Firebase project. This can be found in the
  Firebaase console.
* `NEXT_TELEMETRY_DISABLED`: A boolean value indicating whether to disable telemetry.
* `NEXT_PUBLIC_BACKEND_V2_GET_URL`: The URL of the Excalidraw backend v2 GET endpoint.
* `NEXT_PUBLIC_BACKEND_V2_POST_URL`: The URL of the Excalidraw backend v2 POST endpoint.
* `NEXT_PUBLIC_LIBRARY_URL`: The URL of the Excalidraw libraries page.
* `NEXT_PUBLIC_LIBRARY_BACKEND`: The URL of the Excalidraw library backend.
* `NEXT_PUBLIC_WS_SERVER_URL`: The URL of the WebSocket server.
* `NEXT_PUBLIC_GOOGLE_ANALYTICS_ID`: The Google Analytics ID for the client application.
* `FAST_REFRESH`: A boolean value indicating whether to enable Fast Refresh.

**Instructions:**

1. Open the `.env.local` file in your preferred text editor.
2. Replace all content with the following:

```bash
# API CONFIG
NEXT_PUBLIC_API_URL=http://localhost:8001

# Firebase configuration
NEXT_PUBLIC_FIREBASE_CONFIG='{"apiKey":"XXXXXXXXXXXX","authDomain":"xxxxxxxxxx.firebaseapp.com","projectId":"xxxxxxx","storageBucket":"xxxxxx.appspot.com","messagingSenderId":"123456789","appId":"1:123456789:web:xxxxxx","measurementId":"G-XXXXXXXXXX"}'

# NEXT CONFIG
NEXT_TELEMETRY_DISABLED=1

# EXCALIDRAW CONFIG
NEXT_PUBLIC_BACKEND_V2_GET_URL=https://json-dev.excalidraw.com/api/v2/
NEXT_PUBLIC_BACKEND_V2_POST_URL=https://json-dev.excalidraw.com/api/v2/post/
NEXT_PUBLIC_LIBRARY_URL=https://libraries.excalidraw.com
NEXT_PUBLIC_LIBRARY_BACKEND=https://us-central1-excalidraw-room-persistence.cloudfunctions.net/libraries
NEXT_PUBLIC_WS_SERVER_URL=ws://localhost:3002
NEXT_PUBLIC_GOOGLE_ANALYTICS_ID=G-XXXXXXXXXX
FAST_REFRESH=false
```
3. Update the values with your own.
4. Save the file.

Once you have updated the `.env.local` file, the client application will be able to connect to the backend API, Firebase, and other services using the values that you provided.

**Step 7. Run the Morpheus project**

To run the Morpheus project, execute the following command:
```bash
docker compose up
```

The Morpheus project will be running on your local machine at localhost:3000 (client), localhost:3001 (admin), and
localhost:8001 (api). Morpheus use an model for default, you can change puede hacerlo desde el panel de administración

# Development

## Running the backend tests
* To run all the tests: `docker compose run --rm api pytest`.
* To run a specific test: `docker compose run --rm api pytest tests/«test_module».py`.
* To run a specific test function: `docker compose run --rm api pytest tests/«test_module».py::«test_function»`.


## Running the migrations
To use `morpheus-data` image to run the migrations, you need to create a secrets.env file in the morpheus-server 
directory. For more information, you can read the morpheus-data [README](./morpheus-data/README.md).

* To create a migration: 
```bash
docker compose run --rm datalib alembic revision --autogenerate -m "Initial migration"
```
* To migrate or update to the head:
```bash
docker compose run --rm datalib alembic upgrade head
```

## PG admin
PGadmin is available in: localhost:8002. The user and password must be added in secrets.env file.

### example values
```
PGADMIN_DEFAULT_EMAIL=admin@admin.com
PGADMIN_DEFAULT_PASSWORD=password
```

### Implement changes in morpheus-data

`morpheus-data` is a Python library that provides a unified interface for managing all ORM-related operations in Morpheus. Other Morpheus microservices can import and use it.

To run Morpheus locally using `morpheus-data` as a library:

```bash

# Building in separate steps
#---------------------------------------------
# build morpheus-data wheel
docker compose build datalib

# build morpheus-server api
docker compose build api

# Building alltogether
#---------------------------------------------
docker compose build

# Run
#---------------------------------------------
docker compose up
```

**Note**: You need to build `morpheus-data` and the `morpheus-server` API service (or any other microservice that uses it) every time you make a change to `morpheus-data`. This is necessary because you need to rebuild the wheel file and install it in the `morpheus-server` API service or any other service that uses it. For more information, see the `morpheus-data` [README](./morpheus-data/README.md).


### Adding a new dependency to the backend

1. Add the new dependency directly to the respective `requirements.txt` file.
2. Update the docker image: `docker compose build api`.
3. Run the image: `docker compose up`.

**Note:** This project uses `requirements.lint.txt` only for caching in CI workflow linting job.

### Adding a new dependency to the frontend

```shell
# Add a new dependency to the npm package.json file
yarn install <dependency>

# Update the docker image
docker compose build client

# Run the image
docker compose up
```

### Add new diffusion models
There are two ways to add new diffusion models to Morpheus:
* Using the admin panel
* Using the command-line interface (CLI)

**Using the admin panel**

To use the admin panel, go to localhost:3001. For more details on how to use the admin panel, see
[here](https://github.com/Monadical-SAS/Morpheus/wiki/Morpheus-Admin-webUI).

**Using the CLI**

To use the CLI, you must first build the Morpheus server:

```bash
docker compose --profile manage build

#or 

docker compose build model-script
```

Once the `model-script` is built, you can use the `morpheus-server/scripts/models/cli.py` script to add, list, and delete models. You can also use the `morpheus-server/scripts/models/models-info.yaml` file to specify information about the models.

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

To use the admin panel, go to localhost:3001. For more details on how to use the admin panel, see
[here](https://github.com/Monadical-SAS/Morpheus/wiki/Morpheus-Admin-CLI).

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
docker compose run --rm api flake8 --max-line-length 120 --exclude app/migrations/ .
docker compose run --rm api black --line-length 120 --exclude app/migrations/ .
  
# Run the tests
docker compose run --rm api pytest
```

If all the checks pass, you can push your changes

# Production Setup

## Configuring k8s cluster

Some templates have been included to help create the Kubernetes cluster and the necessary infrastructure. For more information on configuration, see this link: [link](https://github.com/Monadical-SAS/Morpheus/tree/main/infra/modules).

To configure Terraform, please follow these steps:

* Create a new SSL certificate using the ACM (Amazon Certificate Manager) service in AWS to obtain the ARN (Amazon
  Resource Name). This certificate will be used to secure the Morpheus web application. The ARN (Amazon Resource Name) of the certificate is a unique identifier that you will need in the next step.
* Create a DB secret using the "Secrets Manager" service in the AWS console. The secret should be an "Other type of
  secret". The value must be in this format: `{"username":"username","password":"xxxxxxxxxxxxxxxxx"}`. Save the
  secret name for the next steps.
* Create a terraform.tfvars file in the `./infra/envs/staging/` folder with the information obtained from your AWS
  account. Use the ARN for the <em>arn_ssl_certificate_cf_distribution</em> field and the DB secret name for <em>
  db_password_secret_manager_name</em>. Additionally, update `cname_frontend` with a domain that you manage. Here is an example:

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
where:

* `AWS_ACCESS_KEY` and `AWS_SECRET_KEY` are your AWS credentials. You can obtain these credentials from the AWS Management Console.
* `ACCOUNT_ID` is your AWS account ID. You can find this information in the AWS Management Console.
* `db_password_secret_manager_name` is the name of the DB secret that you created in step 2.
* `arn_ssl_certificate_cf_distribution` is the ARN of the SSL certificate that you created in step 1.
* `cname_frontend` is the domain name that you want to use for the Morpheus web application.
* `vpc_cidr` is the CIDR block for the VPC that Terraform will create.
* `vpc_public_subnets` and `vpc_private_subnets` are the CIDR blocks for the public and private subnets that Terraform will create.
* `db_allocated_storage` is the size of the EBS volume that Terraform will create for the Morpheus database.
* `self_managed_gpu_nodes_device_size` is the size of the GPU for the self-managed GPU nodes that Terraform will create.
* `region` is the AWS region where you want to create the Kubernetes cluster and the necessary infrastructure.


To manage Terraform backends, follow these steps:

1. Create an S3 bucket to manage the Terraform backends.
2. Create a backend.conf file in ./infra/envs/staging/ based on backend.conf.dist. Make sure to update the route if you
  prefer to use a different one.

```conf
bucket = "morpheus-infra-backend"
key = "env/staging/infra/state.tfstate"
region = "us-east-1"
```

3. Create the cluster:
* Navigate to the ./infra/envs/staging directory. This is where the Terraform configuration files for the staging environment are located.
```bash
cd ./infra/envs/staging
```
* Initialize Terraform. This command will download the necessary modules and providers.
```bash
terraform init -backend-config=backend.conf
```
* Apply the Terraform configuration. This command will create the Kubernetes cluster and the necessary infrastructure. You will be prompted to confirm the changes before they are applied.
```bash
terraform apply
```
* Save the Terraform outputs to a separate file.
```bash
terraform output > outputs.tfvars
```
The Terraform outputs are the values of the variables that Terraform created when it applied the configuration. These values can be useful for configuring other applications, such as kubectl.
Saving the outputs to a file will make it easy to access them in the next step, when you create the kubectl configuration file.

* Create a kubectl configuration file to access the cluster. Use the Terraform outputs to complete the arguments for the
  region and cluster name.

```bash
aws eks --region us-east-1 update-kubeconfig --name cluster-name-from-outputs
```
* The kubectl configuration file is used to tell kubectl how to connect to the Kubernetes cluster.
* The aws eks update-kubeconfig command will create a kubectl configuration file for the specified cluster in the specified region.
* You will need to replace cluster-name-from-outputs with the name of the Kubernetes cluster that was created by Terraform.
Once you have completed these steps, you will be able to use kubectl to manage the Kubernetes cluster.

### Installing helm charts - Nginx ingress

1. Create a backend.conf file in the ./infra/charts/staging/ folder based on the backend.conf.dist file provided.

```
bucket = "morpheus-infra-backend"
key = "env/staging/charts/state.tfstate"
region = "us-east-1"
```

2. Create a terraform.tfvars file in the ./infra/envs/staging/ folder that includes the path to your Kubernetes
  configuration.

```
kubeconfig_path = "/home/user/.kube/config"
```

3. To apply the Ingress Helm chart (this step should be performed after creating the cluster):

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

where:
* `apiVersion`: This field specifies the version of the Kubernetes API that the secret is compatible with. In this case, the secret is compatible with Kubernetes API version 1.
* `kind`: This field specifies the type of object that the manifest represents. In this case, the manifest represents a secret object.
* `metadata`: This field contains information about the secret, such as its name and labels. The name field is required and must be unique within the namespace where the secret is created.
* `type`: This field specifies the type of secret. In this case, the secret is an Opaque secret. Opaque secrets are used to store sensitive data that should be encrypted at rest.
* `data`: This field contains the secret data. The data is stored as a map of key-value pairs. The keys must be unique and the values can be any type of data.
The following are the secrets that are stored in the morpheus-secret:

* `POSTGRES_USER`: The username for the PostgreSQL database.
* `POSTGRES_DB`: The name of the PostgreSQL database.
* `POSTGRES_PASSWORD`: The password for the PostgreSQL database.
* `POSTGRES_HOST`: The hostname or IP address of the PostgreSQL database server.
* `FIREBASE_PROJECT_ID`: The ID of the Firebase project.
* `FIREBASE_PRIVATE_KEY`: The private key for the Firebase project.
* `FIREBASE_CLIENT_EMAIL`: The client email address for the Firebase project.
* `AWS_ACCESS_KEY_ID`: The AWS access key ID.
* `AWS_SECRET_ACCESS_KEY`: The AWS secret access key.
* `SENTRY_DSN`: The Sentry DSN.
* `FLOWER_ADMIN_STRING`: The Flower admin string.
* `IMAGES_BUCKET`: The name of the S3 bucket where the Morpheus images are stored.
* `IMAGES_TEMP_BUCKET`: The name of the S3 bucket where the Morpheus temporary images are stored.
* `MODELS_BUCKET`: The name of the S3 bucket where the Morpheus models are stored.

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

# CI/CD configuration

The platform currently uses GitHub Actions for deployment. To integrate this with your custom project, you should set
the following secrets in GitHub:

AWS access variables:

- `AWS_ACCESS_KEY_ID`: Your AWS access key ID.
- `AWS_SECRET_ACCESS_KEY`: Your AWS secret access key.
- `AWS_CLUSTER_NAME`: The name of your EKS cluster.
- `AWS_REGION`: The AWS region where your EKS cluster is located.

Cloudflare tokens to clear the cache:

- `CLOUDFLARE_API_TOKEN`:Your Cloudflare API token.
- `CLOUDFLARE_ZONE_ID`:The ID of your Cloudflare zone.

Dockerhub tokens to push and pull images in the deploy process:

- `DOCKER_HUB_TOKEN`:Your Dockerhub token.
- `DOCKER_HUB_USER`:Your Dockerhub username.

Firebase configuration:

- `FIREBASE_CLIENT_EMAIL`:Your Firebase client email address.
- `FIREBASE_PRIVATE_KEY`:Your Firebase private key.
- `FIREBASE_PROJECT_ID`:Your Firebase project ID.

Other infra configuration:

- FRONTEND_DOMAIN: Platform domain (Eg. morpheus.com)

Sentry configuration:

- `SENTRY_AUTH_TOKEN`:Your Sentry authentication token.
- `SENTRY_ENV`: The Sentry environment name.
- `SENTRY_ORG`:The Sentry organization name.
- `SENTRY_PROJECT`:The Sentry project name.
- `SENTRY_URL`:The Sentry URL.

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

### Commit style

To enhance collaboration, we have adopted the conventional commit specification to facilitate the creation of an "explicit commit history." This practice not only assists in achieving a clearer understanding of changes made but also streamlines the release process for Morpheus versions.

Some examples:

* feat: Implement user authentication feature
* fix: Resolve issue with data not saving correctly
* chore: Update dependencies to latest versions
* docs: Add documentation for API endpoints
* refactor: Simplify code structure for improved readability
* test: Add unit tests for new validation logic
* style: Format code according to style guidelines
* perf: Optimize database queries for faster performance

For additional information see: [conventional commits](https://www.conventionalcommits.org/)

