import os
import re
import json
import inspect
from aiohttp import web

methods = {}

re_camelcase = re.compile('_(\w)')
def register(method):
    name = re_camelcase.sub(lambda m: m.group(1).upper(), method.__name__)
    methods[name] = method
    return method

async def api_handler(request):
    data = await request.json()
    method_name = data['method']
    params = data.get('params')
    if params is None:
        params = []
    elif not isinstance(params, list):
        params = [params]
    method = methods.get(method_name)
    result = {
        'success': True,
    }
    try:
        ret = method(*params)
        if inspect.iscoroutine(ret): ret = await ret
        result['data'] = ret
    except Exception as e:
        result['success'] = False
        result['error'] = str(e)
        import traceback
        traceback.print_exc()
    return web.json_response(result)

async def image_handler(request):
    size = request.match_info['size']
    key = request.match_info['key']
    if size == 'full':
        filename = f'data/full/{key}.jpg'
    else:
        filename = f'data/thumbs/{size}/{key}.jpg'
    try:
        stream = open(filename, 'rb')
    except FileNotFoundError:
        raise web.HTTPNotFound()
    else:
        return web.Response(
            headers={
                'Cache-Control': 'public, max-age=31536000',
                'Content-Type': 'image/jpeg',
            },
            body=stream.read())
    finally:
        stream.close()

async def start_server(loop):
    app = web.Application(loop=loop)
    app.router.add_post('/api', api_handler)
    app.router.add_get('/images/{size}/{key}', image_handler)
    server = await loop.create_server(app.make_handler(), '127.0.0.1', 19870)
    return server

def update_file(key, status):
    os.makedirs('data/selected', exist_ok=True)
    src = f'data/full/{key}.jpg'
    dst = f'data/selected/{key}.jpg'
    if status == 0:
        if not os.path.isfile(dst):
            print('link:', key)
            os.link(src, dst)
    else:
        if os.path.isfile(dst):
            print('unlink:', key)
            os.remove(dst)
