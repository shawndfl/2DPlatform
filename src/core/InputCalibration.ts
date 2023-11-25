import { Component } from "../components/Component";
import { GamepadInteraction, InputMappings } from "./InputMappings";


export class InputCalibration extends Component {

    /**
     * Are we calibrating the logical buttons.
     */
    isCalibrating: boolean;

    /**
     * When a step is calibration complete
     */
    onCalibrationStep: (stepName: string, button: GamepadInteraction, nextStep: string) => void

    /**
     * This flag will increase show the next prompt after a button is mapped.
     */
    calibrationNextPrompt: boolean;

    readonly mappingIndex = { Start: 0, A: 1, B: 2, Up: 3, Down: 4, Right: 5, Left: 6 };

    /**
     * Mapping for input
     */
    get inputMappings(): InputMappings {
        return this.eng.input.inputMappings;
    }

    /**
     * What are we actively calibrating? 
     * Keyboard, gamepad id
     */
    activeCalibration: string;

    /**
     * What logical button index are we calibrating.
     */
    get activeButtonIndex(): number {
        return this.inputMappings?.gamePadMapping.get(this.activeCalibration)?.length ?? 0;
    }

    beginCalibration(onCalibrationStep: (stepName: string, button: GamepadInteraction, nextStep: string) => void) {
        console.info('Starting new input calibration...');
        this.onCalibrationStep = onCalibrationStep;
        this.isCalibrating = true;
        this.calibrationNextPrompt = true;
        this.activeCalibration = null;
    }

    getActiveKey(index?: number): string {
        const mapIndex = index == undefined ? this.activeButtonIndex : index;
        return Array.from(Object.keys(this.mappingIndex)).find((key, index) =>
            index == mapIndex
        );
    }

    nextCalibration(): void {
        this.isCalibrating = true;
    }

    doneCalibrating() {
        window.localStorage.setItem('inputMapping', JSON.stringify(this.inputMappings));
        this.isCalibrating = false;
        console.debug('done calibrating!!')
    }

    update(dt: number): void {
        const gp = this.eng.input.gamepad;
        if (gp) {
            this.onGamePad(gp);
        }
    }

    onGamePad(e: Gamepad): void {
        if (!this.activeCalibration) {
            this.activeCalibration = e.id;
            this.inputMappings.gamePadMapping.set(this.activeCalibration, []);
        }
        if (this.activeCalibration != e.id) {
            return;
        }
        let padMapping = this.inputMappings.gamePadMapping.get(this.activeCalibration);

        for (let i = 0; i < e.buttons.length; i++) {
            if (e.buttons[i].pressed) {
                const interaction = { index: i, isButton: true, value: 0 }
                padMapping.push(interaction);
                this.isCalibrating = false;
                if (this.onCalibrationStep) {
                    const step = this.getActiveKey();
                    const next = this.getActiveKey(this.activeButtonIndex + 1);
                    this.onCalibrationStep(step, interaction, next);
                    return;
                }
            }
        }

        const axisThreshold = .2;
        for (let i = 0; i < e.axes.length; i++) {
            if (Math.abs(e.axes[i]) > axisThreshold) {
                const interaction = { index: i, isButton: false, value: e.axes[i] }
                padMapping.push(interaction);
                this.isCalibrating = false;
                if (this.onCalibrationStep) {
                    const step = this.getActiveKey();
                    const next = this.getActiveKey(this.activeButtonIndex + 1);
                    this.onCalibrationStep(step, interaction, next);
                    return;
                }
            }
        }
    }
}