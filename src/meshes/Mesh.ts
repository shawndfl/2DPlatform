import { Component } from "../core/Component";
import { Engine } from "../core/Engine";
import { BaseShader } from "../shaders/BaseShader";
import { GlBuffer } from "../geometry/GlBuffer";
import { BaseMaterial } from "../materials/BaseMaterial";
import { SkinMesh2DShader } from "../shaders/SkinMesh2DShader";
import { Primitive, VertexFormat } from "../geometry/Primitive";
import mat4 from "../math/mat4";
import vec3 from "../math/vec3";


export class Mesh extends Component {
    protected buffer: GlBuffer;
    protected shader: SkinMesh2DShader;
    protected material: BaseMaterial;

    constructor(eng: Engine) {
        super(eng);

    }

    async initialize() {
        this.buffer = new GlBuffer(this.eng.gl);
        this.shader = new SkinMesh2DShader(this.eng.gl, 'skinMeshShader');

        // simple project for demo


        this.createTriangle();
    }

    createTriangle() {
        const primitive = new Primitive();
        primitive.stride = (3 + 4) * 4 /// pos3, color4, sizeof float
        primitive.format = VertexFormat.Pos | VertexFormat.Color4;
        primitive.indices = [];
        primitive.verts = [];
        // pos color
        primitive.verts.push(-.5, .5, 0);
        primitive.verts.push(1, 1, 0, 1);

        primitive.verts.push(.5, .5, 0);
        primitive.verts.push(1, 0, 1, 1);

        primitive.verts.push(.5, 0, 0);
        primitive.verts.push(1, 1, 1, 1);

        primitive.verts.push(-.5, 0, 0);
        primitive.verts.push(1, 0, 0, 1);

        primitive.indices.push(0, 3, 1);
        primitive.indices.push(1, 3, 2);

        this.buffer.setBuffersForPrimitive(primitive);
    }

    update(dt: number) {
        //this.gl.enable(this.gl.CULL_FACE);
        //this.gl.cullFace(this.gl.FRONT);

        this.buffer.enable();
        this.shader.enable();
        const proj = mat4.perspective(Math.PI / 4, this.eng.width / this.eng.height, 0, 500);
        const view = mat4.lookAt(new vec3(0, 10, 0), new vec3(0, 0, 0), new vec3(1, 0, 0));
        const wvp = proj.multiply(view);
        this.shader.setProj(wvp);

        const indices = this.buffer.indexCount;
        const type = this.gl.UNSIGNED_SHORT;
        const offset = 0;
        this.gl.drawElements(this.gl.TRIANGLES, indices, type, offset);
    }
}