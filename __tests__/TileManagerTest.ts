import vec3 from '../src/math/vec3';
import { TileHelper } from '../src/utilities/TileHelper';

class MockEngine {
  constructor() {}
  get height(): number {
    return 600;
  }
  get width(): number {
    return 800;
  }
}

test('Tile', () => {
  const eng = new MockEngine();

  const t = new TileHelper(eng as any);

  const point = new vec3(400, 0, -1);

  const newCell = t.toTileLoc(point);
  expect(newCell.x).toBeCloseTo(0, 2);
  expect(newCell.y).toBeCloseTo(0, 2);
  //expect(newCell.z).toBeCloseTo(0, 2);
});

test('Tile side of the screen', () => {
  const eng = new MockEngine();

  const t = new TileHelper(eng as any);

  const point = new vec3(0, 300, 0);

  const newCell = t.toTileLoc(point);
  expect(newCell.x).toBeCloseTo(0, 2);
  expect(newCell.y).toBeCloseTo(0, 2);
  //expect(newCell.z).toBeCloseTo(0, 2);
});

test('TileToScreen', () => {
  const eng = new MockEngine();

  const t = new TileHelper(eng as any);

  const point = t.toScreenLoc(0, 0, 0);
  expect(point.x).toBeCloseTo(400, 2);
  expect(point.y).toBeCloseTo(584, 2);
  expect(point.z).toBeCloseTo(1, 2);

  const newCell = t.toTileLoc(point);
  expect(newCell.x).toBeCloseTo(0, 2);
  expect(newCell.y).toBeCloseTo(0, 2);
  expect(newCell.z).toBeCloseTo(0, 2);
});

test('TileToScreenHeight', () => {
  const eng = new MockEngine();

  const t = new TileHelper(eng as any);

  const point = t.toScreenLoc(0, 2, 1);
  console.debug('point ' + point.x + ', ' + point.y + ', ' + point.z);
  //expect(point.x).toBeCloseTo(336, 2);
  //expect(point.y).toBeCloseTo(552, 2);
  //expect(point.z).toBeCloseTo(0, 2);

  const newCell = t.toTileLoc(point);
  console.debug('point ' + point.x + ', ' + point.y + ', ' + point.z);
  //expect(newCell.x).toBeCloseTo(0, 2);
  //expect(newCell.y).toBeCloseTo(2, 2);
  //expect(newCell.z).toBeCloseTo(0, 2);
});
