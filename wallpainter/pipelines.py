import sqlite3
import json

class SqlitePipeline:
    def __init__(self, filename):
        self.filename = filename

    @classmethod
    def from_crawler(cls, _crawler):
        return cls('data/db.sqlite3')

    def open_spider(self, spider):
        self.conn = sqlite3.connect(self.filename)
        self.cur = self.conn.cursor()
        self.cur.execute('''
CREATE TABLE IF NOT EXISTS images (
source VARCHAR,
url VARCHAR,
filename VARCHAR,
extra TEXT)''')
        self.cur.execute('''
CREATE UNIQUE INDEX IF NOT EXISTS images_index ON images (source, url)
''')

    def close_spider(self, spider):
        self.conn.commit()
        self.conn.close()

    def process_item(self, item, spider):
        image = item['images'][0]
        self.cur.execute('INSERT OR IGNORE INTO images (source, url, filename, extra) VALUES (?, ?, ?, ?)', (spider.name, image['url'], image['path'], json.dumps(item['extra'])))
