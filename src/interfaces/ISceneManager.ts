
export interface ISceneManager {
     initialize(): Promise<void>;

     update(dt: number): void;

    changeScene(type: string): Promise<boolean>;
}