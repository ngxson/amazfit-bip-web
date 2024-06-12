//////////////////
// Data utils

export function parseUint32LE(buf: Uint8Array, addr: number): number {
  return (
    buf[addr] +
    (buf[addr + 1] << 8) +
    (buf[addr + 2] << 16) +
    (buf[addr + 3] << 24)
  );
}

export function packUint32LE(i: number): Uint8Array {
  return Uint8Array.from([
    i & 0xff,
    (i >> 8) & 0xff,
    (i >> 16) & 0xff,
    (i >> 24) & 0xff,
  ]);
}

export function parseUint16LE(buf: Uint8Array, addr: number): number {
  return buf[addr] | (buf[addr + 1] << 8);
}

export function packUint16LE(i: number): Uint8Array {
  return Uint8Array.from([i & 0xff, (i >> 8) & 0xff]);
}

export function parseString(
  buf: Uint8Array,
  addr: number,
  len: number
): string {
  return new TextDecoder().decode(buf.subarray(addr, addr + len));
}

//////////////////
// Bitmap utils

export function unpackByteArr(buf: Uint8Array, bits: number): Uint8Array {
  const unpackedLength = Math.ceil((buf.length * 8) / bits);
  const unpackedArr = new Uint8Array(unpackedLength);
  let unpackedIndex = 0;
  let currentByte = 0;
  let remainingBits = 8;

  for (let i = 0; i < buf.length; i++) {
    currentByte = buf[i];
    for (let j = 0; j < 8; j += bits) {
      const mask = (1 << bits) - 1;
      const extracted = (currentByte >> (8 - j - bits)) & mask;
      unpackedArr[unpackedIndex] = extracted;
      unpackedIndex++;
      remainingBits -= bits;
      if (remainingBits === 0) {
        remainingBits = 8;
        currentByte = 0;
      }
    }
  }

  return unpackedArr;
}

export function packByteArr(buf: Uint8Array, bits: number): Uint8Array {
  const packedLength = Math.ceil((buf.length * bits) / 8);
  const packedArr = new Uint8Array(packedLength);
  let packedIndex = 0;
  let currentByte = 0;
  let remainingBits = 8;

  for (let i = 0; i < buf.length; i++) {
    for (let j = 0; j < bits; j++) {
      currentByte |= buf[i] << (remainingBits - j - 1);
      remainingBits -= bits;
      if (remainingBits === 0) {
        packedArr[packedIndex] = currentByte;
        packedIndex++;
        currentByte = 0;
        remainingBits = 8;
      }
    }
  }

  if (remainingBits !== 8) {
    packedArr[packedIndex] = currentByte;
  }

  return packedArr;
}
