
export enum VertexFormat {
    Pos = 0x0001,
    Color4 = 0x0002,
    Normal = 0x0004,
    Tex1 = 0x0008,
    Skin = 0x0010
}

export class Primitive {
    format: VertexFormat;
    verts: number[];
    stride: number;
    indices: number[];
}