
import { Component } from "../../components/Component";
import { PlatformEngine } from "../PlatformEngine";


/**
 * An abstract class the allows access to the PlatfromEngine
 */
export abstract class GameComponent extends Component {

    get eng(): PlatformEngine {
        return super.eng as PlatformEngine;
    }

    constructor(eng: PlatformEngine) {
        super(eng);
    }
}