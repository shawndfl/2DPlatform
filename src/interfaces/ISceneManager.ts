
export interface ISceneManager {
    changeScene(type: string): Promise<boolean>;
}