import { Curve, CurveType } from '../src/math/Curve';

test('curve', () => {
  const curve = new Curve();

  curve.points([
    { p: 0, t: 0 },
    { p: 10, t: 1 },
    { p: 30, t: 3 },
    { p: 20, t: 2 },
  ]);

  curve.curve(CurveType.linear).start(true);
  expect(curve.isDone()).toBe(false);

  curve.update(0.5);
  expect(curve.getValue()).toBe(5);

  curve.update(0.5);
  expect(curve.getValue()).toBe(10);

  curve.update(0.5);
  expect(curve.getValue()).toBe(15);

  curve.update(0.5);
  expect(curve.getValue()).toBe(20);

  curve.update(0.5);
  expect(curve.getValue()).toBe(25);

  curve.update(0.5);
  expect(curve.getValue()).toBe(30);

  expect(curve.isDone()).toBe(true);
});

test('curveStart', () => {
  const curve = new Curve();

  curve.points([
    { p: 0, t: 0 },
    { p: 1, t: 1 },
    { p: 2, t: 2 },
  ]);
  curve.start(true);
  expect(curve.getValue()).toBe(0);

  curve.reverse(true).start(true);
  expect(curve.getValue()).toBe(2);
});

test('curvePause', () => {
  const curve = new Curve();

  curve.points([
    { p: 0, t: 0 },
    { p: 1, t: 1 },
    { p: 2, t: 2 },
  ]);
  // start
  curve.start(true);
  expect(curve.getValue()).toBe(0);

  // update // marty music
  curve.update(1);
  expect(curve.getValue()).toBe(1);

  // stop
  curve.pause(10);
  curve.update(1);

  // no change
  expect(curve.getValue()).toBe(10);

  // start again
  curve.start();
  curve.update(1);
  expect(curve.getValue()).toBe(2);
});

test('curve2', () => {
  const curve = new Curve();

  curve.points([
    { p: 0, t: 0 },
    { p: 1, t: 1 },
    { p: 2, t: 2 },
  ]);

  // setup ping pong. It will only work if you repeat the action at least once.
  curve.curve(CurveType.discreet).pingPong(true).repeat(1).start(true);

  expect(curve.getValue()).toBe(0);

  curve.update(1);
  expect(curve.getValue()).toBe(1);

  curve.update(1);
  // check time
  expect(curve.getTime()).toBe(2);
  // check value
  expect(curve.getValue()).toBe(2);

  curve.update(1);
  expect(curve.getValue()).toBe(1);

  curve.update(1);
  expect(curve.getValue()).toBe(0);

  expect(curve.isDone()).toBe(true);
});

test('curveSetPosition', () => {
  const curve = new Curve();

  curve.points([
    { p: 0, t: 0 },
    { p: 1, t: 1 },
    { p: 2, t: 2 },
  ]);

  // setup ping pong. It will only work if you repeat the action at least once.
  curve.curve(CurveType.discreet).pingPong(true).repeat(1).start(true);

  expect(curve.getValue()).toBe(0);

  curve.update(1);
  expect(curve.getValue()).toBe(1);

  curve.update(1);
  // check time
  expect(curve.getTime()).toBe(2);
  // check value
  expect(curve.getValue()).toBe(2);

  curve.update(1);
  expect(curve.getValue()).toBe(1);

  curve.update(1);
  expect(curve.getValue()).toBe(0);

  expect(curve.isDone()).toBe(true);
});
