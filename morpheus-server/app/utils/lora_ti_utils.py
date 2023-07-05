import requests
from bs4 import BeautifulSoup
from urllib.parse import urljoin, unquote
import os
import shutil


def create_lora_ti_folder(dir_name="./lora_ti"):
    download_dir = os.path.abspath(dir_name)
    os.makedirs(download_dir, exist_ok=True)
    return download_dir

def delete_lora_ti_folder(dir_name="./lora_ti"):
    if os.path.exists(dir_name):
        shutil.rmtree(dir_name)

# Get model information from a url
def get_civitai_model_info(url):
    response = requests.get(url)
    soup = BeautifulSoup(response.text, 'html.parser')
    
    # Extract the model type
    model_type_tag = soup.find(string='Type')
    model_type = model_type_tag.find_next().text.strip() if model_type_tag else None

    # Extract the base model information
    base_model_tag = soup.find(string='Base Model')
    base_model = base_model_tag.find_next().text.strip() if base_model_tag else None

    # Extract the trigger words
    trigger_words_tag = soup.find(string='Trigger Words')
    trigger_words = trigger_words_tag.find_next().text.strip().split(',') if trigger_words_tag else None

    # Extract the download link
    download_link_tag = soup.find('a', string=lambda t: t and 'Download' in t)
    download_link_relative = download_link_tag['href'] if download_link_tag else None
    download_link = urljoin(url, download_link_relative) if download_link_relative else None

    return {
        'model_type': model_type,
        'base_model': base_model,
        'trigger_words': trigger_words,
        'download_link': download_link,
    }

# download a file from the download api url
def download_from_civitai(url, download_dir="."):
    response = requests.get(url, stream=True)
    response.raise_for_status()  # Ensure we got an OK response

    # Get the filename from the Content-Disposition header
    content_disposition = response.headers.get('content-disposition', '')
    filename = unquote(content_disposition.partition('filename=')[2].strip('"'))
    download_filename = os.path.join(download_dir, filename)


    with open(download_filename, 'wb') as f:
        for chunk in response.iter_content(chunk_size=8192):
            f.write(chunk)
    
    abs_path = os.path.abspath(download_filename)

    return abs_path