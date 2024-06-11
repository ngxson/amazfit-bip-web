import files from '../data/files.json';

export type ResDataType = keyof (typeof files);
export type FWName = keyof (typeof files.fw);
export type ResName = keyof (typeof files.res);
export type AppName = keyof (typeof files.app);
export type FontName = keyof (typeof files.font);
export type LibbipName = keyof (typeof files.libbip);

export interface ResBinaryPayload {
  header: Uint8Array,
  resTable: Uint8Array[],
};

export interface ResPayload {
  res: ResName,
  apps: AppName[],
};