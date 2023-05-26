import vec2 from '../math/vec2';

export enum TouchLayer {
  /** Top layer */
  Gui = 1,
  /** Game layer will require the touch point to be transformed by the viewManager */
  Game = 2,
  /** None */
  Empty = 3,
}

/**
 * Touch Event
 */
export interface TouchEvent {
  /** touch location on the surface */
  point: vec2;
  /** The html touch event */
  touchEvent: TouchEvent;

  /** The surface that was touched */
  surface: TouchSurfaceData;
}

/**
 * Data that describes a touch surface
 */
export interface TouchSurfaceData {
  id: string;

  /** List of collision points */
  points: vec2[];

  /** Indices that make up a collection of triangles. This is used in touch detection */
  triangleIndices: number[];

  /** lower numbers are farer and higher numbers are closer */
  zIndex: number;

  /** What touch layer is this part of */
  layer: number;

  /** can this point be touched */
  enable: boolean;

  /** touch event handler. If returns true the event was handled else it will check the next surface */
  touchHandler: (e: TouchEvent) => boolean;
}
