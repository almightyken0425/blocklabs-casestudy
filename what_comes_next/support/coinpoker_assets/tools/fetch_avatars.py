"""Download only avatar IDs and URL patterns declared by the installed client."""
from pathlib import Path
import concurrent.futures
import hashlib
import io
import json
import urllib.request
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
config = json.loads((ROOT / 'catalog/avatarConfig.json').read_text())
club = json.loads((ROOT / 'catalog/threeBetConfig.json').read_text())
ids = {i: g['title'] for g in config['groups'] for i in g['avatarIds']}
ids.update({i: '3-Bet Club configuration' for i in club['exclusiveAvatarIds']})
(ROOT / 'avatars').mkdir(exist_ok=True)

def fetch(item):
    id_, group = item
    url = f"{config['url']}{id_}.webp"
    record = {'id': id_, 'group': group, 'source_url': url}
    try:
        data = urllib.request.urlopen(url, timeout=30).read()
        image = Image.open(io.BytesIO(data))
        image.load()
        target = ROOT / 'avatars' / f'avatar-{id_}.webp'
        target.write_bytes(data)
        record.update(path=str(target.relative_to(ROOT)), width=image.width,
                      height=image.height, sha256=hashlib.sha256(data).hexdigest(),
                      status='downloaded')
    except Exception as error:
        record.update(status='unavailable', error=str(error))
    return record

with concurrent.futures.ThreadPoolExecutor(max_workers=6) as pool:
    records = list(pool.map(fetch, sorted(ids.items())))
(ROOT / 'catalog/avatars.json').write_text(json.dumps(records, indent=2) + '\n')
print(json.dumps({'downloaded': sum(r['status']=='downloaded' for r in records),
                  'unavailable': [r for r in records if r['status']!='downloaded']}))
