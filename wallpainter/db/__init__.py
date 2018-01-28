import sys
import sqlite3
import asyncio
from ..utils import update_file

class SqliteStorage:
    def __init__(self, filename='data/db.sqlite3', loop=None):
        if loop is None:
            loop = asyncio.get_event_loop()
        self.loop = loop
        self.conn = sqlite3.connect(filename)
        self.conn.row_factory = sqlite3.Row
        self.cur = self.conn.cursor()
        self.initialize()

    def initialize(self):
        for sql in [
            '''
CREATE TABLE IF NOT EXISTS images (
source VARCHAR,
url VARCHAR,
filename VARCHAR,
key VARCHAR,
status INTEGER DEFAULT 0,
extra TEXT,
created_at DATETIME DEFAULT STRFTIME('%s', 'now'))''',
            'CREATE UNIQUE INDEX IF NOT EXISTS images_index_id ON images (source, url)',
            'CREATE UNIQUE INDEX IF NOT EXISTS images_index_key ON images (key)',
        ]:
            self.cur.execute(sql)

    def safe_add_item(self, *args):
        self.loop.call_soon_threadsafe(self.add_item, *args)

    def exec_sql(self, sql, args=()):
        print('exec', sql, ','.join(map(str, args)), sep='/')
        sys.stdout.flush()
        self.cur.execute(sql, args)
        self.conn.commit()

    def query_sql(self, sql, args=(), fetchone=True):
        print('query', sql, ','.join(map(str, args)), sep='/')
        sys.stdout.flush()
        self.cur.execute(sql, args)
        if fetchone: return self.row_to_dict(self.cur.fetchone())
        return [self.row_to_dict(item) for item in self.cur.fetchall()]

    @staticmethod
    def row_to_dict(row):
        if row is None: return None
        values = {}
        for key in row.keys():
            values[key] = row[key]
        return values

    def add_item(self, data):
        columns, args = zip(*data.items())
        columns = ','.join(f'`{column}`' for column in columns)
        placeholders = ','.join('?' for _ in args)
        sql = f'INSERT OR IGNORE INTO images ({columns}) VALUES ({placeholders})'
        self.exec_sql(sql, args)
        update_file(data['key'], 0)

db = SqliteStorage()
