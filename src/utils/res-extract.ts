import axios from 'axios';

function getIntAt(buf: Uint8Array, addr: number) {
  return buf[addr] + (buf[addr+1] << 8) + (buf[addr+2] << 16) + (buf[addr+3] << 24);
}

function getSubArr(buf: Uint8Array, start: number, end: number) {
  const res = [];
  for (let i = start; i < end; i++) res.push(buf[i]);
  return new Uint8Array(res);
}

export async function getResData(filename: string) {
  const { data } = await axios.get(`/files/res/${filename}`, {
    responseType: 'arraybuffer'
  });
  const buf = new Uint8Array(data as ArrayBuffer);

  /**
   * resource file struct:
   * 0x00 - 0x20: header
   * 0x20 - 0x24: resCount
   * 0x24 - endOfAddrTable
   * firstRes - secondRes
   * ...
   * N Res - N+1 Res
   */

  const resCount = getIntAt(buf, 0x20);
  const getResAddr = (i: number) => getIntAt(buf, 0x24 + i * 4);
  const offset = 0x24 + resCount * 4;
  const resTable = [];

  for (let i = 0; i < resCount; i++) {
    const start = offset + getResAddr(i);
    const end = (i === resCount - 1)
      ? buf.length
      : offset + getResAddr(i + 1);
    resTable.push(getSubArr(buf, start, end));
  }

  return {
    header: getSubArr(buf, 0, 0x20),
    resTable,
  };
}
