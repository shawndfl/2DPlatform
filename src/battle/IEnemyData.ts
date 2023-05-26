export interface IEnemyData {
  id: string;
  name: string;
  health: number;
  strength: number;
  defense: number;
  speed: number;
  exp: number;
  animIdle: [
    {
      time: number;
      img: string;
      offset: [number, number];
      flip: boolean;
      scale: [number, number];
    }
  ];

  animHit: [
    {
      time: number;
      img: string;
      offset: [number, number];
      flip: boolean;
      scale: [number, number];
    }
  ];

  animDie: [
    {
      time: number;
      img: string;
      offset: [number, number];
      flip: boolean;
      scale: [number, number];
    }
  ];

  animAttack: [
    {
      time: number;
      img: string;
      offset: [number, number];
      flip: boolean;
      scale: [number, number];
    }
  ];

  animSpecial: [
    {
      time: number;
      img: string;
      offset: [number, number];
      flip: boolean;
      scale: [number, number];
    }
  ];
}
