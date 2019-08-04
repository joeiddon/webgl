'use strict';

/*
 * Good fundamental resource: https://webglfundamentals.org/
 * Shaders are defined as strings in the `shaders.js` script.
 *
 * Ultimately WebGL is a 2d rasterization (fills pixels from vector graphic)
 * library, but the Graphics Library Shader Language (GLSL) has features
 * that make writing 3d engines easier. This includes things like matrix
 * operations, dot products, and options like CULL_FACE and DEPTH (Z) BUFFER.
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


// resize the canvas (BAD!! method), setup viewport and get variable locations

//read this for proper way of doing these types of things:
//https://webgl2fundamentals.org/webgl/lessons/webgl-anti-patterns.html
canvas.width = innerWidth; canvas.height = innerHeight;

//tells WebGL how to map clip space to canvas pixel coordinates
gl.viewport(0, 0, canvas.width, canvas.height);

//set the color we want to clear to
gl.clearColor(0, 0, 0, 0); // (1, 0, 0, 1) would be red etc.
let position_attrib_loc = gl.getAttribLocation(program, 'a_position');
let color_attrib_loc = gl.getAttribLocation(program, 'a_color');
let matrix_uniform_loc = gl.getUniformLocation(program, 'u_matrix');

console.log(`position attribute is attribute ${position_attrib_loc}
color attribute is attribute ${color_attrib_loc}`)


//"turn on" buffer functionality for the buffer attributes
//why? you could also just write directly to attributes with vertexAttrib[1234]f[v](...)
gl.enableVertexAttribArray(position_attrib_loc);
gl.enableVertexAttribArray(color_attrib_loc);

/*
 * POPULATING POSITION BUFFER
 */

//https://stackoverflow.com/questions/27148273/what-is-the-logic-of-binding-buffers-in-webgl
//https://webglfundamentals.org/webgl/lessons/webgl-how-it-works.html
let position_buf = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, position_buf); //essentially ARRAY_BUFFER = position_buf; in WebGL
//why not gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer()) ??
// - because we will need to rebind the position_buf if we bind ARRAY_BUFFER to something else

//args: {..., size, type, normalise, stride (kinda like a "step" in range), offset}
gl.vertexAttribPointer(position_attrib_loc, 3, gl.FLOAT, false, 0, 0);

//note: using a left-handed coordinate system...
let positions = [
    //front
    0,0,0, 1,0,0, 1,1,0,
    0,0,0, 1,1,0, 0,1,0,
    //left
    0,0,0, 0,1,1, 0,0,1,
    0,0,0, 0,1,0, 0,1,1,
    //bottom
    0,0,0, 1,0,1, 1,0,0,
    0,0,0, 0,0,1, 1,0,1,
    //right
    1,0,0, 1,0,1, 1,1,1,
    1,0,0, 1,1,1, 1,1,0,
    //top
    0,1,0, 1,1,0, 1,1,1,
    0,1,0, 1,1,1, 0,1,1,
    //back
    0,0,1, 1,1,1, 1,0,1,
    0,0,1, 0,1,1, 1,1,1
];

//scale the cube down a bit so it comfortably first in the clip space
positions = positions.map(p=>p/4);

//fill the buffer currently assigned to the array buffer (here it is position_buf)
//note: in vertexAttribPointer, we gave size as 3, but a_position is a vec4
//      this is fine, because the 4th `w` component will default  to 1
//also: make sure bindBuffer si called on the correct attribute location before calling this
//also: consider changing gl.STATIC_DRAW if we are going to be changing this a lot
//      so that WebGL can optimise
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

/*
 * POPULATING COLOR BUFFER
 */

let color_buf = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, color_buf); //essentially ARRAY_BUFFER = color_buf;

let triangle_colors = [
   [ 200,   0,   0],
   [ 200,   0,   0],
   [   0, 200,   0],
   [   0, 200,   0],
   [   0,   0, 200],
   [   0,   0, 200],
   [ 100, 100,   0],
   [ 100, 100,   0],
   [ 100,   0, 100],
   [ 100,   0, 100],
   [   0, 100, 100],
   [   0, 100, 100]
];

if (triangle_colors.length * 9 != positions.length) throw new Error('not right amount of colors');

let colors = [];
//this method is slow!! change if need efficiency, e.g. if colors generated every render
for (let i = 0; i < triangle_colors.length; i++){
    for (let j = 0; j < 3; j++) colors = colors.concat(triangle_colors[i]);
}
gl.bufferData(gl.ARRAY_BUFFER, new Uint8Array(colors), gl.STATIC_DRAW);

//we normalise here, so treat our uint8s as floats in range [0,1]
gl.vertexAttribPointer(color_attrib_loc, 3, gl.UNSIGNED_BYTE, true, 0, 0);


/*
 * Both buffers are now filled, and are never modified again.
 * Moving to more rendering stuff now ...
 */

//clockwise triangles are back-facing, counter-clockwise are front-facing
//switch two verticies to easily flip direction a triangle is facing
//"cull face" feature means kill (don't render) back-facing triangles
gl.enable(gl.CULL_FACE);

//actually call the clear call for all color buffers
gl.clear(gl.COLOR_BUFFER_BIT);

function update(rx,ry,rz,x,y,z){
    //draws whats in the array buffer after rotating it by r* then translating by (x,y,z)
    let matrix = m4.identity();
    matrix = m4.multiply(matrix, m4.translation(x,y,z));
    matrix = m4.multiply(matrix, m4.rotation_z(rz));
    matrix = m4.multiply(matrix, m4.rotation_y(ry));
    matrix = m4.multiply(matrix, m4.rotation_x(rx));
    //transformations go from ^^^ last to first ^^^ (reading to the left if written down)

    //2nd arg: transpose (must be false, but exists as OpenGL (non-ES [embedded system]) supports row major
    gl.uniformMatrix4fv(matrix_uniform_loc, false, m4.gl_format(matrix));

    //primitive type, offset, count
    gl.drawArrays(gl.TRIANGLES, 0, positions.length/3);
}

//update(0.4, -0.4, 0, 0, 0, -1);

//use CTRL-SHIFT-P --> "fps" --> ENTER to get fps menu (dev tools open)

function u(t){
    update(t/1000, t/2000, t/3000, 0, 0, 0);
    requestAnimationFrame(u);
}

requestAnimationFrame(u);
