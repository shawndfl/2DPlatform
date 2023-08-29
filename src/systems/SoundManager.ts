/**
 * Manages background sounds and sounds effects
 */
export class SoundManager {
  audio: HTMLAudioElement;
  userInteraction: boolean;

  constructor() {}

  playMusic(music: string): void {
    console.warn("sound manager not implemented.");
  }

  UserReady() {
    if (!this.userInteraction) {
      //this.audio.play();
      //this.audio.loop = true;
      this.userInteraction = true;
    }
  }
}
