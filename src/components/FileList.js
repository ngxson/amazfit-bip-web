import React from 'react';
import files from '../data/files.json';

function FileList({ type, title }) {
  return <>
    <div className="col-12">
      <h1>{title}</h1>
      <p className="lead">Select a file to download:</p>
    </div>
    <div className="col-12">
      <ul>
        {Object.keys(files[type]).map(filename => (
          <li>
            <a href={`/files/${type}/${filename}`}>{filename}</a>
          </li>
        ))}
      </ul>
    </div>
  </>;
}

export default FileList;