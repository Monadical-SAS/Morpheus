# Morpheus CLI

This is the command line interface (CLI) for Morpheus. It's a tool to help you to try Morpheus locally without the need
to run the client.

To use it, you'll need to install the dependencies, activate a virtual environment, update the env vars, and run the
scripts. Let's start!

First, make sure you are in the right directory:

```bash
cd Morpheus/morpheus-server/scripts
```

## Install the Dependencies

To using the CLI, you'll need the next dependencies:

* requests
* typer
* pydantic
* rich
* python-dotenv
* loguru
* flake8
* typing-extensions

To install the dependencies, you can run the following command:

```bash
pipenv install
```

And then activate the virtual environment:

```bash
pipenv shell
```

## Adding the environment variables

Now, let's add the environment variables. You can do by copying the `cli.env.dist` file and rename it to `.env`:

```bash
cp cli.env.dist .env
```

And then, you can edit the file and add the values for the variables.

```bash
MORPHEUS_USERNAME=yourmorpheususer@morpheus.com
MORPHEUS_PASSWORD=yourmorpheuspassword123

FIREBASE_API_KEY=your_firebase_api_key
FIREBASE_AUTH_URL=https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword

IMAGE_HEIGHT=768
IMAGE_WIDTH=768

# API Base URL
BASE_URL=http://localhost:8001
# BASE_URL=https://api-morpheus.monadical.io
```

## Running the scripts

Before running the scripts, you'll need to have the Morpheus backend running. You can do it by following the
instructions in the [Morpheus README](https://github.com/Monadical-SAS/Morpheus/blob/main/README.md), or simply by
running the next command:

```bash
docker-compose --profile <local | local-mps | staging> up
```

Once you have the backend running, you can run one of the following commands:

### Text to Image - Text2Img

Generate an image from a text prompt:

```bash
python3 morpheus_cli.py text2img "A dog sitting on a tree stump"
```

### Image to Image - Img2Img

Generate an image from an image and a prompt:

```bash
python3 morpheus_cli.py img2img "A dog surrounded by flowers" images/dog.png
```

### Pix2Pix

Image-to-Image Translation with Conditional Adversarial Networks

```bash
python3 morpheus_cli.py pix2pix "Turn the dog into a chiwawa" images/dog.png
```

### Inpainting

Given an image, an image mask, and a prompt, regenerate only a specific portion of the image.

```bash
python3 morpheus_cli.py inpaint "Add a cat to the park bench" images/dog.png images/mask.png
```

### Upscaling

Given an image, and a prompt, regenerate the image with a higher resolution.

```bash
python3 morpheus_cli.py upscale "A white cat" images/lr_cat.png
```

## Check for the results

After running one of the previous commands, one or more files named [UUID].png will be generated in the
Morpheus/bin/output directory, containing the resulting image(s) from the generation process.

## Stress Test

We have also added a couple of commands to run stress tests on the image generation. These stress tests make API calls
to Morpheus, in order to enqueue multiple requests in Celery and see how the application behaves under the requested
load.

To run the stress tests from the command line interface (CLI), you can use one of the following options:

### Standard stress tests

These types of tests use the same model configuration in each request and make calls to the text2img endpoint to
generate a single image in standard configuration.

You can run the standard stress tests with the following command:

```shell
python3 stress_cli.py stress <num_requests: int>

# Example
python3 stress_cli.py stress 10
```

### Random stress tests

These types of tests make requests with random configurations to the Sdiffusion API, using the different options
available, such as text2img, img2img, pix2pix, and inpainting.

To run the random stress tests from the CLI, you can use the following command:

```shell
python3 stress_cli.py stress-random <num_requests: int>

# Example
python3 stress_cli.py stress-random 10
```