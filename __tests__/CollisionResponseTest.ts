import { Collision2D } from '../src/physics/Collision2D';
import { RectUtilities } from '../src/physics/RectUtilities';

test('collision response single left', () => {
  const r = new Collision2D(null, null, null);
  // left    0
  // right   10
  // top     10
  // bottom  0
  r.set(0, 10, 10, 10);
  const r2 = new Collision2D(null, null, null);
  const others = [r2];

  r2.set(-1, 2, 11, 2);

  expect(RectUtilities.leftEdgeCorrection(r, others)).toBe(1);
});

test('collision response left multiple', () => {
  const r = new Collision2D(null, null, null);
  // left    0
  // right   10
  // top     10
  // bottom  0
  r.set(0, 10, 10, 10);
  const r2 = new Collision2D(null, null, null);
  const r3 = new Collision2D(null, null, null);
  const r4 = new Collision2D(null, null, null);
  const others = [r2, r3, r4];

  r2.set(-1, 2, 11, 3);
  r3.set(-1, 4, 7, 3);
  r4.set(-1, 2, 2, 4);

  expect(RectUtilities.leftEdgeCorrection(r, others)).toBe(3);
});

test('collision response left corner', () => {
  const r = new Collision2D(null, null, null);
  // left    0
  // right   10
  // top     10
  // bottom  0
  r.set(0, 10, 10, 10);
  const r2 = new Collision2D(null, null, null);
  const r3 = new Collision2D(null, null, null);
  const r4 = new Collision2D(null, null, null);
  const others = [r2, r3, r4];

  // top right corner cancel out left corner
  r2.set(-1, 3, 11, 3);
  r3.set(9, 2, 11, 2);
  r4.set(-1, 2, 2, 4);

  expect(RectUtilities.leftEdgeCorrection(r, others)).toBe(1);
  // right corner cancelled by left corner
  expect(RectUtilities.rightEdgeCorrection(r, others)).toBe(0);

  // top right corner no longer overlaps so top left corner is used
  r2.set(-1, 3, 11, 3);
  r3.set(11, 2, 11, 2);
  r4.set(-1, 2, 2, 4);

  expect(RectUtilities.leftEdgeCorrection(r, others)).toBe(2);

  // top left corner move out of overlap
  r2.set(-5, 3, 11, 3);
  r3.set(9, 2, 11, 2);
  r4.set(-1, 2, 2, 4);
  expect(RectUtilities.rightEdgeCorrection(r, others)).toBe(-1);
});
