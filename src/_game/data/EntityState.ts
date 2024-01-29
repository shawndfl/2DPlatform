/**
 * State an entity can be in
 */
export enum EntityStateFlags {
  None = 0x0000,
  Idle = 0x0001,
  Running = 0x0002,
  Falling = 0x0004,
  Jumping = 0x0008,
  SlidingDownWall = 0x0010,
  OffGround = Falling | Jumping | SlidingDownWall,
  Hit = 0x0040,
  Dead = 0x0080,
  TeleportUp = 0x0100,
  TeleportDown = 0x0200,
  Teleporting = TeleportDown | TeleportUp,
  Shooting = 0x1000,
}

export class EntityState {
  constructor(private state: EntityStateFlags) {}

  append(flag: EntityStateFlags): void {
    this.state = this.state | flag;
  }

  remove(flag: EntityStateFlags): void {
    this.state = this.state & ~flag;
  }

  set(flag: EntityStateFlags): void {
    this.state = flag;
  }

  isTrue(flag: EntityStateFlags): boolean {
    return (this.state & flag) > 0;
  }
}
