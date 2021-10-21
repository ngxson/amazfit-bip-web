import React from 'react';

function FileList() {
  return <>
    <div className="col-12">
      <h1>About this website</h1>
      <p className="lead">Online .res builder for Amazfit Bip</p>
    </div>
    <div className="col-12">
      Application made by <a href="https://ngxson.com" target="_blank" rel="noreferrer">ngxson.com</a><br/>
      {/* eslint-disable-next-line */}
      Contact me via my email: <a href="javascript:location='mailto:\u0063\u006f\u006e\u0074\u0061\u0063\u0074\u0040\u006e\u0067\u0078\u0073\u006f\u006e\u002e\u0063\u006f\u006d';void 0">{'\u0063\u006f\u006e\u0074\u0061\u0063\u0074\u0040\u006e\u0067\u0078\u0073\u006f\u006e\u002e\u0063\u006f\u006d'}</a><br/>
      <br/>
      Thanks to:<br/>
      - <a href="https://github.com/MNVolkov">MNVolkov</a> for his work on BipOS<br/>
      <br/>
      <br/>
      <br/>
      THIS WEBSITE IS OPEN-SOURCE: <a href="https://github.com/ngxson/hobby-amazfit-bip-web">ngxson/hobby-amazfit-bip-web</a><br/>
    </div>
  </>;
}

export default FileList;