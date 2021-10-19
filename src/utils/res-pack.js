import { saveAs } from 'file-saver';

function getIntLE(i) {
  return [
    i & 0xFF,
    (i >> 8) & 0xFF,
    (i >> 16) & 0xFF,
    (i >> 24) & 0xFF,
  ];
}

export async function getResBinary(resData) {
  const bin = [];
  const appendToBin = (buf) => [...buf].forEach(i => bin.push(i));
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

export async function downloadArrayBuffer(buf, filename) {
  saveAs(
    new Blob([buf], { type: 'application/octet-stream' }),
    filename
  );
}