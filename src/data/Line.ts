import vec2 from "../math/vec2";

export class LineData {
    id?: string;

    type?: string;
    /** start, end */
    line: [number, number, number, number];
}

export class Line {
    id: string;
    type: string;
    /** start, end */
    start: vec2;
    /** end */
    end: vec2;
    /** normal */
    normal: vec2;
}