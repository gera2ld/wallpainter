import sqlite3
import json
from .db import db

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
