export const epsilon = 0.0001;

//
// Custom math functions
//

/**
 * Common utilities
 * @module glMatrix
 */

// Configuration Constants
export let RANDOM = Math.random;

/**
 * Symmetric round
 * see https://www.npmjs.com/package/round-half-up-symmetric#user-content-detailed-background
 *
 * @param {Number} a value to round
 */
export function round(a: number): number {
  if (a >= 0) return Math.round(a);

  return a % 0.5 === 0 ? Math.floor(a) : Math.round(a);
}

export const degree = Math.PI / 180;
export const radian = 180 / Math.PI;

/**
 * Convert Degree To Radian
 *
 * @param {Number} a Angle in Degrees
 */
export function toRadian(a: number): number {
  return a * degree;
}

export function toDegrees(a: number): number {
  return a * radian;
}

/**
 * Tests whether or not the arguments have approximately the same value, within an absolute
 * or relative tolerance of glMatrix.EPSILON (an absolute tolerance is used for values less
 * than or equal to 1.0, and a relative tolerance is used for larger values)
 *
 * @param {Number} a The first number to test.
 * @param {Number} b The second number to test.
 * @returns {Boolean} True if the numbers are approximately equal, false otherwise.
 */
export function equals(a: number, b: number, threshold: number = epsilon): boolean {
  return Math.abs(a - b) <= threshold * Math.max(1.0, Math.abs(a), Math.abs(b));
}

/**
 * Clamp a number between values
 * @param num
 * @param min
 * @param max
 * @returns
 */

export function clamp(num: number, min: number, max: number): number {
  let val = num < min ? min : num > max ? max : num;
  return val;
}
