import { Engine } from '../core/Engine';

/**
 * Used to build a  visual dialog
 */
export interface IDialogParams {
  x: number;
  y: number;

  /** width of the dialog in pixels left to right */
  width: number;
  height: number;

  /** in screen space 1 is behind -1 is in front of everything */
  depth: number;
}
