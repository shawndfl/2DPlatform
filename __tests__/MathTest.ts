import vec2 from '../src/math/vec2';

test('screenToTile', () => {
  const screen = new vec2(0, 0);
  const screenSize = new vec2(800, 600);

  console.debug('screen ' + screen);

  const tiles: number[][][] = [[[]]];
  for (let k = 0; k < 1; k++) {
    tiles.push([[]]);
    for (let j = 0; j < 10; j++) {
      tiles[k].push([]);
      for (let i = 0; i < 10; i++) {
        tiles[k][j].push(1);
      }
    }
  }
});
