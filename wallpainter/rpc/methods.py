from .utils import register, start_server, update_file
from ..db import db

@register
async def say_hi(name):
    return f'Hi, {name}!'

@register
def get_item(key):
    return db.query_sql('SELECT * FROM images WHERE key=?', (key,))

@register
def get_list(params=None):
    params = params or {}
    page = int(params.get('page', 1))
    per = int(params.get('per', 10))
    where = params.get('where')
    sql_rows = ['SELECT * FROM images']
    args_where = []

    sql_where = []
    if where:
        for key in ('source', 'status'):
            value = where.get(key)
            if value is not None:
                sql_where.append(key)
                args_where.append(value)
        if sql_where:
            sql_where = 'WHERE ' + ' AND '.join(f'`{key}`=?' for key in where_sql)
    if sql_where:
        sql_rows.append(sql_where)
    sql_rows.append(f'LIMIT {per} OFFSET {(page - 1) * per}')
    sql_rows = ' '.join(sql_rows)
    rows = db.query_sql(sql_rows, args_where, False)

    sql_count = ['SELECT COUNT(*) AS total FROM images']
    if sql_where:
        sql_count.append(sql_where)
    sql_count = ' '.join(sql_count)
    count = db.query_sql(sql_count, args_where)

    return {'rows': rows, 'total': count['total'], 'page': page, 'per': per}

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
