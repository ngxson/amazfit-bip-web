import files from '../data/files.json';

const byteToKB = (i) => Math.round(i / 1024) + 'KB';

export function getELFMetadata(filename) {
  return files.app[filename] || {};
}

export function getELFSize(filename) {
  return byteToKB(files.app[filename].size);
}

export function ResSize({ res, apps }) {
  const THRESHOLD_WARN = 750 * 1024;
  const MAX_RES_SIZE = 800 * 1024;
  const libbip = res.replace('.res', '.bin');
  let sumSize = files.res[res].size + files.libbip[libbip].size;
  for (const app of apps) {
    sumSize += files.app[app].size;
  }
  const precent = Math.min(100, sumSize * 100 / MAX_RES_SIZE);

  return <>
    File size:<br/>
    <div className='w3-light-grey'>
      <div
        className={`w3-container ${sumSize > THRESHOLD_WARN ? 'w3-ngxson-red' : 'w3-ngxson-green'}`}
        style={{width: precent + '%'}}
      >
        {byteToKB(sumSize)} / {byteToKB(MAX_RES_SIZE)}
      </div>
    </div>
    {sumSize > THRESHOLD_WARN && <p>
      <b>File is too big. You may not be able to upload it to the watch.<br/>
      Please consider removing some apps.</b>  
    </p>}
  </>;
}