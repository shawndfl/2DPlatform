import { Component } from "../../core/Component";
import { SceneComponent } from "../../components/SceneComponent";
import { MainMenu } from "./MainMenu";
import { Engine } from "../../core/Engine";

/**
 * Used to create scenes
 */
export class SceneFactory extends Component {

    constructor(eng: Engine) {
        super(eng);
    }

    createScene(type: string): SceneComponent {
        switch(type) {
            case 'main.menu':
            return new MainMenu(this.eng);
        }
    
    }
}