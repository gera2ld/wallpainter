from .utils import register, start_server, update_file
from .db import db

@register
async def say_hi(name):
    return f'Hi, {name}!'

@register
def get_item(key):
    return db.query_sql('SELECT * FROM images WHERE key=?', (key,))

@register
def get_sources():
    return [item['source'] for item in db.query_sql('SELECT DISTINCT source FROM images', fetchone=False)]

@register
def get_list(params=None):
    params = params or {}
    offset = int(params.get('offset', 0))
    per = int(params.get('per', 10))
    where = params.get('where')
    sql_rows = ['SELECT * FROM images']
    args_where = []

    sql_where = []
    if where:
        for key in ('source', 'status'):
            value = where.get(key)
            if isinstance(value, list):
                length = len(value)
                if length > 0:
                    placeholders = ','.join('?' for _ in range(length))
                    sql_where.append(f'`{key}` IN ({placeholders})')
                    args_where.extend(value)
            elif value is not None:
                sql_where.append(f'`{key}`=?')
                args_where.append(value)
        if sql_where:
            sql_where = 'WHERE ' + ' AND '.join(sql_where)
    if sql_where:
        sql_rows.append(sql_where)
    sql_rows.append(f'LIMIT {per} OFFSET {offset}')
    sql_rows = ' '.join(sql_rows)
    rows = db.query_sql(sql_rows, args_where, False)

    sql_count = ['SELECT COUNT(*) AS total FROM images']
    if sql_where:
        sql_count.append(sql_where)
    sql_count = ' '.join(sql_count)
    count = db.query_sql(sql_count, args_where)

    return {'rows': rows, 'total': count['total'], 'offset': offset, 'per': per}

@register
def set_item(key, data):
    entries = []
    args = []
    for entry in ('status',):
        value = data.get(entry)
        if value is not None:
            entries.append(entry)
            args.append(value)
    if entries:
        update = ','.join(f'`{entry}`=?' for entry in entries)
        args.append(key)
        sql = ['UPDATE images SET', update, 'WHERE key=?']
        db.exec_sql(' '.join(sql), args)
        status = data.get('status')
        if status is not None:
            update_file(key, status)
        return True
    return False

@register
def rebuild():
    rows = db.query_sql('SELECT key, status FROM images', (), False)
    for row in rows:
        update_file(row['key'], row['status'])
    return True

@register
def add_item(data):
    columns, args = zip(*data.items())
    columns = ','.join(f'`{column}`' for column in columns)
    placeholders = ','.join('?' for _ in args)
    sql = f'INSERT OR IGNORE INTO images ({columns}) VALUES ({placeholders})'
    db.exec_sql(sql, args)
    update_file(data['key'], 0)
