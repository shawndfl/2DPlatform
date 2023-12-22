import rect from '../math/rect';
import vec2 from '../math/vec2';

export class Edge {
  start: vec2;
  end: vec2;
}

export class EdgeCollision2D {
  buildEdges(rects: rect[], result: Edge[]): Edge[] {
    if (!result) {
      result = [];
    }

    return result;
  }
}
