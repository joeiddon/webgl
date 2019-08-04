'use strict';

/*
 * Good fundamental resource: https://webglfundamentals.org/
 * Shaders are defined as strings in the `shaders.js` script.
 *
 */

let canvas = document.getElementById('canvas');
let gl = canvas.getContext('webgl');

if (!gl) {
    console.log('webgl is not supported!');
}

function create_shader(type, source){
    //uses globally-accessible `gl` context object
    let shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (gl.getShaderParameter(shader, gl.COMPILE_STATUS))
    return shader;

    //debugging info printed to console
    throw new Error('Error when compiling' +
        (type==gl.VERTEX_SHADER?'vertex':'fragment')+'shader.\n\n'+
        gl.getShaderInfoLog(shader));
}

let vertex_shader = create_shader(gl.VERTEX_SHADER, vertex_shader_src);
let fragment_shader = create_shader(gl.FRAGMENT_SHADER, fragment_shader_src);

let program = gl.createProgram();
gl.attachShader(program, vertex_shader);
gl.attachShader(program, fragment_shader);
gl.linkProgram(program);
if (!gl.getProgramParameter(program, gl.LINK_STATUS)){
    throw new Error('Error linking WebGL program.\n\n'+
        getProgramInfoLog(program));
}
gl.useProgram(program);

let position_attrib_loc = gl.getAttribLocation(program, 'a_position');

//https://stackoverflow.com/questions/27148273/what-is-the-logic-of-binding-buffers-in-webgl
//https://webglfundamentals.org/webgl/lessons/webgl-how-it-works.html
let position_buf = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, position_buf);
//why not gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer()) ??
// - because it would mean we would loose our reference to it, so wouldn't
//   be able to use its contents again (can also in theory delete with deleteBuffer)

let positions = [
    0, 0,
    0, 1,
    0.7, 0,
    -0.5,-0.2,
    -0.5,-0.3,
    -0.4,-0.4,
];

//fill the buffer currently assigned to the array buffer (here it is position_buf)
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

/*** RENDERING ***/  // NOT REALLY !!! THIS IS ALL OUT OF ORDER AS DIDNT KNOW WHAT REQUIRED WHAT... SEE 2d_with_matrix version

canvas.width = innerWidth; canvas.height = innerHeight;

//tells WebGL how to map clip space to canvas pixel coordinates
gl.viewport(0, 0, canvas.width, canvas.height);

//set the color we want to clear to
gl.clearColor(0, 0, 0, 0); // (1, 0, 0, 1) would be red etc.
//actually call the clear call for all color buffers
gl.clear(gl.COLOR_BUFFER_BIT);

//"turn on" buffer functionality for this attribute
//(you can also just write directly to attributes with vertexAttrib[1234]f[v](...)
gl.enableVertexAttribArray(position_attrib_loc);

//args: {..., size, type, normalise, stride (kinda like a "step" in range), offset}
gl.vertexAttribPointer(position_attrib_loc, 2, gl.FLOAT, false, 0, 0);

//primitive type, offset, count
gl.drawArrays(gl.TRIANGLES, 0, 6);

function draw_triangle(verticies){
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(verticies), gl.STATIC_DRAW);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
}


draw_triangle(
[-1,1,
 -1,-1,
  0,0]
  );
