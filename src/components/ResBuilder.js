import axios from 'axios';
import React from 'react';
import files from '../data/files.json';
import { getResData } from '../utils/res-extract';
import { downloadArrayBuffer, getResBinary } from '../utils/res-pack';
import { ResSize, getELFSize } from '../utils/res-size-calc';

async function getFile(url) {
  const { data } = await axios.get(url, {
    responseType: 'arraybuffer'
  });
  const buf = Buffer.from(data, 'binary');
  return buf;
}

const STORAGE_KEY_APPS = 'ngxson_apps';
const STORAGE_KEY_RES = 'ngxson_res';

class ResBuilder extends React.Component {
  state = {
    loading: false,
    res: null,
    apps: [
      'hook-alarm-manager-by-MNVolkov.elf',
      'utility-calendar-by-MNVolkov.elf',
      'utility-calculator-by-MNVolkov.elf',
      'utility-flashlight-by-MNVolkov.elf',
    ],
  };

  constructor(props) {
    super(props);
    const savedApps = JSON.parse(window.localStorage.getItem(STORAGE_KEY_APPS) || 'null');
    if (savedApps) this.state.apps = savedApps.filter(a => !!files.app[a]);
    const savedRes = JSON.parse(window.localStorage.getItem(STORAGE_KEY_RES) || 'null');
    if (savedRes) this.state.res = savedRes;
  }

  componentDidUpdate() {
    this.saveAppConfiguration();
  }

  saveAppConfiguration = () => {
    window.localStorage.setItem(STORAGE_KEY_RES, JSON.stringify(this.state.res));
    window.localStorage.setItem(STORAGE_KEY_APPS, JSON.stringify(this.state.apps));
  };

  addApp = (appName) => {
    this.setState({ apps: [...this.state.apps, appName] });
  };

  moveApp = (direction, i) => {
    const apps = [...this.state.apps];
    if (direction === 'up') {
      if (i === 0) return;
      const tmp = apps[i];
      apps[i] = apps[i - 1];
      apps[i - 1] = tmp;
    } else if (direction === 'down') {
      if (i === apps.length - 1) return;
      const tmp = apps[i];
      apps[i] = apps[i + 1];
      apps[i + 1] = tmp;
    }
    this.setState({ apps });
  };

  delApp = (i) => {
    const apps = [...this.state.apps];
    apps.splice(i, 1);
    this.setState({ apps });
  };

  buildResFile = async () => {
    const { apps, res } = this.state;
    this.setState({ loading: true });
    const resData = await getResData(res);
    const appsData = await Promise.all([
      getFile(`/files/libbip/${res.replace('.res', '.bin')}`),
      ...apps.map(appName => getFile(`/files/app/${appName}`)),
    ]);
    appsData.forEach(d => resData.resTable.push(d));
    const newResBin = await getResBinary(resData);
    const newResName = 'RES_' + res.replace('.res', `_${Date.now()}.res`);
    downloadArrayBuffer(newResBin, newResName);
    this.setState({ loading: false });
  };

  _renderAppSelect() {
    const { res, apps, loading } = this.state;
    return <>
      <div className="col-sm-12 col-md-6 col-lg-6">
        <br/><br/>
        Selected apps:<br/>
        {apps.map((appName, i) => <div className="nui-app-item" key={appName}>
          <button className="btn btn-primary" onClick={() => this.moveApp('up', i)}>▲</button>&nbsp;
          <button className="btn btn-primary" onClick={() => this.moveApp('down', i)}>▼</button>&nbsp;
          <button className="btn btn-danger" onClick={() => this.delApp(i)}>Delete</button><br/>
          {'  ' + appName} ({getELFSize(appName)})
        </div>)}
        + LIBBIP
        <br/><br/>
        <ResSize apps={apps} res={res} />
        <br/><br/>
        <button className="btn btn-primary" onClick={this.buildResFile} disabled={loading}>{loading ? 'Exporting...' : 'Export .res file'}</button>
        <br/><br/><br/><br/>
      </div>
      <div className="col-sm-12 col-md-6 col-lg-6">
        <br/><br/>
        App list:
        {Object.keys(files.app)
        .filter(a => !apps.includes(a))
        .map(appName => <div className="nui-app-item" key={appName}>
          <button className="btn btn-primary" onClick={() => this.addApp(appName)}>Add</button>
          {'  ' + appName} ({getELFSize(appName)})
        </div>)}
      </div>
    </>
  }

  _renderFWSelect() {
    return <>
      <div className="col-sm-12 col-md-6 col-lg-6">
        <select
          onChange={(e) => this.setState({ res: e.target.value })}
          value={this.state.res}
          className="form-select"
          defaultValue={null}
        >
          <option value={false}>...</option>
          {Object.keys(files.res).map(res => <option key={res} value={res}>{res}</option>)}
        </select>
      </div>
      <div className="hidden-sm col-md-6 col-lg-6"></div>
    </>
  }

  render() {
    const { res } = this.state;

    return <>
      <div className="col-12">
        <h1>Res Builder</h1>
        <p className="lead">{res ? 'Select apps to build a .res file' : 'Select your FW version'}</p>
      </div>
      {this._renderFWSelect()}
      {res && this._renderAppSelect()}
    </>;
  }
}

export default ResBuilder;