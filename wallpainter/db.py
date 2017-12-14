import os
import sqlite3
from .config import options

os.makedirs(options['base_dir'], exist_ok=True)
conn = sqlite3.connect(os.path.join(options['base_dir'], 'db.sqlite3'))
cur = conn.cursor()
cur.execute('''
CREATE TABLE IF NOT EXISTS images (
source VARCHAR,
url VARCHAR,
filename VARCHAR,
extra TEXT)''')
cur.execute('''
CREATE UNIQUE INDEX IF NOT EXISTS images_index ON images (source, url)
''')
