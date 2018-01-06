import sqlite3
import json
from .db import db

class SqlitePipeline:
    def __init__(self):
        self.filename = filename

    @classmethod
    def from_crawler(cls, _crawler):
        return cls()

    def process_item(self, item, spider):
        image = item['images'][0]
        key = image['path'][5:-4]
        db.safe_exec_sql(
            'INSERT OR IGNORE INTO images (source, url, key, extra) VALUES (?, ?, ?, ?)',
            (spider.name, image['url'], key, json.dumps(item['extra'], separators=(',', ':'))))
