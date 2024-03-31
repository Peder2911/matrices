const VERTEX_SHADER_SRC = `#version 300 es
precision mediump float;

in vec2 vertexPosition;
in vec3 vertexColor;

out vec3 fragColor;
uniform float a;
uniform float z; // zoom

void main()
{
  mat4 tmat = mat4(
    1.0       , 1.0       ,0.0       , 0.1       ,
    1.0       ,-1.0       ,0.0       ,-0.1       ,
    0.0       , 0.0       ,0.0       , 0.0       ,
    0.0       , 0.0       ,0.0       , 1.0       
  );
  fragColor = vertexColor;
  gl_Position = vec4(vertexPosition, 0.0, 1.0) * tmat;
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
  private ctx2d: CanvasRenderingContext2D
  constructor(vertexShaderSrc: string, fragShaderSrc: string, canvas: HTMLCanvasElement, textOverlay: HTMLCanvasElement){
    let gl: WebGLRenderingContext = canvas.getContext("webgl2")
    if(!gl){
      return null
    }
    gl.clearColor(0.7,0.8,1.0,1.0)
    this.gl = gl
    this.ctx2d = textOverlay.getContext("2d")
    this.program = createProgram(true, vertexShaderSrc, fragShaderSrc, gl) 
    this.buffer = gl.createBuffer()
    this.clear()
  }

  positionAttributeLocation(){
    return this.gl.getAttribLocation(this.program,"vertexPosition")
  }

  colorAttributeLocation(){
    return this.gl.getAttribLocation(this.program,"vertexColor")
  }

  clear(){
    this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT)
  }

  setAlpha(value: number){
    let loc = this.gl.getUniformLocation(this.program,"a")
    this.gl.uniform1f(loc, value)
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
    this.gl.drawArrays(this.gl.TRIANGLES, 0, 6)
  }

  debugText(message: string){
    this.ctx2d.clearRect(0,0,1000,1000)
    this.ctx2d.fillText(message, 10,15)
  }
}

type Color = {
  red: number
  green: number
  blue: number
}

type Coordinate = {
  x: number
  y: number
}

function square(position: Coordinate, size: Coordinate, color1: Color, color2: Color){
  return new Float32Array([
    // X        Y    R    G    B
    position.x,          position.y         , color1.red, color1.green, color1.blue,
    position.x         , position.y - size.y, color2.red, color2.green, color2.blue,
    position.x + size.x, position.y         , color2.red, color2.green, color2.blue,
    position.x         , position.y - size.y, color2.red, color2.green, color2.blue,
    position.x + size.x, position.y - size.y, color1.red, color1.green, color1.blue,
    position.x + size.x, position.y         , color2.red, color2.green, color2.blue,
  ])
}

let graphics = new Graphics(VERTEX_SHADER_SRC, FRAG_SHADER_SRC, document.querySelector("canvas#app"), document.querySelector("canvas#app-text-overlay"))
let color1 = {red: 0.1, green: 0.6, blue: 0.2}
let color2 = {red: 0.2, green: 0.8, blue: 0.3}

function update(){
  let alpha = Math.sin(performance.now()/800)
  graphics.setAlpha(alpha)
  graphics.clear()
  for(let i = 0; i < 100; i++){
    let pos = {x: ((i%10)/10)-.5, y: (Math.floor(i/10)/10)-.5}
    graphics.drawVertices(square(pos, {x: 1/10, y: 1/10}, color1, color2))
  }
  graphics.debugText(`Alpha: ${alpha}`)
  window.requestAnimationFrame(update)
}
update()
