import vec4 from "../math/vec4";
import { GlBuffer } from "./GlBuffer";
import { Primitive, VertexFormat } from "./Primitive";


export class CreateShape {
    static createSquare(width: number, height: number, color: vec4): Primitive {
        const geo = new Primitive();
        geo.format = VertexFormat.Pos | VertexFormat.Color4;
        geo.stride = 3 * 4 * 4; // pos(float3) + color(float4) * sizeof float(4)
        return geo;
    }
}