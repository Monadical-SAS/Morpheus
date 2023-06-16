# Manage new model in Morpheus

In order to manage new/existing models you can use the file `cli.py` which built with
the [typer](https://typer.tiangolo.com/)
library and [rich](https://github.com/Textualize/rich)

This script implement docker and you can run it using the Morpheus' docker compose file

## Dependencies:

- typer
- rich
- Omecaconf

## How to Build

```sh
docker compose --profile manage build

#or 

docker compose build model-script
```

## How to use it

To utilize this script, it is necessary to run the Morpheus project as you will need to register models in the database.
The script relies on the Morpheus API for this purpose.

### Create/modify the models-info.yaml file for stable diffusion models

You can register one or more models at same time registering its information inside the yaml file `models-info.yaml`

```yaml
models:
  - name: "stable diffusion v2"
    description: "This is a model that can be used to generate and modify images based on text prompts. It is a Latent Diffusion Model that uses a fixed, pretrained text encoder (OpenCLIP-ViT/H)."
    source: "stabilityai/stable-diffusion-2"
    is_active: true
    url_docs: "https://huggingface.co/stabilityai/stable-diffusion-2"
  - name: "openjourney"
    description: "Openjourney is an open source Stable Diffusion fine tuned model on Midjourney images, by PromptHero."
    source: "prompthero/openjourney"
    is_active: true
    url_docs: "https://huggingface.co/prompthero/openjourney"
```

The script uses the `source` as a path/id to save the model in local and S3 bucket because it is used by HuggingFace to
identify the model

### Create/modify the controlnet-models-info.yaml file for ControlNet models

As above, you can register differents controlnet models if you will use it in file `controlnet-models-info.yaml`

```yaml
models:
   - name: "Canny edges"
     type: "canny"
     description: "ControlNet is a neural network structure to control diffusion models by adding extra conditions. This checkpoint corresponds to the ControlNet conditioned on Canny edges."
     source: "lllyasviel/sd-controlnet-canny"
     is_active: true
     url_docs: "https://huggingface.co/lllyasviel/sd-controlnet-canny"
```

You can register models like these:

| Model                             | description                                                                                                                    |
|-----------------------------------|--------------------------------------------------------------------------------------------------------------------------------|
| lllyasviel/sd-controlnet-canny    | Trained with canny edge detection. A monochrome image with white edges on a black background.                                  |
| lllyasviel/sd-controlnet-depth    | Trained with Midas depth estimation A grayscale image with black representing deep areas and white representing shallow areas. |
| lllyasviel/sd-controlnet-hed      | Trained with HED edge detection (soft edge)    A monochrome image with white soft edges on a black background.                 |		
| lllyasviel/sd-controlnet-mlsd     | Trained with M-LSD line detection A monochrome image composed only of white straight lines on a black background.              |		
| lllyasviel/sd-controlnet-normal   | Trained with normal map A normal mapped image.                                                                                 |		
| lllyasviel/sd-controlnet_openpose | Trained with OpenPose bone image A OpenPose bone image.                                                                        |		
| lllyasviel/sd-controlnet_scribble | Trained with human scribbles A hand-drawn monochrome image with white outlines on a black background.                          |		
| lllyasviel/sd-controlnet_seg      | Trained with semantic segmentation An ADE20K's segmentation protocol image.                                                    |

If you want to obtain more information about the models, you can check [here](https://huggingface.co/lllyasviel).

### Create/modify the magicprompt-models-info.yaml file for magic prompt

you can also register models for magic prompt using this file: `magicprompt-models-info.yaml`. Basically this model
helps you build a better prompt: https://huggingface.co/Gustavosta/MagicPrompt-Stable-Diffusion

At this moment you can use only one model at time. We are planning to enable the addition and selection of more
models for the magic prompt feature.

```yaml
models:
  - name: "Gustavosta/MagicPrompt-Stable-Diffusion"
    description: "This is a model from the MagicPrompt series of models, which are GPT-2 models intended to generate prompt texts for imaging AIs, in this case: Stable Diffusion."
    source: "Gustavosta/MagicPrompt-Stable-Diffusion"
    is_active: true
    url_docs: "https://huggingface.co/Gustavosta/MagicPrompt-Stable-Diffusion"
```

### Some commands

* To show the help
   ```bash
   docker compose run --rm model-script --help
   docker compose run --rm model-script <command> <subcommand> --help
  
   # **** HELP OUTPUT *****
   Usage: cli.py [OPTIONS] COMMAND [ARGS]...

  ╭─ Options ───────────────────────────────────────────────────────────────────────────╮
  │ --install-completion        [bash|zsh|fish|powershell|  Install completion for the  │
  │                             pwsh]                       specified shell.            │
  │                                                         [default: None]             │
  │ --show-completion           [bash|zsh|fish|powershell|  Show completion for the     │
  │                             pwsh]                       specified shell, to copy it │
  │                                                         or customize the            │
  │                                                         installation.               │
  │                                                         [default: None]             │
  │ --help                                                  Show this message and exit. │
  ╰─────────────────────────────────────────────────────────────────────────────────────╯
  ╭─ Commands ──────────────────────────────────────────────────────────────────────────╮
  │ db          subcommand to manage models in database:  register/list/delete          │
  │ delete      Delete model with NAME from different targets: local, s3 and db         │
  │ download    Download  model to local device                                         │
  │ s3          subcommand to manage models in S3:  register/list/delete                │
  │ test                                                                                │
  │ upload      Upload model to different targets: local, s3 and db                     │
  ╰─────────────────────────────────────────────────────────────────────────────────────╯
  
   ```

* To add/update a new model
   ```bash
   docker compose run --rm model-script upload <server> <target>
  
    # **** HELP OUTPUT *****
   Usage: cli.py upload [OPTIONS] SERVER:{local|staging|production}
                        TARGET:{sdiffusion|controlnet|magicprompt}
  
   Upload model to different targets: local, s3 and db
   Model information is read from a yaml file.
  
  ╭─ Arguments ────────────────────────────────────────────────────────────────────────────────╮
  │ *    server      SERVER:{local|staging|production}           [default: None] [required]    │
  │ *    target      TARGET:{sdiffusion|controlnet|magicprompt}  [default: None] [required]    │
  ╰────────────────────────────────────────────────────────────────────────────────────────────╯
  ╭─ Options ──────────────────────────────────────────────────────────────────────────────────╮
  │ --help          Show this message and exit.                                                │
  ╰────────────────────────────────────────────────────────────────────────────────────────────╯
  ```


* To list content of S3 bucket
   ```bash
   docker compose run --rm model-script s3 list
   docker compose run --rm model-script s3 list <folder>
  
   # **** HELP OUTPUT *****
  Usage: cli.py s3 list [OPTIONS] [FOLDER]

  ╭─ Arguments ─────────────────────────────────────────────────────────────────────────╮
  │   folder      [FOLDER]                                                              │
  ╰─────────────────────────────────────────────────────────────────────────────────────╯
  ╭─ Options ───────────────────────────────────────────────────────────────────────────╮
  │ --help          Show this message and exit.                                         │
  ╰─────────────────────────────────────────────────────────────────────────────────────╯
  ```

  Here, folder is the `source` in `models-info.yaml` for example.

  **Example**:
  ```bash
  $ docker compose run --rm model-script s3 list
  # Output
  S3 content:
  ['prompthero/', 'runwayml/', 'stabilityai/', 'timbrooks/']
  
  $ docker compose run --rm model-script s3 list stabilityai
  # Output
  S3 content:
  [
      'stabilityai/stable-diffusion-2/model_index.json',
      'stabilityai/stable-diffusion-2/scheduler/scheduler_config.json',
      'stabilityai/stable-diffusion-2/text_encoder/config.json',
      'stabilityai/stable-diffusion-2/text_encoder/pytorch_model.bin',
      'stabilityai/stable-diffusion-2/tokenizer/merges.txt',
      'stabilityai/stable-diffusion-2/tokenizer/special_tokens_map.json',
      'stabilityai/stable-diffusion-2/tokenizer/tokenizer_config.json',
      'stabilityai/stable-diffusion-2/tokenizer/vocab.json',
      'stabilityai/stable-diffusion-2/unet/config.json',
      'stabilityai/stable-diffusion-2/unet/diffusion_pytorch_model.bin',
      'stabilityai/stable-diffusion-2/vae/config.json',
      'stabilityai/stable-diffusion-2/vae/diffusion_pytorch_model.bin'
  ]
  ```


* To list content of db from a specific api server
    ```bash
    docker compose run --rm model-script db list <server> --target <target>
  
    # **** HELP OUTPUT *****
   Usage: cli.py db list [OPTIONS] SERVER:{local|staging|production}
  
   List models registered in db in a specific SERVER
  
  ╭─ Arguments ────────────────────────────────────────────────────────────────────────────╮
  │ *    server      SERVER:{local|staging|production}  [default: None] [required]         │
  ╰────────────────────────────────────────────────────────────────────────────────────────╯
  ╭─ Options ──────────────────────────────────────────────────────────────────────────────╮
  │ --target          [sdiffusion|controlnet]  [default: DBTarget.sdiffusion]              │
  │ --debug   -d                               Enable debug mode and show error traceback  │
  │ --help                                     Show this message and exit.                 │
  ╰────────────────────────────────────────────────────────────────────────────────────────╯
    
    ### Example
    docker compose run --rm model-script db list staging --target controlnet
    ```

* To add models to the s3 bucket
   ```bash
   docker compose run --rm model-script s3 register <target>
  
   # **** HELP OUTPUT *****
    Usage: cli.py s3 register [OPTIONS] TARGET:{sdiffusion|controlnet|magicprompt}

   Register a model in S3 bucket
   Model information is read from a yaml file
  
  ╭─ Arguments ──────────────────────────────────────────────────────────────────────────────╮
  │ *    target      TARGET:{sdiffusion|controlnet|magicprompt}  [default: None] [required]  │
  ╰──────────────────────────────────────────────────────────────────────────────────────────╯
  ╭─ Options ────────────────────────────────────────────────────────────────────────────────╮
  │ --help          Show this message and exit.                                              │
  ╰──────────────────────────────────────────────────────────────────────────────────────────╯
   ```


* To add model to the db of a specific api server
   ```bash
   docker compose run --rm model-script db register <server> <target>
  
   Usage: cli.py db register [OPTIONS] SERVER:{local|staging|production}
                             TARGET:{sdiffusion|controlnet}
  
   Register a model in db in a specific SERVER and TARGET
   Model information is read from a yaml file
  
  ╭─ Arguments ────────────────────────────────────────────────────────────────────────────╮
  │ *    server      SERVER:{local|staging|production}  [default: None] [required]         │
  │ *    target      TARGET:{sdiffusion|controlnet}     [default: None] [required]         │
  ╰────────────────────────────────────────────────────────────────────────────────────────╯
  ╭─ Options ──────────────────────────────────────────────────────────────────────────────╮
  │ --debug  -d        Enable debug mode and show error traceback                          │
  │ --help             Show this message and exit.                                         │
  ╰────────────────────────────────────────────────────────────────────────────────────────╯
   ```

* To update a model in the db of a specific api server
   ```bash
   docker compose run --rm model-script db register <server> <target>
  
   Usage: cli.py db register [OPTIONS] SERVER:{local|staging|production}
                           TARGET:{sdiffusion|controlnet}
  
   Update a model in db in a specific SERVER and TARGET
   Model information is read from a yaml file
  
  ╭─ Arguments ────────────────────────────────────────────────────────────────────────────╮
  │ *    server      SERVER:{local|staging|production}  [default: None] [required]         │
  │ *    target      TARGET:{sdiffusion|controlnet}     [default: None] [required]         │
  ╰────────────────────────────────────────────────────────────────────────────────────────╯
  ╭─ Options ──────────────────────────────────────────────────────────────────────────────╮
  │ --debug  -d        Enable debug mode and show error traceback                          │
  │ --help             Show this message and exit.                                         │
  ╰────────────────────────────────────────────────────────────────────────────────────────╯
   ```

* To delete a model from s3, db and local
   ```bash
   docker compose run --rm model-script delete <model-source> --api-server <server> --target <target>
  
   # **** HELP OUTPUT *****
   Usage: cli.py delete [OPTIONS] NAME

   Delete model with NAME from different targets: local, s3 and db
   api_server is also used to delete model from DB in a specific server
  
  ╭─ Arguments ─────────────────────────────────────────────────────────────────────────────────╮
  │ *    name      TEXT  [default: None] [required]                                             │
  ╰─────────────────────────────────────────────────────────────────────────────────────────────╯
  ╭─ Options ───────────────────────────────────────────────────────────────────────────────────╮
  │ --api-server        [local|staging|production]  [default: local]                            │
  │ --target            [sdiffusion|controlnet]     [default: Target.sdiffusion]                │
  │ --help                                          Show this message and exit.                 │
  ╰─────────────────────────────────────────────────────────────────────────────────────────────╯
   ```


* To delete a model from s3
   ```bash
   docker compose run --rm model-script s3 delete <model-source>
  
   # **** HELP OUTPUT *****
   Usage: cli.py s3 delete [OPTIONS] NAME
 
   Delete a model with NAME in S3 bucket
   NAME must be the model source. For example: 'stabilityai/stable-diffusion-2'
 
  ╭─ Arguments ────────────────────────────────────────────────────────────────────────────╮
  │ *    name      TEXT  [default: None] [required]                                        │
  ╰────────────────────────────────────────────────────────────────────────────────────────╯
  ╭─ Options ──────────────────────────────────────────────────────────────────────────────╮
  │ --help          Show this message and exit.                                            │
  ╰────────────────────────────────────────────────────────────────────────────────────────╯
  ```


* To delete a model from db of a specific api server
   ```bash
   docker compose run --rm model-script db delete <model-source> <server> --target <target>
   
   # **** HELP OUTPUT *****
   Usage: cli.py db delete [OPTIONS] NAME [SERVER]:[local|staging|production]
  
   Delete model with NAME from db in a specific SERVER
   NAME must be the model source. For example: 'stabilityai/stable-diffusion-2'
  
  ╭─ Arguments ──────────────────────────────────────────────────────────────────────────────────╮
  │ *    name        TEXT                                 [default: None] [required]             │
  │      server      [SERVER]:[local|staging|production]  [default: local]                       │
  ╰──────────────────────────────────────────────────────────────────────────────────────────────╯
  ╭─ Options ────────────────────────────────────────────────────────────────────────────────────╮
  │ --target          [sdiffusion|controlnet]  [default: DBTarget.sdiffusion]                    │
  │ --debug   -d                               Enable debug mode and show error traceback        │
  │ --help                                     Show this message and exit.                       │
  ╰──────────────────────────────────────────────────────────────────────────────────────────────╯
   ```



