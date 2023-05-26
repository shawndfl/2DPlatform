import song18 from '../assets/music/song18.mp3';

/**
 * Manages background sounds and sounds effects
 */
export class SoundManager {
  audio: HTMLAudioElement;
  userInteraction: boolean;

  constructor() {
    this.audio = new Audio(song18);
  }

  playMusic(music: string) {
    this.audio = new Audio(song18);
    this.audio.loop = true;
    this.audio.play();
  }

  UserReady() {
    if (!this.userInteraction) {
      //this.audio.play();
      //this.audio.loop = true;
      this.userInteraction = true;
    }
  }
}
