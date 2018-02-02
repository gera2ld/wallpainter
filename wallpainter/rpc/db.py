import sqlite3
import asyncio
from .logger import logger
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
created_at DATETIME DEFAULT (STRFTIME('%s', 'now')))''',
            'CREATE UNIQUE INDEX IF NOT EXISTS images_index_id ON images (source, url)',
            'CREATE UNIQUE INDEX IF NOT EXISTS images_index_key ON images (key)',
            'CREATE INDEX IF NOT EXISTS images_index_status ON images (status)',
        ]:
            self.cur.execute(sql)

    def exec_sql(self, sql, args=()):
        logger.info('exec/%s/%s', sql, ','.join(map(str, args)))
        self.cur.execute(sql, args)
        self.conn.commit()

    def query_sql(self, sql, args=(), fetchone=True):
        logger.info('query/%s/%s', sql, ','.join(map(str, args)))
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

db = SqliteStorage()
