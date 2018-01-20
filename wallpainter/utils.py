import os

def update_file(key, status):
    os.makedirs('data/selected', exist_ok=True)
    src = f'data/full/{key}.jpg'
    dst = f'data/selected/{key}.jpg'
    if status == 0:
        if not os.path.isfile(dst):
            print('link:', key)
            os.link(src, dst)
    else:
        if os.path.isfile(dst):
            print('unlink:', key)
            os.remove(dst)
