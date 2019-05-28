import os
from .logger import logger

def update_file(key, status):
    os.makedirs('data/selected', exist_ok=True)
    src = f'data/full/{key}.jpg'
    dst = f'data/selected/{key}.jpg'
    if status == 0:
        if not os.path.isfile(dst):
            logger.info(f'link: {key}')
            os.link(src, dst)
    else:
        if os.path.isfile(dst):
            logger.info(f'unlink: {key}')
            os.remove(dst)

def send_message(cmd, arg=None):
    items = ['[server] CMD:', cmd]
    if arg is not None: items.append(arg)
    print(' '.join(items), flush=True)
