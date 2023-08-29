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

  Menu = 0x0010,
  Action = 0x0020,
  Cancel = 0x0040,

  // press actions. This happens when the buttons is released
  // and reset for the next frame.
  RightPressed = 0x0080,
  LeftPressed = 0x0100,
  UpPressed = 0x0200,
  DownPressed = 0x0400,

  MenuPressed = 0x0800,
  ActionPressed = 0x1000,
  CancelPressed = 0x2000,

  Tap = 0x4000,
}
