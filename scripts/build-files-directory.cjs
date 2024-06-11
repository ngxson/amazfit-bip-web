const fs = require('fs');
const path = require('path');

const DIR_FW = '../public/files/fw';
const DIR_RES = '../public/files/res';
const DIR_APP = '../public/files/app';
const DIR_FONT = '../public/files/font';
const DIR_LIBBIP = '../public/files/libbip';
const OUTPUT_DIR = '../src/data/files.json';

function run() {
  processDir(DIR_FW, 'fw');
  processDir(DIR_RES, 'res');
  processDir(DIR_APP, 'app');
  processDir(DIR_FONT, 'font');
  processDir(DIR_LIBBIP, 'libbip');
  const newContent = JSON.stringify(content, null, 2);
  fs.writeFileSync(path.join(__dirname, OUTPUT_DIR), newContent);
}

const content = JSON.parse(
  fs.readFileSync(path.join(__dirname, OUTPUT_DIR)).toString()
);
const getFileList = (relativePath) => {
  const dir = path.join(__dirname, relativePath);
  return fs.readdirSync(dir).map((filename) => ({
    filename,
    size: fs.statSync(path.join(dir, filename)).size,
  }));
};

const processDir = (relativePath, label) => {
  if (!content[label]) content[label] = {};
  const files = getFileList(relativePath);
  for (const { filename, size } of files) {
    content[label][filename] = {
      ...content[label][filename],
      size,
    };
  }
  content[label] = sortObjectKeys(content[label]);
};

const sortObjectKeys = (o) =>
  Object.keys(o)
    .sort()
    .reduce((obj, key) => {
      obj[key] = o[key];
      return obj;
    }, {});

run();
