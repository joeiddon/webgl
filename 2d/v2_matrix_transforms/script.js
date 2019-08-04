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

canvas.width = innerWidth; canvas.height = innerHeight;

let position_attrib_loc = gl.getAttribLocation(program, 'a_position');
let matrix_uniform_loc = gl.getUniformLocation(program, 'u_matrix');

//"turn on" buffer functionality for this attribute
//(you can also just write directly to attributes with vertexAttrib[1234]f[v](...)
gl.enableVertexAttribArray(position_attrib_loc);

//https://stackoverflow.com/questions/27148273/what-is-the-logic-of-binding-buffers-in-webgl
//https://webglfundamentals.org/webgl/lessons/webgl-how-it-works.html
let position_buf = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, position_buf);
//why not gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer()) ??
// - because it would mean we would loose our reference to it, so wouldn't
//   be able to use its contents again (can also in theory delete with deleteBuffer)

//args: {..., size, type, normalise, stride (kinda like a "step" in range), offset}
gl.vertexAttribPointer(position_attrib_loc, 2, gl.FLOAT, false, 0, 0);

//tells WebGL how to map clip space to canvas pixel coordinates
gl.viewport(0, 0, canvas.width, canvas.height);

//88888888888888888888888888888888888888888888
//moving to more rendering stuff now ...
//88888888888888888888888888888888888888888888
let positions = [
    0, 0,
    0, 1,
    0.4, 0,
    -0.5,-0.2,
    -0.5,-0.3,
    -0.4,-0.4,
];

//fill the buffer currently assigned to the array buffer (here it is position_buf)
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

//set the color we want to clear to
gl.clearColor(0, 0, 0, 0); // (1, 0, 0, 1) would be red etc.
//actually call the clear call for all color buffers
gl.clear(gl.COLOR_BUFFER_BIT);

function update(r,x,y){
    //draws whats in the 2d array buffer after rotating it by r then translating by (x,y)
    let matrix = m3.identity();
    matrix = m3.multiply(matrix, m3.translation(x,y));
    matrix = m3.multiply(matrix, m3.rotation(r));
    //transformations go from ^^^ last to first ^^^ (reading to the left if written down)

    //2nd arg: transpose (must be false, but exists as OpenGL (non-ES [embedded system]) supports row major
    gl.uniformMatrix3fv(matrix_uniform_loc, false, m3.gl_format(matrix));

    //primitive type, offset, count
    gl.drawArrays(gl.TRIANGLES, 0, 6);
}

update(misc.deg_to_rad(30), 0, 0.6);

let r = 0;
setInterval(()=>update(r+=0.01, 0, 0.9), 60);
//CTRL-SHIFT-P --> "fps" --> ENTER to get fps menu (dev tools open)
