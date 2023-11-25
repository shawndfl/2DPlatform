export interface GamepadInteraction {
    /** This is a button or an axis */
    isButton: boolean;

    /** button or index axis */
    index: number;

    /** only for axis it's the value -1 or 1 */
    value: number;
}

export interface InputMappings {

    /**
     * Mapping for the game pads
     */
    gamePadMapping: Map<string, GamepadInteraction[]>
}
