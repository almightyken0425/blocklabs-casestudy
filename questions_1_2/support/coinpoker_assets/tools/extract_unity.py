"""Read CoinPoker 1.27.0 public client assets. Never executes client code.

Requires UnityPy==1.25.3, TypeTreeGeneratorAPI==0.0.10,
dnfile==0.18.0, dncil==1.0.2. Run after fetch_avatars.py.
"""
import hashlib
import json
import re
import shutil
from pathlib import Path

import UnityPy
import dnfile
from dncil.cil.body import CilMethodBody
from dncil.cil.body.reader import CilMethodBodyReaderBytes
from UnityPy.helpers.TypeTreeGenerator import TypeTreeGenerator

OUT = Path(__file__).resolve().parents[1]
SOURCE = Path('/Applications/CoinPoker.app/Contents/Resources')
DATA = SOURCE / 'unity-resources-arm64/CoinPoker Game.app/Contents/Resources/Data'
ASAR = Path('/private/tmp/coinpoker_extraction/asar/dist')


def save_json(path, value):
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(value, ensure_ascii=False, indent=2) + '\n')


def slug(name):
    return re.sub(r'[^a-z0-9]+', '_', name.lower()).strip('_')


def digest(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()


env = UnityPy.load(str(DATA / 'data.unity3d'))
objects = {(o.assets_file.name, o.path_id): o for o in env.objects}
texts = {}
audio_objects = {}
for o in env.objects:
    if o.type.name == 'TextAsset':
        texts[o.peek_name().lower()] = o
    elif o.type.name == 'AudioClip':
        audio_objects[o.peek_name().lower()] = o

# Resolve actual IDs from the managed assembly's dictionary initializer.
pe = dnfile.dnPE(str(DATA / 'Managed/Assembly-CSharp.dll'))
emoji_type = next(t for t in pe.net.mdtables.TypeDef if str(t.TypeName) == 'EmojiMapping')
method = next(m.row for m in emoji_type.MethodList if str(m.row.Name) == '.cctor')
instructions = CilMethodBody(CilMethodBodyReaderBytes(pe.get_data(method.Rva))).instructions
maps = {}
pairs, values = {}, []
for inst in instructions:
    op = str(inst.opcode)
    if op.startswith('ldc.i4'):
        values.append(inst.operand if inst.operand is not None else int(op.split('.')[-1]))
    elif op == 'ldc.r4':
        values.append(inst.operand)
    elif op == 'ldstr':
        values.append(pe.net.user_strings.get(inst.operand.value & 0xffffff).value)
    elif op == 'callvirt' and len(values) == 2:
        pairs[values[0]] = values[1]
        values = []
    elif op == 'stsfld':
        field = pe.net.mdtables.Field.rows[(inst.operand.value & 0xffffff)-1]
        maps[str(field.Name)] = pairs
        pairs, values = {}, []
save_json(OUT / 'catalog/animation_mapping.json', maps)

generator = TypeTreeGenerator(env.assets[0].unity_version)
for dll in sorted((DATA / 'Managed').glob('*.dll')):
    if dll.name.startswith('Sentry.'):
        continue
    try:
        generator.load_dll(dll.read_bytes())
    except Exception:
        pass
env.typetree_generator = generator


def mono(file, path_id):
    o = objects[file, path_id]
    d = o.parse_as_dict(o.generate_monobehaviour_node())
    # Keep business fields. Generated generic MonoBehaviour header is not used.
    return {k: v for k, v in d.items() if not k.startswith('m_')}


sprite_cache = {}


def sprite(file, path_id, folder):
    key = file, path_id, folder
    if key in sprite_cache:
        return sprite_cache[key]
    o = objects[file, path_id]
    s = o.read()
    path = OUT / folder / (slug(s.m_Name) + f'_{path_id}.png')
    path.parent.mkdir(parents=True, exist_ok=True)
    im = s.image
    im.save(path)
    record = dict(name=s.m_Name, path=str(path.relative_to(OUT)), width=im.width,
                  height=im.height, source='data.unity3d', serialized_file=file,
                  path_id=path_id, sha256=digest(path))
    sprite_cache[key] = record
    return record


visuals = {}
for category, path_id in [('Dogs',7045),('Penguin',7047),('Donkey',7046),
                          ('Chips',7028),('Skull',7049),('Pepe',7048)]:
    data = mono('sharedassets0.assets', path_id)
    save_json(OUT / f'catalog/unity/{slug(category)}.json', data)
    for item in data['EmojiVisualDataList']:
        visuals[item['Id']] = dict(kind='emote', category=category,
            thumbnail=sprite('sharedassets0.assets',item['ThumbnailSprite']['m_PathID'],'emotes/thumbnails'))
throwables = mono('sharedassets0.assets',7027)
save_json(OUT / 'catalog/unity/throwables.json',throwables)
for item in throwables['ThrowablesDataList']:
    visuals[item['Id']] = dict(kind='throwable', category='Throwables',
        thumbnail=sprite('sharedassets0.assets', item['ThrowableSprite']['m_PathID'],'throwables/thumbnails'))

default_emojis = json.loads((OUT/'catalog/emojisConfig.json').read_text())
enabled = {a['id'] for c in default_emojis['emojiAssets'] if c['isActive']
           for a in c['emojis'] if a['isActive']}
enabled |= {a['id'] for a in json.loads((OUT/'catalog/throwablesConfig.json').read_text())['throwableAssets'] if a['isActive']}

animations, missing = [], []
for asset_id, name in maps['EmojiMap'].items():
    o = texts.get(name.lower())
    if o is None:
        missing.append(dict(id=asset_id,name=name))
        continue
    raw = o.read().m_Script.encode('utf-8','surrogateescape')
    data = json.loads(raw)
    info = visuals.get(asset_id,dict(kind='archive',category='Other packaged'))
    kind = info['kind']
    folder = {'emote':'emotes','throwable':'throwables','archive':'archive'}[kind]
    dest = OUT / folder / 'animations' / f'{asset_id}_{slug(name)}.json'
    dest.parent.mkdir(parents=True, exist_ok=True)
    dest.write_bytes(raw)
    external = [dict(id=a.get('id'),u=a.get('u'),p=a.get('p')) for a in data.get('assets',[])
                if a.get('p') and not a['p'].startswith('data:')]
    item = dict(id=asset_id,source_name=name,composition_name=data.get('nm'),
                **info,path=str(dest.relative_to(OUT)),
                in_bundled_default_config=asset_id in enabled,
                width=data['w'],height=data['h'],frame_rate=data['fr'],
                first_frame=data['ip'],last_frame=data['op'],
                duration_seconds=(data['op']-data['ip'])/data['fr'],
                source='data.unity3d',serialized_file=o.assets_file.name,path_id=o.path_id,
                sha256=digest(dest),external_images=external,
                run_count_override=maps['EmojiRunCountMap'].get(asset_id),
                scale_override=maps['EmojiScale'].get(asset_id))
    if name.lower() in audio_objects:
        ao = audio_objects[name.lower()]
        try:
            audio = ao.read()
            # The bundle contains zero-filled placeholders for external audio.
            # Read the real resource file next to data.unity3d.
            if audio.m_Resource:
                resource = audio.m_Resource
                with (DATA / Path(resource.m_Source).name).open('rb') as stream:
                    stream.seek(resource.m_Offset)
                    audio.m_AudioData = stream.read(resource.m_Size)
            samples = audio.samples
            item['audio'] = []
            for filename, content in samples.items():
                target = OUT / folder / 'audio' / (f'{asset_id}_'+slug(name)+Path(filename).suffix)
                target.parent.mkdir(parents=True, exist_ok=True)
                target.write_bytes(content)
                item['audio'].append(dict(path=str(target.relative_to(OUT)),sha256=digest(target),
                                          serialized_file=ao.assets_file.name,path_id=ao.path_id))
        except Exception as ex:
            item['audio_error'] = str(ex)
    animations.append(item)
save_json(OUT/'catalog/animations.json',animations)
save_json(OUT/'catalog/missing_animations.json',missing)

rings=[]
for path_id in [897,1058,1107,1174,1328,1439,1487,1513]:
    rings.append(sprite('sharedassets0.assets',path_id,'rings/unity'))
for source in sorted((ASAR/'assets').glob('*')):
    if re.search(r'(^|[-_])(ring|border)(?=[._-]|$)',source.stem,re.I) and source.suffix in ['.png','.webp']:
        dest=OUT/'rings/electron'/source.name
        dest.parent.mkdir(parents=True,exist_ok=True)
        shutil.copy2(source,dest)
        rings.append(dict(name=source.name,path=str(dest.relative_to(OUT)),
                          source='app.asar/dist/assets/'+source.name,sha256=digest(dest)))
save_json(OUT/'catalog/rings.json',rings)

# Follow the serialized chat scene to get actual Image sprite references.
chat_nodes=[]
chat_sprite_ids=set([972,1017,1067,1145,1266,1382,1434,1490,1497,1543])
visited=set()


def walk_go(path_id, parent=''):
    if path_id in visited:
        return
    visited.add(path_id)
    go=objects['level0',path_id].parse_as_dict()
    path=parent+'/'+go['m_Name']
    node=dict(path=path,path_id=path_id,active=go['m_IsActive'],components=[])
    children=[]
    for c in go['m_Component']:
        ptr=c['component']
        obj=objects['level0',ptr['m_PathID']]
        if obj.type.name in ['RectTransform','Transform']:
            td=obj.parse_as_dict()
            node['transform']={k:v for k,v in td.items() if k in ['m_AnchorMin','m_AnchorMax','m_AnchoredPosition','m_SizeDelta','m_Pivot']}
            children=td['m_Children']
        elif obj.type.name=='MonoBehaviour':
            try:
                script_name=obj.parse_monobehaviour_head().m_Script.read().m_Name
                if script_name not in ['Image','TextMeshProUGUI','TMP_InputField','ChatPanelComponent',
                    'ChatContent','PredefinedMsgComponent','PredefinedMsgVerticalPanel','OtherOptionsComponent','UserNamesComponent']:
                    continue
                d=mono('level0',obj.path_id)
                # Image fields use m_ prefix, so parse the complete record for those.
                if script_name=='Image':
                    full=obj.parse_as_dict(obj.generate_monobehaviour_node())
                    ref=full.get('m_Sprite',{})
                    if ref.get('m_FileID')==2 and ref.get('m_PathID'):
                        chat_sprite_ids.add(ref['m_PathID'])
                    d={k:v for k,v in full.items() if k in ['m_Sprite','m_Color','m_Type','m_PreserveAspect']}
                elif script_name=='TextMeshProUGUI':
                    full=obj.parse_as_dict(obj.generate_monobehaviour_node())
                    d={k:v for k,v in full.items() if k in ['m_text','m_fontSize','m_fontColor','m_enableWordWrapping']}
                node['components'].append(dict(type=script_name,path_id=obj.path_id,properties=d))
            except Exception as ex:
                node['components'].append(dict(path_id=obj.path_id,error=str(ex)))
    chat_nodes.append(node)
    for child in children:
        tr=objects['level0',child['m_PathID']].parse_as_dict()
        walk_go(tr['m_GameObject']['m_PathID'],path)

walk_go(2300)
for prefab_id in [155,3820,3416,2964,1698]:
    walk_go(prefab_id,'/ChatPrefabs')
save_json(OUT/'chat/scene_structure.json',chat_nodes)
chat_assets=[sprite('sharedassets0.assets',pid,'chat/sprites') for pid in sorted(chat_sprite_ids)
             if objects['sharedassets0.assets',pid].type.name=='Sprite']
for source in sorted((ASAR/'assets').glob('*')):
    if re.search(r'(^chat[.-]|chat-active)',source.name):
        dest=OUT/'chat/electron'/source.name
        dest.parent.mkdir(parents=True,exist_ok=True)
        shutil.copy2(source,dest)
        chat_assets.append(dict(name=source.name,path=str(dest.relative_to(OUT)),
            source='app.asar/dist/assets/'+source.name,sha256=digest(dest)))
save_json(OUT/'catalog/chat_assets.json',chat_assets)
for language in ['english','chinese']:
    text_asset=texts[language]
    translation=json.loads(text_asset.read().m_Script)
    save_json(OUT/f'chat/{language}.json',{k:v for k,v in translation.items()
        if k in ['chatDrawer','dealerChat','tableSettings','skillScore']})

manifest=dict(app='CoinPoker',app_version='1.27.0',unity_version=env.assets[0].unity_version,
    source_files=[dict(path='CoinPoker.app/Contents/Resources/'+str(p.relative_to(SOURCE)),sha256=digest(p))
                  for p in [DATA/'data.unity3d',DATA/'resources.resource',DATA/'Managed/Assembly-CSharp.dll',SOURCE/'app.asar']],
    avatar_count=len(json.loads((OUT/'catalog/avatars.json').read_text())),
    animation_count=len(animations),emote_count=sum(a['kind']=='emote' for a in animations),
    throwable_count=sum(a['kind']=='throwable' for a in animations),
    archived_animation_count=sum(a['kind']=='archive' for a in animations),
    ring_image_count=len(rings),chat_image_count=len(chat_assets),
    audio_count=sum(len(a.get('audio',[])) for a in animations),
    missing_animations=missing,
    notes=['Bundled configuration and packaged assets do not establish live account entitlement.',
           'Avatar URLs are obtained from the public client configuration.',
           'Animation IDs are mapped from EmojiMapping static initializer, not inferred from filenames.',
           'Original vendor assets retain their original provenance.',
           'The source client and the supplied mahjong HTML were not modified.'])
save_json(OUT/'catalog/manifest.json',manifest)
print(json.dumps(manifest,ensure_ascii=False,indent=2))
