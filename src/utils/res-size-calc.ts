import files from '../data/files.json';

const byteToKB = (i: number) => `${Math.round(i / 1024)}KB`;

export function getELFMetadata(filename: keyof (typeof files.app)) {
  return files.app[filename] || {};
}

export function getELFSize(filename: keyof (typeof files.app)) {
  return byteToKB(files.app[filename].size);
}
