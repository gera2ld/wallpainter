import asyncio
from . import methods
from .utils import start_server

def ready():
    print('ready', flush=True)

def initialize():
    loop = asyncio.get_event_loop()
    loop.run_until_complete(start_server(loop))
    loop.call_soon(ready)
    loop.run_forever()
