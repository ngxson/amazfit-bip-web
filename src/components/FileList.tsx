import files from "../data/files.json";
import { ResDataType } from "../utils/res-type";

function FileList({
  type,
  title,
  children,
}: {
  type: ResDataType;
  title: string;
  children?: any;
}) {
  return (
    <>
      <div className="col-12">
        <h1>{title}</h1>
        <p className="lead">Select a file to download:</p>
      </div>
      <div className="col-12">
        <ul>
          {Object.keys(files[type]).map((filename) => (
            <li>
              <a href={`/files/${type}/${filename}`}>{filename}</a>
            </li>
          ))}
        </ul>
        <br />
        <br />
        {children}
      </div>
    </>
  );
}

export default FileList;
