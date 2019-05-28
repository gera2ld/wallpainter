import asyncio
from . import methods
from .utils import start_server, send_message

def ready():
    send_message('ready')

def initialize():
    loop = asyncio.get_event_loop()
    loop.run_until_complete(start_server(loop))
    loop.call_soon(ready)
    loop.run_forever()
