import { saveAs } from 'file-saver';
import { ResBinaryPayload } from './res-type';

function getIntLE(i: number): Uint8Array {
  return Uint8Array.from([
    i & 0xff,
    (i >> 8) & 0xff,
    (i >> 16) & 0xff,
    (i >> 24) & 0xff,
  ]);
}

export async function getResBinary(
  resData: ResBinaryPayload
): Promise<Uint8Array> {
  let bin: Uint8Array = new Uint8Array();
  const appendToBin = (buf: Uint8Array) => {
    const newBin = new Uint8Array(bin.byteLength + buf.byteLength);
    newBin.set(bin, 0);
    newBin.set(buf, bin.byteLength);
    bin = newBin;
  };
  const { header, resTable } = resData;

  // header
  appendToBin(header);
  appendToBin(getIntLE(resTable.length));

  // address table
  let pointer = 0;
  for (const res of resTable) {
    appendToBin(getIntLE(pointer));
    pointer += res.length;
  }

  // write data
  for (const res of resTable) {
    appendToBin(res);
  }

  return new Uint8Array(bin);
}

export async function downloadArrayBuffer(buf: Uint8Array, filename: string) {
  saveAs(new Blob([buf], { type: 'application/octet-stream' }), filename);
}
