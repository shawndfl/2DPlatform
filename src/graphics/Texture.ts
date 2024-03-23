/**
 * OpenGL texture
 */
export class Texture {
  glTexture: WebGLTexture;
  texturePath: string;
  width: number;
  height: number;

  public get id(): string {
    return this._id;
  }

  constructor(private _id: string, private gl: WebGL2RenderingContext) {
    this.glTexture = 0;
  }

  /**
   * Enable this texture, activate the texture and set the uniform for the shader
   */
  enable(uniformIndex: number, slot: number = 0, activeTexture: GLenum = this.gl.TEXTURE0) {
    // Tell WebGL we want to affect texture unit
    this.gl.activeTexture(activeTexture);

    // Bind the texture to texture unit 0
    this.gl.bindTexture(this.gl.TEXTURE_2D, this.glTexture);

    // Tell the shader we bound the texture to texture unit
    this.gl.uniform1i(uniformIndex, slot);
  }

  async loadImage(imagePath: string): Promise<Texture> {
    return new Promise((resolve, reject) => {
      this.texturePath = imagePath;

      // clean up first
      if (this.glTexture) {
        this.dispose();
      }

      // create the new texture
      this.glTexture = this.gl.createTexture();
      this.gl.bindTexture(this.gl.TEXTURE_2D, this.glTexture);

      // Because images have to be download over the internet
      // they might take a moment until they are ready.
      // Until then put a single pixel in the texture so we can
      // use it immediately. When the image has finished downloading
      // we'll update the texture with the contents of the image.
      const level = 0;
      const internalFormat = this.gl.RGBA;
      const width = 1;
      const height = 1;
      const border = 0;
      const srcFormat = this.gl.RGBA;
      const srcType = this.gl.UNSIGNED_BYTE;
      const pixel = new Uint8Array([0, 0, 255, 255]); // opaque blue
      this.gl.texImage2D(this.gl.TEXTURE_2D, level, internalFormat, width, height, border, srcFormat, srcType, pixel);

      const image = new Image();
      image.onload = () => {
        this.gl.bindTexture(this.gl.TEXTURE_2D, this.glTexture);
        this.width = image.width;
        this.height = image.height;
        this.gl.texImage2D(this.gl.TEXTURE_2D, level, internalFormat, srcFormat, srcType, image);

        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_S, this.gl.MIRRORED_REPEAT);
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_T, this.gl.MIRRORED_REPEAT);
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this.gl.NEAREST);
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MAG_FILTER, this.gl.NEAREST);

        this.gl.generateMipmap(this.gl.TEXTURE_2D);
        return resolve(this);
      };
      image.onerror = (event: string) => {
        console.error(event);
        return reject();
      };
      image.src = imagePath;
    });
  }

  isPowerOf2(value: number) {
    return (value & (value - 1)) == 0;
  }

  dispose(): void {
    this.gl.deleteTexture(this.glTexture);
    this.glTexture = 0;
  }
}
