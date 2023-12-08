import { RANDOM } from '../math/constants';

/**
 * A simple random class that takes a seed value.
 * https://stackoverflow.com/questions/521295/seeding-the-random-number-generator-in-javascript
 */
export class Random {
  rand: () => number;

  constructor(seed: number) {
    const seedXor = seed ^ 0xdeadbeef; // 32-bit seed with optional XOR value
    // Pad seed with Phi, Pi and E.
    // https://en.wikipedia.org/wiki/Nothing-up-my-sleeve_number
    this.rand = this.sfc32(0x9e3779b9, 0x243f6a88, 0xb7e15162, seed);
  }

  getUuid(): string {
    if ((typeof window !== 'undefined') && window?.crypto?.randomUUID != undefined) {
      return window.crypto.randomUUID();
    } else {
      return (
        Math.floor(this.rand() * 100000000)
          .toString(16)
          .padStart(8, '0') +
        '-' +
        Math.floor(this.rand() * 1000)
          .toString(16)
          .padStart(4, '0') +
        '-' +
        Math.floor(this.rand() * 1000)
          .toString(16)
          .padStart(4, '0') +
        '-' +
        Math.floor(this.rand() * 100000000)
          .toString(16)
          .padStart(8, '0')
      );
    }
  }

  sfc32(a: number, b: number, c: number, d: number) {
    return () => {
      a >>>= 0;
      b >>>= 0;
      c >>>= 0;
      d >>>= 0;
      var t = (a + b) | 0;
      a = b ^ (b >>> 9);
      b = (c + (c << 3)) | 0;
      c = (c << 21) | (c >>> 11);
      d = (d + 1) | 0;
      t = (t + d) | 0;
      c = (c + t) | 0;
      return (t >>> 0) / 4294967296;
    };
  }
}
