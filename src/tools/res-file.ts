import { packUint32LE, parseString, parseUint32LE } from './res-utils';

export class ResAsset {
  data: Uint8Array;

  constructor(buf: Uint8Array) {
    this.data = buf;
  }

  type(): 'bm' | 'elf' | 'libbip' | 'unknown' {
    const magicBM = parseString(this.data, 0, 2);
    const magicELF = parseString(this.data, 1, 4);
    const magicLIBBIP = parseString(this.data, 0, 6);
    if (magicBM === 'BM') return 'bm';
    if (magicELF === 'ELF') return 'elf';
    if (magicLIBBIP === 'LIBBIP') return 'libbip';
    return 'unknown';
  }
}

export class ResFile {
  header: Uint8Array;
  assets: ResAsset[];

  static async fromURL(url: string): Promise<ResFile> {
    const response = await fetch(url);
    const buf = new Uint8Array(await response.arrayBuffer());
    return new ResFile(buf);
  }

  constructor(fileBuf: Uint8Array) {
    /**
     * resource file struct:
     * 0x00 - 0x20: header
     * 0x20 - 0x24: resCount
     * 0x24 - endOfAddrTable
     * firstRes - secondRes
     * ...
     * N Res - N+1 Res
     */

    const magic = parseString(fileBuf, 0, 5);
    if (magic !== 'NERES') {
      throw new Error(`Expected NERES magic value, but got ${magic}`);
    }

    const resCount = parseUint32LE(fileBuf, 0x20);
    const getResAddr = (i: number) => parseUint32LE(fileBuf, 0x24 + i * 4);
    const offset = 0x24 + resCount * 4;

    this.header = new Uint8Array(fileBuf.subarray(0, 0x20));
    this.assets = [];

    for (let i = 0; i < resCount; i++) {
      const start = offset + getResAddr(i);
      const end =
        i === resCount - 1 ? fileBuf.length : offset + getResAddr(i + 1);
      const data = new Uint8Array(fileBuf.subarray(start, end));
      this.assets.push(new ResAsset(data));
    }
  }

  /**
   * Calculate size of the current .res
   * @returns size in bytes
   */
  size(): number {
    return (
      0x20 + // header
      4 + // nb_assets
      this.assets.length * 4 + // address table
      this.assets.reduce((ac, curr) => ac + curr.data.byteLength, 0) // asset data
    );
  }

  /**
   * Pack a list of assets back to .res file
   */
  pack(): Uint8Array {
    let bin: Uint8Array = new Uint8Array();
    const appendToBin = (buf: Uint8Array) => {
      const newBin = new Uint8Array(bin.byteLength + buf.byteLength);
      newBin.set(bin, 0);
      newBin.set(buf, bin.byteLength);
      bin = newBin;
    };

    // header
    if (this.header.byteLength !== 0x20) {
      throw new Error(
        `Expect header length 32 bytes, but got ${this.header.byteLength} bytes`
      );
    }
    appendToBin(this.header);
    appendToBin(packUint32LE(this.assets.length));

    // address table
    let pointer = 0;
    for (const res of this.assets) {
      appendToBin(packUint32LE(pointer));
      pointer += res.data.length;
    }

    // write data
    for (const res of this.assets) {
      appendToBin(res.data);
    }

    return bin;
  }
}
