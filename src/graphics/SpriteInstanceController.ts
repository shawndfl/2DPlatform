import { Component } from "../components/Component";
import { Engine } from "../core/Engine";
import { GlBufferQuadInstance, IQuadModelInstance } from "../geometry/GlBufferQuadInstance";
import { toRadian } from "../math/constants";
import mat2 from "../math/mat2";
import vec2 from "../math/vec2";
import vec3 from "../math/vec3";
import vec4 from "../math/vec4";
import { SpriteInstanceShader } from "../shaders/SpriteInstanceShader";
import { TileData } from "./ISpriteData";
import { Texture } from "./Texture";

export interface QuadBuildArgs {

    /** Translation in pixel space */
    translation?: vec2;

    depth?: number;

    /** pixel offset on the sprite sheet texture */
    spritePosition?: vec2;
    /** pixel offset on the sprite sheet texture */
    spriteSize?: vec2;

    /** Color that is multiplied by the final color */
    color?: vec4;

    /** 
     * Applied before the rotation and scale.
     * 0,0 is the center of the quad.
     * min (-1,-1) max(1,1)
     * To offset to bottom left corner offset(1,1)
     * To offset to top center offset (0, -1)
     */
    offset?: vec2;

    /** Rotation in degrees around the offset */
    rotation?: number;

    /** image scale */
    scale?: number;

    scaleWidth?: number;

    scaleHeight?: number;

    /** fip the image on the x axis */
    flipX?: boolean;

    /** fip the image on the y axis */
    flipY?: boolean;

    /** tile data for the sprite. This will be overridden by the above properties */
    tileData?: TileData;
}

/**
 * Manages a collection of quads that all get rendered at once.s
 */
export class SpriteInstanceController extends Component {
    private shader: SpriteInstanceShader;
    private buffer: GlBufferQuadInstance;
    private spriteTexture: Texture;
    private quads: Map<string, IQuadModelInstance>;
    private dirty: boolean;

    constructor(eng: Engine) {
        super(eng);
        this.shader = new SpriteInstanceShader(eng.gl, 'instancing');
        this.buffer = new GlBufferQuadInstance(eng.gl);
        this.quads = new Map<string, IQuadModelInstance>();
    }

    /**
     * Initialize a texture
     */
    initialize(): void {
        this.spriteTexture = this.eng.assetManager.menu.texture;
    }

    /**
     * Sets the texture
     * @param texture 
     */
    setTexture(texture: Texture): void {
        this.spriteTexture = texture;
    }

    /**
     * build a quad
     * @param id 
     * @param args 
     * @returns 
     */
    buildQuad(id: string, args: QuadBuildArgs): IQuadModelInstance {

        let quad = this.getQuad(id);
        if (!quad) {
            // create a default
            quad = {
                id: id,
                translation: new vec3(0, 0, 0),
                offset: new vec2(0, 0),
                color: new vec4([1, 1, 1, 1]),
                rotScale: mat2.identity.copy(),
                maxTex: new vec2([1, 1]),
                minTex: new vec2([0, 0]),
            }
        }

        // tileData comes from the sprite sheet. This must be set first then the other properties 
        // can choose to override it. 
        if (args.tileData) {
            const pos = new vec2(args.tileData.loc[0], args.tileData.loc[1]);
            const size = new vec2(args.tileData.loc[2], args.tileData.loc[3]);
            this.pixelsToUv(pos, size, quad.minTex, quad.maxTex);

            // rotate
            if (args.tileData.rotate) {
                quad.rotScale.rotate(args.tileData.rotate);
            }
            // flip
            if (args.tileData.flip) {
                const tmp = quad.minTex.x;
                quad.minTex.x = quad.maxTex.x;
                quad.maxTex.x = tmp;
                // set offset
                if (args.tileData.offset) {
                    quad.offset = new vec2(args.tileData.offset[2], args.tileData.offset[3]);
                }
            } else {
                // set offset
                if (args.tileData.offset) {
                    quad.offset = new vec2(args.tileData.offset[0], args.tileData.offset[1]);
                }
            }
        }

        if (args.translation) {
            quad.translation.x = args.translation.x;
            quad.translation.y = args.translation.y;
        }
        if (args.depth != undefined) {
            quad.translation.z = args.depth;
        }

        quad.rotScale.setIdentity();
        if (args.rotation != undefined) {
            quad.rotScale.rotate(toRadian(args.rotation))
        }
        if (args.scale || args.scaleHeight || args.scaleWidth) {
            const w = args.scaleWidth ?? args.scale ?? 1.0;
            const h = args.scaleHeight ?? args.scale ?? 1.0;
            quad.rotScale.scaleNumber(w, h);
        }
        if (args.color) {
            quad.color = args.color;
        }
        if (args.spritePosition && args.spriteSize) {
            this.pixelsToUv(args.spritePosition, args.spriteSize, quad.minTex, quad.maxTex);
            if (args.flipX) {
                const tmp = quad.minTex.x;
                quad.minTex.x = quad.maxTex.x;
                quad.maxTex.x = tmp;
            }
            if (args.flipY) {
                const tmp = quad.minTex.y;
                quad.minTex.y = quad.maxTex.y;
                quad.maxTex.y = tmp;
            }
        }

        if (args.offset) {
            quad.offset.x = args.offset.x;
            quad.offset.y = args.offset.y;
        }

        this.addQuad(quad);

        return quad;
    }

    /**
     * Get a quad from an id
     * @param id 
     * @returns 
     */
    getQuad(id: string): IQuadModelInstance {
        return this.quads.get(id);
    }

    /**
     * Add or update a quad.
     * @param quad 
     */
    addQuad(quad: IQuadModelInstance): void {
        this.quads.set(quad.id, quad);
        this.dirty = true;
    }

    /**
     * Commit the quads to the vertex buffers
     * @param force 
     */
    commitToBuffer(force?: boolean): void {
        if (this.dirty || force) {
            const array = Array.from(this.quads.values());
            this.buffer.setBuffers(array);
        }
        this.dirty = false;
    }

    /**
     * Converts textures from pixels to uv space
     * @param spriteX 
     * @param spriteY 
     * @param spriteW 
     * @param spriteH 
     * @returns 
     */
    pixelsToUv(spritePos: vec2, spriteSize: vec2, resultsMin: vec2, resultsMax: vec2): void {
        const sheetW = this.spriteTexture.width;
        const sheetH = this.spriteTexture.height;
        let minX = spritePos.x / sheetW;
        let minY = 1.0 - spritePos.y / sheetH;
        let maxX = (spritePos.x + spriteSize.x) / sheetW;
        let maxY = 1.0 - (spritePos.y + spriteSize.y) / sheetH;

        resultsMin.x = minX;
        resultsMin.y = minY;
        resultsMax.x = maxX;
        resultsMax.y = maxY;
    }


    /**
     * For testing
     * @param dt 
     */
    update(dt: number): void {
        this.commitToBuffer();

        const view = this.eng.viewManager;
        let projection = view.projection;

        this.shader.setSpriteSheet(this.spriteTexture);
        this.shader.enable();

        // set the project
        this.shader.setProj(projection);

        this.buffer.enable();
        const type = this.gl.UNSIGNED_SHORT;

        this.gl.drawElementsInstanced(this.gl.TRIANGLES, this.buffer.indexCount, type, 0, this.buffer.instanceCount);
    }
}