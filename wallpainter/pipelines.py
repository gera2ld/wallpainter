import sqlite3
import json
import threading
import requests
from .db import db
from .settings import PORT

class SqlitePipeline:
    @classmethod
    def from_crawler(cls, _crawler):
        return cls()

    def process_item(self, item, spider):
        image = item['images'][0]
        key = image['path'][5:-4]
        db.add_item({
            'source': spider.name,
            'url': image['url'],
            'key': key,
            'extra': json.dumps(item['extra'], separators=(',', ':')),
        })

    def rpc(self, command, params):
        thread = threading.Thread(target=self._rpc, args=(command, params))
        thread.start()

    def _rpc(self, command, params):
        requests.post(f'http://127.0.0.1:{PORT}/api', json={
            'method': command,
            'params': params,
        })
