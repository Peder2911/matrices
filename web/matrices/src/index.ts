const VERTEX_SHADER_SRC = `#version 300 es
precision mediump float;

in vec2 vertexPosition;
in vec3 vertexColor;

out vec3 fragColor;

void main()
{
  fragColor = vertexColor;
  gl_Position = vec4(vertexPosition, 0.0, 1.0);
}
`

const FRAG_SHADER_SRC = `#version 300 es
precision mediump float;

in vec3 fragColor;
out vec4 outputColor;

void main()
{
  outputColor = vec4(fragColor, 1.0);
}
`

function createShader(kind: number, source: string, gl: WebGLRenderingContext): WebGLShader | null{
  let shader = gl.createShader(kind)
  gl.shaderSource(shader, source)
  gl.compileShader(shader)
  if(!gl.getShaderParameter(shader,gl.COMPILE_STATUS)) {
    console.error(`Error compiling shader: ${gl.getShaderInfoLog(shader)}`)
    return null
  }
  return shader
}

function createProgram(validate: boolean, vertexSource: string, fragmentSource: string, gl: WebGLRenderingContext): WebGLProgram | null {
  let program = gl.createProgram()
  gl.attachShader(program, createShader(gl.VERTEX_SHADER, vertexSource, gl))
  gl.attachShader(program, createShader(gl.FRAGMENT_SHADER, fragmentSource, gl))
  gl.linkProgram(program)
  if(!gl.getProgramParameter(program,gl.LINK_STATUS)){
    console.error(`Error while linking program: ${gl.getProgramInfoLog(program)}`)
    return null
  }
  if(validate){
    gl.validateProgram(program)
    if(!gl.getProgramParameter(program,gl.VALIDATE_STATUS)){
      console.error(`Error while validating program: ${gl.getProgramInfoLog(program)}`)
      return null
    }
  }
  return program
}

class Graphics {
  private gl: WebGLRenderingContext
  private program: WebGLProgram
  private buffer: WebGLBuffer
  constructor(vertexShaderSrc: string, fragShaderSrc: string, canvas: HTMLCanvasElement){
    let gl: WebGLRenderingContext = canvas.getContext("webgl2")
    if(!gl){
      return null
    }
    gl.clearColor(0.9,0.7,0.8,1.0)
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)
    this.gl = gl
    this.program = createProgram(true, vertexShaderSrc, fragShaderSrc, gl) 
    this.buffer = gl.createBuffer()
  }

  positionAttributeLocation(){
    return this.gl.getAttribLocation(this.program,"vertexPosition")
  }

  colorAttributeLocation(){
    return this.gl.getAttribLocation(this.program,"vertexColor")
  }

  drawVertices(vertices: Float32Array){
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.buffer)
    this.gl.bufferData(this.gl.ARRAY_BUFFER, vertices, this.gl.STATIC_DRAW)
    this.gl.vertexAttribPointer(
      this.positionAttributeLocation(),
      2,
      this.gl.FLOAT,
      false, 
      5 * Float32Array.BYTES_PER_ELEMENT,
      0
    )
    this.gl.vertexAttribPointer(
      this.colorAttributeLocation(),
      3,
      this.gl.FLOAT,
      false, 
      5 * Float32Array.BYTES_PER_ELEMENT,
      2 * Float32Array.BYTES_PER_ELEMENT,
    )
    this.gl.enableVertexAttribArray(this.positionAttributeLocation())
    this.gl.enableVertexAttribArray(this.colorAttributeLocation())
    this.draw()
  }

  private draw(){
    this.gl.useProgram(this.program)
    this.gl.drawArrays(this.gl.TRIANGLES, 0, 3)
  }
}

var vertices = new Float32Array([
  // X    Y    R    G    B
     0.0, 0.5, 1.0, 1.0, 1.0,
    -0.5,-0.5, 0.7, 0.0, 1.0,
     0.5,-0.5, 0.1, 1.0, 0.6,
])

let graphics = new Graphics(VERTEX_SHADER_SRC, FRAG_SHADER_SRC, document.querySelector("canvas#app"))
graphics.drawVertices(vertices)

