import os
from PIL import Image
from . import settings
from .logger import logger

files = os.listdir(f'{settings.IMAGES_STORE}/full')

for key, size in settings.IMAGES_THUMBS.items():
    os.makedirs(f'{settings.IMAGES_STORE}/thumbs/{key}', exist_ok=True)
    for item in files:
        dest = f'{settings.IMAGES_STORE}/thumbs/{key}/{item}'
        if os.path.isfile(dest):
            logger.info(f'Skip thumbnail {key}/{item}')
        else:
            logger.info(f'Generate thumbnail {key}/{item}...')
            image = Image.open(f'{settings.IMAGES_STORE}/full/{item}')
            image = image.copy()
            image.thumbnail(size, Image.ANTIALIAS)
            image.save(dest, 'JPEG')
            logger.info('ok')
