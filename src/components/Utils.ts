import { saveAs } from 'file-saver';
import files from '../data/files.json';

export type ResDataType = keyof typeof files;
export type FWName = keyof typeof files.fw;
export type ResName = keyof typeof files.res;
export type AppName = keyof typeof files.app;
export type FontName = keyof typeof files.font;
export type LibbipName = keyof typeof files.libbip;

export interface ResBinaryPayload {
  header: Uint8Array;
  resTable: Uint8Array[];
}

export interface ResPayload {
  res: ResName;
  apps: AppName[];
}

export const byteToKB = (i: number) => `${Math.round(i / 1024)}KB`;

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

export async function downloadArrayBuffer(buf: Uint8Array, filename: string) {
  saveAs(new Blob([buf], { type: 'application/octet-stream' }), filename);
}

export const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));
