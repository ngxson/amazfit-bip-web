import axios from 'axios';
import { useEffect, useState } from 'react';
import files from '../data/files.json';
import { getResData } from '../utils/res-extract';
import { downloadArrayBuffer, getResBinary } from '../utils/res-pack';
import { getELFSize, getELFMetadata } from '../utils/res-size-calc';
import { AppName, LibbipName, ResName, ResPayload } from '../utils/res-type';

async function getFile(url: string) {
  const { data } = await axios.get(url, {
    responseType: 'arraybuffer'
  });
  const buf = new Uint8Array(data as ArrayBuffer);
  return buf;
}

const STORAGE_KEY_APPS = 'ngxson_apps';
const STORAGE_KEY_RES = 'ngxson_res';
const DEFAULT_APPS: AppName[] = [
  'hook-alarm-manager-by-MNVolkov.elf',
  'utility-calendar-by-MNVolkov.elf',
  'utility-calculator-by-MNVolkov.elf',
  'utility-flashlight-by-MNVolkov.elf',
];

export default function ResBuilder() {
  const [loading, setLoading] = useState<boolean>(false);
  const [res, setRes] = useState<ResName | ''>('');
  const [apps, setApps] = useState<AppName[]>(DEFAULT_APPS);

  // load saved data
  useEffect(() => {
    const savedApps = JSON.parse(localStorage.getItem(STORAGE_KEY_APPS) || 'null');
    if (savedApps) {
      setApps(savedApps.filter((a: string) => !!(files.app as any )[a]));
    }
    const savedRes = JSON.parse(localStorage.getItem(STORAGE_KEY_RES) || 'null');
    if (savedRes) {
      setRes(savedRes);
    }
  }, []);

  // save app data to localStorage whenever there is change
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_RES, JSON.stringify(res));
    localStorage.setItem(STORAGE_KEY_APPS, JSON.stringify(apps));
  }, [res, apps]);

  const addApp = (appName: AppName) => {
    setApps(apps => [...apps, appName]);
  };

  const moveApp = (direction: 'up' | 'down', i: number) => {
    setApps(apps => {
      const newApps = [...apps];
      if (direction === 'up') {
        if (i === 0) return newApps;
        const tmp = apps[i];
        apps[i] = apps[i - 1];
        apps[i - 1] = tmp;
      } else if (direction === 'down') {
        if (i === apps.length - 1) return newApps;
        const tmp = apps[i];
        apps[i] = apps[i + 1];
        apps[i + 1] = tmp;
      }
      return newApps;
    });
  };

  const delApp = (i: number) => {
    setApps(apps => apps.filter((_, j) => i != j));
  };

  const buildResFile = async () => {
    setLoading(true);
    const resData = await getResData(res);
    const appsData = await Promise.all([
      getFile(`/files/libbip/${res.replace('.res', '.bin')}`),
      ...apps.map(appName => getFile(`/files/app/${appName}`)),
    ]);
    appsData.forEach(d => resData.resTable.push(d));
    const newResBin = await getResBinary(resData);
    const newResName = 'RES_' + res.replace('.res', `_${Date.now()}.res`);
    downloadArrayBuffer(newResBin, newResName);
    setLoading(false);
  };
  
  return <>
    <div className="col-12">
      <h1>Res Builder</h1>
      <p className="lead">{res ? 'Select apps to build a .res file' : 'Select your FW version'}</p>
    </div>
    
    {/* FW selector */}
    <div className="col-sm-12 col-md-6 col-lg-6">
      <select
        onChange={(e) => setRes(e.target.value as any)}
        value={res}
        className="form-select"
      >
        <option value={''}>...</option>
        {Object.keys(files.res).map(res =>
          <option key={res} value={res}>{res}</option>
        )}
      </select>
    </div>
    <div className="hidden-sm col-md-6 col-lg-6"></div>
    
    {res !== '' && <>
      {/* App selector */}
      <div className="col-sm-12 col-md-6 col-lg-6">
        <br/><br/>
        Selected apps:<br/>
        {apps.map((appName, i) => <div className="nui-app-item" key={appName}>
          <button className="btn btn-primary" onClick={() => moveApp('up', i)}>▲</button>&nbsp;
          <button className="btn btn-primary" onClick={() => moveApp('down', i)}>▼</button>&nbsp;
          <button className="btn btn-danger" onClick={() => delApp(i)}>Delete</button>
          <AppLabel appName={appName} />
        </div>)}
        + LIBBIP
        <br/><br/>
        <ResSize apps={apps} res={res} />
        <br/><br/>
        <button className="btn btn-primary" onClick={buildResFile} disabled={loading}>{loading ? 'Exporting...' : 'Export .res file'}</button>
        <br/><br/><br/><br/>
      </div>

      {/* Show apps list */}
      <div className="col-sm-12 col-md-6 col-lg-6">
        <br/><br/>
        App list:
        {Object.keys(files.app)
          .filter(a => !apps.includes(a as any))
          .map((appName: any) => (
            <div className="nui-app-item" key={appName}>
              <button className="btn btn-primary" onClick={() => addApp(appName)}>Add</button>
              <AppLabel appName={appName} />
            </div>
          ))}
        <br/><br/>
      </div>
    </>}
  </>;
}

function AppLabel({ appName }: {
  appName: AppName,
}) {
  const metaData = getELFMetadata(appName);
  const nameParts = appName.split('-');
  const prefix = nameParts.shift();
  const name = nameParts.join('-');
  return <>
    {'  '}
    <span className={`app-label ${prefix}`}>{prefix}</span>
    {'  '}
    {metaData.forum
      ? <a className='forum' href={metaData.forum} target="_blank" rel="noreferrer">{name}</a>
      : <>{name}</>
    }
    {'  '} ({getELFSize(appName)})
  </>
}

const byteToKB = (i: number) => `${Math.round(i / 1024)}KB`;
export function ResSize({ res, apps }: ResPayload) {
  const THRESHOLD_WARN = 750 * 1024;
  const MAX_RES_SIZE = 800 * 1024;
  const libbip = res.replace('.res', '.bin') as any as LibbipName;
  let sumSize = files.res[res].size + files.libbip[libbip].size;
  for (const app of apps) {
    sumSize += files.app[app].size;
  }
  const precent = Math.min(100, sumSize * 100 / MAX_RES_SIZE);

  return <>
    File size:<br/>
    <div className="progress" style={{ height: '2em' }}>
      <div className="progress-bar" role="progressbar" style={{width: precent + '%', fontSize: '1.3em'}}>{byteToKB(sumSize)} / {byteToKB(MAX_RES_SIZE)}</div>
    </div>
    {sumSize > THRESHOLD_WARN && <p>
      <b>File is too big. You may not be able to upload it to the watch.<br/>
      Please consider removing some apps.</b>  
    </p>}
  </>;
}
