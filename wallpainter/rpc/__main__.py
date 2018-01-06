import asyncio
from . import methods
from .utils import start_server

def main():
    loop = asyncio.get_event_loop()
    loop.run_until_complete(start_server(loop))
    loop.run_forever()

main()
