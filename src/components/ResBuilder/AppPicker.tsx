import axios from 'axios';
import { useEffect, useState } from 'react';
import files from '../../data/files.json';
import {
  getELFSize,
  getELFMetadata,
  AppName,
  downloadArrayBuffer,
} from '../Utils';
import { ResAsset } from 'amazfit-bip-tools-ts';
import { Button, Col, OverlayTrigger, Spinner, Tooltip } from 'react-bootstrap';
import {
  ResFileWrapped,
  ResWrappedName,
  getResByName,
  loadAllRes,
} from './ResUtils';

async function getFile(url: string) {
  const { data } = await axios.get(url, {
    responseType: 'arraybuffer',
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
const POSSIBLE_RES = [...Object.keys(files.res), 'custom'];

export default function AppPicker({
  onChangeViewToEdit,
}: {
  onChangeViewToEdit(): void;
}) {
  const [loading, setLoading] = useState<boolean>(true);
  const [resName, setResName] = useState<ResWrappedName | null>(null);
  const [resFile, setResFile] = useState<ResFileWrapped | null>(null);
  const [apps, setApps] = useState<AppName[]>(DEFAULT_APPS);

  // load saved data
  useEffect(() => {
    (async () => {
      await loadAllRes();
      const savedApps = JSON.parse(
        localStorage.getItem(STORAGE_KEY_APPS) || 'null'
      );
      if (savedApps) {
        setApps(savedApps.filter((a: string) => !!(files.app as any)[a]));
      }
      const savedRes = JSON.parse(
        localStorage.getItem(STORAGE_KEY_RES) || 'null'
      );
      if (savedRes) {
        setResName(savedRes);
      }
      setLoading(false);
    })();
  }, []);

  // reload the actual file when resName is changed
  useEffect(() => {
    if (!resName) {
      setResFile(null);
      return;
    }
    (async () => {
      setLoading(true);
      setResFile((await getResByName(resName as any)) ?? null);
      setLoading(false);
    })();
  }, [resName]);

  // save app data to localStorage whenever there is change
  useEffect(() => {
    if (resName) {
      localStorage.setItem(STORAGE_KEY_RES, JSON.stringify(resName));
    }
    localStorage.setItem(STORAGE_KEY_APPS, JSON.stringify(apps));
  }, [resName, apps]);

  const addApp = (appName: AppName) => {
    setApps((apps) => [...apps, appName]);
  };

  const moveApp = (direction: 'up' | 'down', i: number) => {
    setApps((oldApps) => {
      const apps = [...oldApps];
      if (direction === 'up') {
        if (i === 0) return apps;
        const tmp = apps[i];
        apps[i] = apps[i - 1];
        apps[i - 1] = tmp;
      } else if (direction === 'down') {
        if (i === apps.length - 1) return apps;
        const tmp = apps[i];
        apps[i] = apps[i + 1];
        apps[i + 1] = tmp;
      }
      return apps;
    });
  };

  const delApp = (i: number) => {
    setApps((apps) => apps.filter((_, j) => i != j));
  };

  const exportResFile = async () => {
    if (!resFile || !resName) return;
    setLoading(true);
    const newResFile = resFile.clone();
    const appsData = await Promise.all(
      apps.map((appName) => getFile(`/files/app/${appName}`))
    );
    appsData.forEach((d) => newResFile.assets.push(new ResAsset(d)));
    const newResBin = newResFile.pack();
    const newResName =
      'RES_' +
      (resName.endsWith('res')
        ? resName.replace('.res', `_${Date.now()}.res`)
        : `_${Date.now()}.res`);
    downloadArrayBuffer(newResBin, newResName);
    setLoading(false);
  };

  return (
    <>
      <Col xs={12}>
        <h1>Res Builder</h1>
        <p className="lead">
          {resName
            ? 'Select apps to build a .res file'
            : 'Select your FW version'}
        </p>
      </Col>

      {/* FW selector */}
      {loading ? (
        <Spinner />
      ) : (
        <>
          <Col sm={12} md={6}>
            <select
              onChange={(e) =>
                setResName(
                  e.target.value === '' ? null : (e.target.value as any)
                )
              }
              value={resName || ''}
              className="form-select"
            >
              <option value={''}>...</option>
              {POSSIBLE_RES.map((res) => (
                <option key={res} value={res}>
                  {res}
                </option>
              ))}
            </select>
          </Col>
          <Col sm={0} md={6}></Col>
        </>
      )}

      {resName && resFile && (
        <>
          {/* App selector */}
          <Col sm={12} md={6}>
            <br />
            <br />
            <SystemAssets res={resFile} onEdit={onChangeViewToEdit} />
            <br />
            Selected apps:
            <br />
            {apps.map((appName, i) => (
              <SelectedApp
                key={appName}
                appName={appName}
                i={i}
                moveApp={moveApp}
                delApp={delApp}
              />
            ))}
            <br />
            <br />
            <ResSize apps={apps} res={resFile} />
            <br />
            <br />
            <Button
              variant="primary"
              onClick={exportResFile}
              disabled={loading}
            >
              {loading ? 'Exporting...' : 'Export .res file'}
            </Button>
            <br />
            <br />
            <Button
              variant="secondary"
              onClick={() => setApps(DEFAULT_APPS)}
              disabled={loading}
            >
              Reset
            </Button>
            <br />
            <br />
            <br />
            <br />
            <br />
          </Col>

          {/* Show apps list */}
          <Col sm={12} md={6}>
            <br />
            <br />
            App list:
            {Object.keys(files.app)
              .filter((a) => !apps.includes(a as any))
              .map((appName: any) => (
                <div className="nui-app-item" key={appName}>
                  <button
                    className="btn btn-primary"
                    onClick={() => addApp(appName)}
                  >
                    Add
                  </button>
                  <AppLabel appName={appName} />
                </div>
              ))}
            <br />
            <br />
          </Col>
        </>
      )}

      {resName === 'custom' && !resFile && (
        <>
          <Col sm={12} md={6}>
            <br />
            You haven't yet created a custom .res file.
            <br />
            <br />
            <Button
              variant="primary"
              onClick={onChangeViewToEdit}
              disabled={loading}
            >
              Create new .res file
            </Button>
          </Col>
        </>
      )}
    </>
  );
}

function SystemAssets({
  res,
  onEdit,
}: {
  res: ResFileWrapped;
  onEdit(): void;
}) {
  const renderTooltip = (props: any) => (
    <Tooltip {...props}>Select "custom" res to edit system assets</Tooltip>
  );

  const renderEditBtn = () => (
    <Button variant="primary" onClick={onEdit} disabled={res.name !== 'custom'}>
      Edit
    </Button>
  );

  return (
    <div className="nui-app-item">
      {res.name === 'custom' ? (
        renderEditBtn()
      ) : (
        <OverlayTrigger placement="bottom" overlay={renderTooltip}>
          <span>{renderEditBtn()}</span>
        </OverlayTrigger>
      )}
      &nbsp;<span className="app-label system">system</span>
      &nbsp;system assets ({byteToKB(res.file.size())})
    </div>
  );
}

function SelectedApp({
  moveApp,
  delApp,
  appName,
  i,
}: {
  appName?: AppName;
  moveApp?(direction: 'up' | 'down', i: number): void;
  delApp?(i: number): void;
  i: number;
}) {
  return (
    <div className="nui-app-item">
      <Button
        variant="primary"
        onClick={() => {
          moveApp?.('up', i);
        }}
        disabled={!appName}
      >
        ▲
      </Button>
      &nbsp;
      <Button
        variant="primary"
        onClick={() => {
          moveApp?.('down', i);
        }}
        disabled={!appName}
      >
        ▼
      </Button>
      &nbsp;
      <Button variant="danger" onClick={() => delApp?.(i)} disabled={!appName}>
        Delete
      </Button>
      {appName && <AppLabel appName={appName} />}
    </div>
  );
}

function AppLabel({ appName }: { appName: AppName }) {
  const metaData = getELFMetadata(appName);
  const nameParts = appName.split('-');
  const prefix = nameParts.shift();
  const name = nameParts.join('-');
  return (
    <>
      {'  '}
      <span className={`app-label ${prefix}`}>{prefix}</span>
      {'  '}
      {metaData.forum ? (
        <a
          className="forum"
          href={metaData.forum}
          target="_blank"
          rel="noreferrer"
        >
          {name}
        </a>
      ) : (
        <>{name}</>
      )}
      {'  '} ({getELFSize(appName)})
    </>
  );
}

const byteToKB = (i: number) => `${Math.round(i / 1024)}KB`;

export function ResSize({
  res,
  apps,
}: {
  res: ResFileWrapped;
  apps: AppName[];
}) {
  const THRESHOLD_WARN = 750 * 1024;
  const MAX_RES_SIZE = 800 * 1024;
  let sumSize = res.file.size();
  for (const app of apps) {
    sumSize += files.app[app].size;
  }
  const precent = Math.min(100, (sumSize * 100) / MAX_RES_SIZE);

  return (
    <>
      File size:
      <br />
      <div className="progress" style={{ height: '2em' }}>
        <div
          className={`progress-bar ${sumSize > THRESHOLD_WARN ? 'bg-danger' : ''}`}
          role="progressbar"
          style={{ width: precent + '%', fontSize: '1.3em' }}
        >
          {byteToKB(sumSize)} / {byteToKB(MAX_RES_SIZE)}
        </div>
      </div>
      {sumSize > THRESHOLD_WARN && (
        <p>
          <b>
            File is too big. You may not be able to upload it to the watch.
            <br />
            Please consider removing some apps.
          </b>
        </p>
      )}
    </>
  );
}
