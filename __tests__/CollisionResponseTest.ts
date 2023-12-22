import { Curve, CurveType } from '../src/math/Curve';
import rect from '../src/math/rect';
import vec2 from '../src/math/vec2';
import vec3 from '../src/math/vec3';
import { Collision2D } from '../src/physics/Collision2D';

enum ValidCornerState {
  None,
  ValidX,
  ValidY,
  ValidBoth,
}

// hitting max x
// find all none corners first and get limit for x and y
//

/**
 * Calculates the correction for the left edge.
 * If there is a valid left edge this function will return the overlap.
 * The overlap can be added to the position of myRect to move it out of the left collision.
 * @param dir
 * @param collision
 * @param others
 * @param adjusted
 * @returns
 */
function leftEdgeCorrection(myRect: rect, others: rect[]): number {
  const b1 = myRect;

  let leftEdge = 0;

  // look over all collision that are overlapping this on the left edge.
  for (let i = 0; i < others.length; i++) {
    const b2 = others[i];
    const leftOverlap = b1.edgeOverlapX(b2);

    // -1 is top edge, 1 is bottom edge, 0 is no y edge
    const edgeOverlapYSign = Math.sign(b1.edgeOverlapY(b2));

    // positive value means left overlap and if there is a top or bottom
    // over lap we need to make sure they are valid edges.
    if (leftOverlap > 0 && edgeOverlapYSign != 0) {
      let validOverlap = true;
      // before we can trust this edge lets make sure it's a valid corner
      for (let j = i + 1; j < others.length; j++) {
        const adjacentRect = others[j];
        const adjacentRight = b1.edgeOverlapX(adjacentRect) < 0;
        const adjacentOverlapY = Math.sign(b1.edgeOverlapY(adjacentRect));

        // any right edge that overlaps the same top or bottom edge as this left
        // corner will cancel out this left corner corner (b2)
        if (adjacentRight && adjacentOverlapY == edgeOverlapYSign) {
          validOverlap = false;
          break;
        }
      }

      if (validOverlap) {
        leftEdge = Math.max(leftEdge, leftOverlap);
      }
    } else if (leftOverlap > 0) {
      leftEdge = Math.max(leftEdge, leftOverlap);
    }
  }

  return leftEdge;
}

test('collision response single left', () => {
  const r = new rect();
  // left    0
  // right   10
  // top     10
  // bottom  0
  r.set(0, 10, 10, 10);
  const r2 = new rect();
  const others = [r2];

  r2.set(-1, 2, 11, 2);

  expect(leftEdgeCorrection(r, others)).toBe(1);
});

test('collision response left multiple', () => {
  const r = new rect();
  // left    0
  // right   10
  // top     10
  // bottom  0
  r.set(0, 10, 10, 10);
  const r2 = new rect();
  const r3 = new rect();
  const r4 = new rect();
  const others = [r2, r3, r4];

  r2.set(-1, 2, 11, 3);
  r3.set(-1, 4, 7, 3);
  r4.set(-1, 2, 2, 4);

  expect(leftEdgeCorrection(r, others)).toBe(3);
});

test('collision response left corner', () => {
  const r = new rect();
  // left    0
  // right   10
  // top     10
  // bottom  0
  r.set(0, 10, 10, 10);
  const r2 = new rect();
  const r3 = new rect();
  const r4 = new rect();
  const others = [r2, r3, r4];

  r2.set(-1, 3, 11, 3);
  r3.set(9, 2, 11, 2);
  r4.set(-1, 2, 2, 4);

  expect(leftEdgeCorrection(r, others)).toBe(1);

  r2.set(-1, 3, 11, 3);
  r3.set(11, 2, 11, 2);
  r4.set(-1, 2, 2, 4);

  expect(leftEdgeCorrection(r, others)).toBe(2);
});
