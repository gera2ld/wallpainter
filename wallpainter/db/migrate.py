from . import db

db.exec_sql('UPDATE images SET key=SUBSTR(SUBSTR(filename,6),-4,-40) WHERE images.url=images.url')
