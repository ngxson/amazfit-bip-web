import files from '../../data/files.json';
import { ResAsset, ResFile } from 'amazfit-bip-tools-ts';
import { ResName } from '../Utils';

export type ResWrappedName = ResName | 'custom';

export class ResFileWrapped {
  name: ResWrappedName;
  file: ResFile;
  constructor(name: ResWrappedName, file: ResFile) {
    this.name = name;
    this.file = file;
  }
  clone() {
    const buf = this.file.pack();
    return new ResFile(buf);
  }
}

const RES_CACHE: ResFileWrapped[] = [];

export async function loadAllRes() {
  if (RES_CACHE.length > 0) {
    return RES_CACHE;
  }

  const remoteFiles = await Promise.all(
    Object.keys(files.res).map(async (resName) => {
      const resFile = await ResFile.fromURL(`/files/res/${resName}`);
      const libbipFile = await fetch(
        `/files/libbip/${resName.replace('.res', '.bin')}`
      );
      const libbipBuf = new Uint8Array(await libbipFile.arrayBuffer());
      resFile.assets.push(new ResAsset(libbipBuf));
      const wrapped = new ResFileWrapped(resName as any, resFile);
      return wrapped;
    })
  );

  for (const f of remoteFiles) {
    RES_CACHE.push(f);
  }

  const savedResBuf = await loadSavedBuffer();
  if (savedResBuf) {
    const resFile = new ResFile(savedResBuf);
    RES_CACHE.push(new ResFileWrapped('custom', resFile));
  }

  return RES_CACHE;
}

export async function getResByName(name: ResWrappedName) {
  const list = await loadAllRes();
  return list.find((e) => e.name === name);
}

export async function saveCustomRes(res?: ResFile) {
  const idx = RES_CACHE.findIndex((r) => r.name === 'custom');
  if (res) {
    if (idx > -1) {
      RES_CACHE[idx] = new ResFileWrapped('custom', res);
    } else {
      RES_CACHE.push(new ResFileWrapped('custom', res));
    }
    await saveBuffer(res.pack());
  } else {
    if (idx > -1) RES_CACHE.splice(idx, 1);
    localStorage.removeItem(STORAGE_KEY_CUSTOM_RES);
  }
}

/////////////////////

const STORAGE_KEY_CUSTOM_RES = 'ngxson_custom_res';

async function saveBuffer(buf: Uint8Array) {
  const blob = new Blob([buf], { type: 'application/octet-binary' });
  const reader = new FileReader();
  reader.readAsDataURL(blob);
  reader.onloadend = () => {
    if (reader.result) {
      localStorage.setItem(STORAGE_KEY_CUSTOM_RES, reader.result as string);
    }
  };
}

async function loadSavedBuffer(): Promise<Uint8Array | null> {
  const savedBlobStr = localStorage.getItem(STORAGE_KEY_CUSTOM_RES);
  if (!savedBlobStr) {
    return null;
  }

  const res = await fetch(savedBlobStr);
  const buf = new Uint8Array(await res.arrayBuffer());
  return buf;
}
