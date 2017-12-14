import os
import json
from ..config import options
from ..db import cur

SOURCE = 'bing'

async def crawl(session):
    number = options['number']
    data_dir = os.path.join(options['data_dir'], SOURCE)
    os.makedirs(data_dir, exist_ok=True)
    meta_url = f'https://cn.bing.com/HPImageArchive.aspx?format=js&idx=0&n={number}'
    print('Loading list...', end='')
    async with session.get(meta_url) as resp:
        meta_data = await resp.json()
    print('OK')
    for image in meta_data['images']:
        rel_url = image['url']
        full_url = f'https://cn.bing.com{rel_url}'
        cur.execute('SELECT * FROM images WHERE source = ? AND url = ?', (SOURCE, full_url))
        if cur.fetchone() is None:
            filename = os.path.basename(rel_url)
            print(f'Downloading {full_url}...', end='')
            async with session.get(full_url) as resp:
                open(os.path.join(data_dir, filename), 'wb').write(await resp.read())
                cur.execute('INSERT INTO images (source, url, filename, extra) VALUES (?, ?, ?, ?)', (SOURCE, full_url, filename, json.dumps(image)))
            print('OK')
