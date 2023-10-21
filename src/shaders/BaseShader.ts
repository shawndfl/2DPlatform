import mat4 from '../math/mat4';
import vec3 from '../math/vec3';
import vec4 from '../math/vec4';

/**
 * Manages one shader program
 */
export abstract class BaseShader {
    protected shaderProgram: WebGLProgram;

    /**
     * Creates the shader controller
     * @param {WebGL2RenderingContext} gl GL Context
     * @param {string} shaderName The name of the shader. This is just a way to id different shader for debugging
     */
    constructor(protected gl: WebGL2RenderingContext, protected shaderName: string) { }

    /**
     * Initialize a shader program, so WebGL knows how to draw our data
     * @param {*} vsSource
     * @param {*} fsSource
     * @returns
     */
    protected initShaderProgram(vsSource: string, fsSource: string): void {
        const vertexShader = this.loadShader(this.gl.VERTEX_SHADER, vsSource);
        const fragmentShader = this.loadShader(this.gl.FRAGMENT_SHADER, fsSource);

        // Create the shader program
        this.shaderProgram = this.gl.createProgram();
        this.gl.attachShader(this.shaderProgram, vertexShader);
        this.gl.attachShader(this.shaderProgram, fragmentShader);

        // set the attribute locations
        // not these must exist in the shader so that
        // the buffer maps to the correct locations.
        this.bindAttributes(this.shaderProgram);

        // link the program
        this.gl.linkProgram(this.shaderProgram);

        // needed for get program parameter
        this.gl.useProgram(this.shaderProgram);

        // If creating the shader program failed, alert
        if (!this.gl.getProgramParameter(this.shaderProgram, this.gl.LINK_STATUS)) {
            console.error(
                `Unable to initialize the shader program: ${this.gl.getProgramInfoLog(
                    this.shaderProgram
                )}`
            );
        }
    }

    /**
     * Fill in the attributes for the shader
     * @param program 
     */
    protected abstract bindAttributes(program: WebGLProgram): void;

    /**
     * Get a shader attribute location
     * @param {string} name Name of the attribute
     * @return {number} The attribute location
     */
    protected getAttribute(name: string): number {
        this.gl.useProgram(this.shaderProgram);

        const loc = this.gl.getAttribLocation(this.shaderProgram, name);
        if (loc === null) {
            console.error(
                'can not find attribute: ' + name + ' in shader ' + this.shaderName
            );
        }
        return loc;
    }

    /**
     * Get a shader attribute location
     * @param {string} name Name of the attribute
     * @return {number} The attribute location
     */
    protected getUniform(name: string): number {
        this.gl.useProgram(this.shaderProgram);

        const loc = this.gl.getUniformLocation(this.shaderProgram, name);
        if (loc === null) {
            console.error(
                'can not find uniform: ' + name + ' in shader ' + this.shaderName
            );
        }
        return loc as number;
    }

    /**
     * Sets a uniform for a vec4
     * @param loc
     * @param value
     */
    protected setVec4(loc: number, value: vec4) {
        this.gl.uniform4f(loc, value.x, value.y, value.z, value.w);
    }

    /**
     * Set the mat 4
     * @param loc
     * @param value
     */
    protected setMat4(loc: number, value: mat4) {
        this.gl.uniformMatrix4fv(loc, false, value.getValues());
    }

    /**
     * Sets a uniform for a vec3
     * @param loc
     * @param value
     */
    protected setVec3(loc: number, value: vec3) {
        this.gl.uniform3f(loc, value.x, value.y, value.z);
    }

    /**
     * Enable the shader
     */
    enable() {
        // Tell WebGL to use our program when drawing
        this.gl.useProgram(this.shaderProgram);
    }

    /**
     * creates a shader of the given type, uploads the source and
     * compiles it.
     * @param {*} gl
     * @param {*} type
     * @param {*} source
     * @returns
     */
    private loadShader(type: number, source: string) {
        const shader = this.gl.createShader(type);

        // Send the source to the shader object
        this.gl.shaderSource(shader, source);

        // Compile the shader program
        this.gl.compileShader(shader);

        // See if it compiled successfully
        if (!this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS)) {
            const typeString = type == this.gl.VERTEX_SHADER ? 'vertex' : 'fragment';
            console.error(
                `An error occurred compiling the ${typeString} shaders in ${this.shaderName
                }: ${this.gl.getShaderInfoLog(shader)}`
            );
            this.gl.deleteShader(shader);
            return null;
        }

        return shader;
    }
}
