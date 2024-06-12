import { ResAsset } from './res-file';
import { parseUint16LE, unpackByteArr } from './res-utils';

export class Color {
  // on Bip screen, a sub pixel can only be either on or off
  r: boolean;
  g: boolean;
  b: boolean;
  a: boolean;
  constructor(r: boolean, g: boolean, b: boolean, a: boolean) {
    this.r = r;
    this.g = g;
    this.b = b;
    this.a = a;
  }
  toCSSColor() {
    return `rgb(${this.r ? 255 : 0} ${this.g ? 255 : 0} ${this.b ? 255 : 0})`;
  }
}

export type Palette = Color[];

export class Pixel extends Color {
  // on Bip screen, a sub pixel can only be either on or off
  constructor(palette: Palette, byte: number) {
    const color = palette[byte];
    super(color.r, color.g, color.b, color.a);
  }
}

export class Bitmap {
  data: Pixel[][] = [];
  height: number;
  width: number;
  bitDepth: number;
  stride: number;
  transp: boolean;
  palette: Palette = [];

  // why the last 2 bytes of header is always 100 and 0?
  header: Uint8Array = new Uint8Array([66, 77, 100, 0]);

  static fromPixels(data: Pixel[][]) {
    // TODO: implement this
    console.log(data);
  }

  constructor(asset: ResAsset) {
    if (asset.type() !== 'bm') {
      throw new Error(`Expected "bm" asset type, but got "${asset.type()}"`);
    }
    const buf = asset.data;

    // parse metadata
    this.width = parseUint16LE(buf, 4);
    this.height = parseUint16LE(buf, 6);
    this.stride = parseUint16LE(buf, 8);
    this.bitDepth = parseUint16LE(buf, 0xa);
    this.transp = parseUint16LE(buf, 0xe) > 0;
    const paletteLen = parseUint16LE(buf, 0xc);

    // parse palette
    for (let i = 0; i < paletteLen; i++) {
      const off = 0x10 + 4 * i;
      const color = new Color(
        buf[off + 0] > 0,
        buf[off + 1] > 0,
        buf[off + 2] > 0,
        buf[off + 3] > 0
      );
      this.palette.push(color);
    }

    // parse bitmap
    for (let ir = 0; ir < this.height; ir++) {
      const rowLen = Math.ceil((this.width * this.bitDepth) / 8);
      const begin = 0x10 + this.palette.length * 4;
      const off = begin + ir * rowLen;
      const rowData = buf.subarray(off, off + rowLen);
      const unpacked = unpackByteArr(rowData, this.bitDepth);

      // unpack row
      const row: Pixel[] = [];
      for (let ic = 0; ic < unpacked.byteLength; ic++) {
        const pixel = new Pixel(this.palette, unpacked[ic]);
        row.push(pixel);
      }

      // save row
      this.data.push(row);
    }
  }

  pack(): Uint8Array {
    const buf = new Uint8Array();
    // TODO: implement this
    return buf;
  }
}
