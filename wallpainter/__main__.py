import asyncio
import os
import aiohttp
from .spiders import bing
from .config import options

options['data_dir'] = os.path.join(options['base_dir'], 'data')
os.makedirs(options['data_dir'], exist_ok=True)

async def main():
    async with aiohttp.ClientSession() as session:
        await bing.crawl(session)

loop = asyncio.get_event_loop()
loop.run_until_complete(main())
