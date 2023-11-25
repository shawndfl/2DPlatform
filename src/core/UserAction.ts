/**
 * User input action.
 */
export enum UserAction {
  None = 0x0000,
  Right = 0x0001,
  Left = 0x0002,
  Up = 0x0004,
  Down = 0x0008,

  UpRight = Right | Up,
  UpLeft = Left | Up,
  DownRight = Right | Down,
  DownLeft = Left | Down,

  Start = 0x0010,
  A = 0x0040,
  B = 0x0080,
}
