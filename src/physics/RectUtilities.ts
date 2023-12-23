import rect from '../math/rect';
import { Collision2D } from './Collision2D';

export enum CollisionEdges {
  None = 0x00,
  Left = 0x01,
  Right = 0x02,
  Top = 0x04,
  Bottom = 0x8,
  All = Left | Right | Top | Bottom,
}

export interface CollisionCorrection {
  edges: CollisionEdges;
  left: number;
  right: number;
  top: number;
  bottom: number;
}

export class RectUtilities {
  static collisionCorrection(
    myRect: Collision2D,
    others: Collision2D[],
    simCount: number = 1
  ): CollisionCorrection {
    let results: CollisionCorrection = {
      edges: CollisionEdges.None,
      top: 0,
      bottom: 0,
      left: 0,
      right: 0,
    };

    const step = 0.5;

    for (let sim = 0; sim < simCount; sim++) {
      for (let i = 0; i < others.length; i++) {
        const b1 = myRect.bounds;
        const b2 = others[i].bounds;
        const xOverLap = b1.edgeOverlapX(b2);
        const yOverLap = b1.edgeOverlapY(b2);
        const left = myRect.bounds.left + xOverLap * step;
        const top = myRect.bounds.top + yOverLap * step;

        myRect.bounds.setPosition(left, top);

        if (xOverLap < 0) {
          results.edges = results.edges | CollisionEdges.Right;
        }
        if (xOverLap > 0) {
          results.edges = results.edges | CollisionEdges.Left;
        }

        if (yOverLap > 0) {
          results.edges = results.edges | CollisionEdges.Bottom;
        }
        if (yOverLap < 0) {
          results.edges = results.edges | CollisionEdges.Top;
        }
      }
    }
    return results;
  }

  /**
   * Calculates the correction for the left edge overlap on a rect.
   * If there is a valid left edge this function will return the overlap.
   * The overlap can be added to the left of myRect to move it out of the left collision.
   * @param myRect
   * @param others
   * @returns
   */
  static leftEdgeCorrection(
    myRect: Collision2D,
    others: Collision2D[]
  ): number {
    const b1 = myRect;

    let leftEdge = 0;

    // look over all collision that are overlapping this on the left edge.
    for (let i = 0; i < others.length; i++) {
      const b2 = others[i];
      const leftOverlap = b1.bounds.edgeOverlapX(b2.bounds);

      // -1 is top edge, 1 is bottom edge, 0 is no y edge
      const edgeOverlapYSign = Math.sign(b1.bounds.edgeOverlapY(b2.bounds));

      // positive value means left overlap and if there is a top or bottom
      // over lap we need to make sure they are valid edges.
      if (leftOverlap > 0 && edgeOverlapYSign != 0) {
        let validOverlap = true;

        // before we can trust this edge lets make sure it's a valid corner
        for (let j = 0; j < others.length; j++) {
          if (j == i) {
            continue;
          }
          const adjacentRect = others[j];
          const adjacentRight = b1.bounds.edgeOverlapX(adjacentRect.bounds) < 0;
          const adjacentOverlapY = Math.sign(
            b1.bounds.edgeOverlapY(adjacentRect.bounds)
          );

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

  static rightEdgeCorrection(
    myRect: Collision2D,
    others: Collision2D[]
  ): number {
    const b1 = myRect;

    let rightEdge = 0;

    // look over all collision that are overlapping this on the left edge.
    for (let i = 0; i < others.length; i++) {
      const b2 = others[i];
      const rightOverlap = b1.bounds.edgeOverlapX(b2.bounds);

      // -1 is top edge, 1 is bottom edge, 0 is no y edge
      const edgeOverlapYSign = Math.sign(b1.bounds.edgeOverlapY(b2.bounds));

      // positive value means left overlap and if there is a top or bottom
      // over lap we need to make sure they are valid edges.
      if (rightOverlap < 0 && edgeOverlapYSign != 0) {
        let validOverlap = true;

        // before we can trust this edge lets make sure it's a valid corner.
        // look at each of the overlaps and make sure the y overlaps have the same sign
        // and it is not part of an adjacent corner
        for (let j = 0; j < others.length; j++) {
          if (j == i) {
            continue;
          }
          const adjacentRect = others[j];
          const adjacentLeft = b1.bounds.edgeOverlapX(adjacentRect.bounds) > 0;
          const adjacentOverlapY = Math.sign(
            b1.bounds.edgeOverlapY(adjacentRect.bounds)
          );

          // any right edge that overlaps the same top or bottom edge as this left
          // corner will cancel out this left corner corner (b2)
          if (adjacentLeft && adjacentOverlapY == edgeOverlapYSign) {
            validOverlap = false;
            break;
          }
        }

        if (validOverlap) {
          rightEdge = Math.min(rightEdge, rightOverlap);
        }
      } else if (rightOverlap < 0) {
        rightEdge = Math.min(rightEdge, rightOverlap);
      }
    }

    return rightEdge;
  }

  /**
   * The is the correction needed to move myRect top out of overlapping top edges from others
   * @param myRect
   * @param others
   * @returns
   */
  static topEdgeCorrection(myRect: Collision2D, others: Collision2D[]): number {
    const b1 = myRect;

    let topEdge = 0;

    // look over all collision that are overlapping this on the left edge.
    for (let i = 0; i < others.length; i++) {
      const b2 = others[i];
      const topOverlap = b1.bounds.edgeOverlapY(b2.bounds);

      // -1 is top edge, 1 is bottom edge, 0 is no y edge
      const edgeOverlapXSign = Math.sign(b1.bounds.edgeOverlapX(b2.bounds));

      // negative value means top overlap and if there is a right or left
      // overlap we need to make sure they are valid edges.
      if (topOverlap < 0 && edgeOverlapXSign != 0) {
        let validOverlap = true;

        // before we can trust this edge lets make sure it's a valid corner.
        // look at each of the overlaps and make sure the y overlaps have the same sign
        // and it is not part of an adjacent corner
        for (let j = 0; j < others.length; j++) {
          if (j == i) {
            continue;
          }
          const adjacentRect = others[j];
          const adjacentBottom =
            b1.bounds.edgeOverlapY(adjacentRect.bounds) > 0;
          const adjacentOverlapX = Math.sign(
            b1.bounds.edgeOverlapX(adjacentRect.bounds)
          );

          // any right edge that overlaps the same top or bottom edge as this left
          // corner will cancel out this left corner corner (b2)
          if (adjacentBottom && adjacentOverlapX == edgeOverlapXSign) {
            validOverlap = false;
            break;
          }
        }

        if (validOverlap) {
          topEdge = Math.min(topEdge, topOverlap);
        }
      } else if (topOverlap < 0) {
        topEdge = Math.min(topEdge, topOverlap);
      }
    }

    return topEdge;
  }

  /**
   * The is the correction needed to move myRect top out of overlapping top edges from others
   * @param myRect
   * @param others
   * @returns
   */
  static bottomEdgeCorrection(
    myRect: Collision2D,
    others: Collision2D[]
  ): number {
    const b1 = myRect;

    let bottomEdge = 0;

    // look over all collision that are overlapping this on the left edge.
    for (let i = 0; i < others.length; i++) {
      const b2 = others[i];
      const bottomOverlap = b1.bounds.edgeOverlapY(b2.bounds);

      // -1 is top edge, 1 is bottom edge, 0 is no y edge
      const edgeOverlapXSign = Math.sign(b1.bounds.edgeOverlapX(b2.bounds));

      // negative value means top overlap and if there is a right or left
      // overlap we need to make sure they are valid edges.
      if (bottomOverlap > 0 && edgeOverlapXSign != 0) {
        let validOverlap = true;

        // before we can trust this edge lets make sure it's a valid corner.
        // look at each of the overlaps and make sure the y overlaps have the same sign
        // and it is not part of an adjacent corner
        for (let j = 0; j < others.length; j++) {
          if (j == i) {
            continue;
          }
          const adjacentRect = others[j];
          const adjacentTop = b1.bounds.edgeOverlapY(adjacentRect.bounds) < 0;
          const adjacentOverlapX = Math.sign(
            b1.bounds.edgeOverlapX(adjacentRect.bounds)
          );

          // any right edge that overlaps the same top or bottom edge as this left
          // corner will cancel out this left corner corner (b2)
          if (adjacentTop && adjacentOverlapX == edgeOverlapXSign) {
            validOverlap = false;
            break;
          }
        }

        if (validOverlap) {
          bottomEdge = Math.max(bottomEdge, bottomOverlap);
        }
      } else if (bottomOverlap > 0) {
        bottomEdge = Math.max(bottomEdge, bottomOverlap);
      }
    }

    return bottomEdge;
  }
}
