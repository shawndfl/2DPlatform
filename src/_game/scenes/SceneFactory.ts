import { Component } from "../../components/Component";
import { SceneComponent } from "../../components/SceneComponent";
import { MainMenu } from "./MainMenu";
import { Engine } from "../../core/Engine";
import { Level1 } from "./Level1";
import { GameComponent } from "../components/GameComponent";
import { PlatformEngine } from "../PlatformEngine";

/**
 * Used to create scenes
 */
export class SceneFactory extends GameComponent {

    constructor(eng: PlatformEngine) {
        super(eng);
    }

    createScene(type: string): SceneComponent {
        switch (type) {
            case 'main.menu':
                return new MainMenu(this.eng);
            case 'level.1.0':
                return new Level1(this.eng);
        }

    }
}