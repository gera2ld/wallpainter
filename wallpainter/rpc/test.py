import asyncio
import json
import pprint
import aiohttp
from . import methods
from .utils import start_server
from ..settings import PORT

async def rpc(method, params=None):
    async with aiohttp.ClientSession() as session:
        data = json.dumps({
            'method': method,
            'params': params,
        })
        async with session.post(f'http://127.0.0.1:{PORT}/api', data=data) as res:
            ret = json.loads(await res.read())
            return ret

async def image(key):
    async with aiohttp.ClientSession() as session:
        async with session.get(f'http://127.0.0.1:{PORT}/images/full/{key}') as res:
            return await res.read()

loop = asyncio.get_event_loop()
loop.run_until_complete(start_server(loop))
#loop.run_forever()
data = loop.run_until_complete(rpc('sayHi', 'Gerald'))
#data = loop.run_until_complete(rpc('getOne', '72243f1c0309cc55a9861d52638498021e3feb9b'))
#data = loop.run_until_complete(rpc('getList'))
#data = loop.run_until_complete(image('72243f1c0309cc55a9861d52638498021e3feb9b'))
pprint.pprint(data)
