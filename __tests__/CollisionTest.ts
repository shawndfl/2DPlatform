import { Curve, CurveType } from '../src/math/Curve';
import rect from '../src/math/rect';

test('encapsulates', () => {
  const r = new rect();
  // left    10
  // right   20
  // top     10
  // bottom  0
  r.set(10, 10, 10, 10);
  const r2 = new rect();

  r2.set(11, 2, 9, 2);
  expect(r.encapsulates(r2)).toBe(true);

  r2.set(11, 2, 11, 2);
  expect(r.encapsulates(r2)).toBe(false);

  r2.set(9, 10, 10, 2);
  expect(r.encapsulates(r2)).toBe(false);

  r2.set(10.0001, 9.8999, 9.9999, 9.8999);
  expect(r.encapsulates(r2)).toBe(true);
});

test('collisionCorners', () => {
  const r = new rect();
  r.set(10, 10, 10, 10);
  const r2 = new rect();

  r2.set(5, 6, 5, 6);
  expect(r.intersects(r2)).toBe(true);

  r2.set(5, 6, 9, 6);
  expect(r.intersects(r2)).toBe(true);

  r2.set(19, 6, 5, 6);
  expect(r.intersects(r2)).toBe(true);

  r2.set(19, 6, 9, 6);
  expect(r.intersects(r2)).toBe(true);
});

test('collisionMiss', () => {
  const r = new rect();
  r.set(10, 10, 10, 10);
  const r2 = new rect();

  r2.set(5, 5, 5, 6);
  expect(r.intersects(r2)).toBe(false);

  r2.set(5, 5, 9, 6);
  expect(r.intersects(r2)).toBe(false);

  r2.set(20, 6, 5, 6);
  expect(r.intersects(r2)).toBe(false);

  r2.set(20, 6, 9, 6);
  expect(r.intersects(r2)).toBe(false);
});

test('collisionOverlap', () => {
  const r = new rect();
  r.set(10, 10, 10, 10);
  const r2 = new rect();

  r2.set(5, 30, 5, 2);
  expect(r.intersects(r2)).toBe(true);

  r2.set(15, 2, 15, 20);
  expect(r.intersects(r2)).toBe(true);
});

test('collisionOverlapMiss', () => {
  const r = new rect();
  r.set(10, 10, 10, 10);
  const r2 = new rect();

  r2.set(5, 30, 12, 2);
  expect(r.intersects(r2)).toBe(false);

  r2.set(20, 2, 15, 20);
  expect(r.intersects(r2)).toBe(false);
});
