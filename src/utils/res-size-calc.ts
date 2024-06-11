import files from '../data/files.json';
import { AppName, LibbipName, ResName } from './res-type';

const byteToKB = (i: number) => `${Math.round(i / 1024)}KB`;

export function getELFMetadata(filename: AppName) {
  return files.app[filename] || {};
}

export function getELFSize(filename: AppName) {
  return byteToKB(files.app[filename].size);
}

export function getResBaseSize(filename: ResName) {
  return byteToKB(files.res[filename].size);
}

export function getLibBipSize(filename: LibbipName) {
  return byteToKB(files.libbip[filename].size);
}
