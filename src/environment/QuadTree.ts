import { Component } from '../components/Component';
import { Engine } from '../core/Engine';

export const QuadWidth = 32;
export const QuadHeight = 16;

export class QuadNode {
  width: number;
  height: number;

  id: string;

  NW: QuadNode;
  NE: QuadNode;
  SE: QuadNode;
  SW: QuadNode;

  constructor(id: string, width: number, height: number) {
    this.width = width;
    this.width = height;
    this.id = id;
  }

  addQuad(id: string, screenX: number, screenY: number) {
    // see if this quad had room for more
    if (this.width <= QuadWidth && this.height <= QuadHeight) {
      throw new Error('too small to add quad ' + id);
    }
  }
}

export class QuadTree {
  private _quadWidth: number;
  private _quadHeight: number;
  private _root: QuadNode;
  private _maxDepth: number;

  constructor(maxDepth: number = 5) {
    this._quadWidth = 16;
    this._quadHeight = 32;
    this._root = new QuadNode('root', QuadWidth * 5, QuadHeight * 5);
  }

  initialize(quadWidth: number = 16, quadHeight: number = 32) {
    this._quadWidth = quadWidth;
    this._quadHeight = quadHeight;
  }

  addQuad(id: string, screenX: number, screenY: number) {}
}
