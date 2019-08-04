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
gl.clearColor(0.8, 0.6, 0, 0.3); // (1, 0, 0, 1) would be red etc.

let a_position_loc = gl.getAttribLocation(program, 'a_position');
let a_normal_loc = gl.getAttribLocation(program, 'a_normal');
let a_color_loc = gl.getAttribLocation(program, 'a_color');
let a_texpos_loc = gl.getAttribLocation(program, 'a_texpos');
let u_matrix_loc = gl.getUniformLocation(program, 'u_matrix');
let u_light_direction_loc = gl.getUniformLocation(program, 'u_light_direction');
let u_texture_loc = gl.getUniformLocation(program, 'u_texture');

console.log(`position attribute is attribute ${a_position_loc}
normal attribute is attribute ${a_normal_loc}
color attribute is attribute ${a_color_loc}`)

//"turn on" buffer functionality for the buffer attributes
//why? you could also just write directly to attributes with vertexAttrib[1234]f[v](...)
gl.enableVertexAttribArray(a_position_loc);
gl.enableVertexAttribArray(a_normal_loc);
gl.enableVertexAttribArray(a_color_loc);
gl.enableVertexAttribArray(a_texpos_loc);

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
gl.vertexAttribPointer(a_position_loc, 3, gl.FLOAT, false, 0, 0);

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
//positions = positions.map(p=>p/4);

//add a second cube translated by 2 units in the positive x direction
positions = positions.concat(positions.map((p,i)=>i%3==0?p+2:p)); //for i = 0, 3, 6, ... so for the x-coords
positions = positions.concat(positions.map((p,i)=>(i+1)%3==0?p+2:p)); //for i = 2, 5, 8, ... so for the y-coords

//translate both cubes so from z-values 10 to 11
positions = positions.map((p,i)=>(i+1)%3==0?p+10:p);

//fill the buffer currently assigned to the array buffer (here it is position_buf)
//note: in vertexAttribPointer, we gave size as 3, but a_position is a vec4
//      this is fine, because the 4th `w` component will default  to 1
//also: make sure bindBuffer si called on the correct attribute location before calling this
//also: consider changing gl.STATIC_DRAW if we are going to be changing this a lot
//      so that WebGL can optimise
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

/*
 * POPULATING NORMAL BUFFER
 */

let normal_buf = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, normal_buf);
gl.vertexAttribPointer(a_normal_loc, 3, gl.FLOAT, false, 0, 0);
//these should be calculated outside of mainloop with cross prod maybe
let normals = [
    //front
    0,0,-1, 0,0,-1, 0,0,-1,  0,0,-1, 0,0,-1, 0,0,-1,
    //left
    -1,0,0, -1,0,0, -1,0,0,  -1,0,0, -1,0,0, -1,0,0,
    //bottom
    0,-1,0, 0,-1,0, 0,-1,0,  0,-1,0, 0,-1,0, 0,-1,0,
    //right
    1,0,0, 1,0,0, 1,0,0,  1,0,0, 1,0,0, 1,0,0,
    //top
    0,1,0, 0,1,0, 0,1,0,  0,1,0, 0,1,0, 0,1,0,
    //back
    0,0,1, 0,0,1, 0,0,1,  0,0,1, 0,0,1, 0,0,1
];

//no translations necessarry as normals only change with rotations
normals = normals.concat(normals);
normals = normals.concat(normals); //now four cubes worth
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(normals), gl.STATIC_DRAW);

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
   [ 200, 200,   0],
   [ 200, 200,   0],
   [ 200,   0, 200],
   [ 200,   0, 200],
   [   0, 200, 200],
   [   0, 200, 200]
];

triangle_colors = triangle_colors.concat(triangle_colors.slice().reverse()); //doubles colours, so enough for 2 blocks
triangle_colors = triangle_colors.concat(triangle_colors.slice().reverse()); //doubles again, so enough for 4 blocks

if (triangle_colors.length * 9 != positions.length) throw new Error('not right amount of colors');

let colors = [];
//this method is slow!! change if need efficiency, e.g. if colors generated every render
for (let i = 0; i < triangle_colors.length; i++){
    for (let j = 0; j < 3; j++) colors = colors.concat(triangle_colors[i]);
}
gl.bufferData(gl.ARRAY_BUFFER, new Uint8Array(colors), gl.STATIC_DRAW);

//we normalise here, so treat our uint8s as floats in range [0,1]
gl.vertexAttribPointer(a_color_loc, 3, gl.UNSIGNED_BYTE, true, 0, 0);

/*
 * POPULATING TEXPOS BUFFER
 */

let texture_buf = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, texture_buf);
let texpositions = [
    //front (x,y)
    0,0, 1,0, 1,1,
    0,0, 1,1, 0,1,
    //left (y,z)
    0,0, 1,1, 0,1,
    0,0, 1,0, 1,1,
    //bottom (x,z)
    0,0, 1,1, 1,0,
    0,0, 0,1, 1,1,
    //right (y,z)
    0,0, 0,1, 1,1,
    0,0, 1,1, 1,0,
    //top (x,z)
    0,0, 1,0, 1,1,
    0,0, 1,1, 0,1,
    //back (x,y)
    0,0, 1,1, 1,0,
    0,0, 0,1, 1,1
];
texpositions = texpositions.concat(texpositions);
texpositions = texpositions.concat(texpositions);
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(texpositions), gl.STATIC_DRAW);
gl.vertexAttribPointer(a_texpos_loc, 2, gl.FLOAT, false, 0, 0);


/*
 * All buffers are now filled, and are never modified again.
 * Moving to more rendering stuff now ...
 */

//clockwise triangles are back-facing, counter-clockwise are front-facing
//switch two verticies to easily flip direction a triangle is facing
//"cull face" feature means kill (don't render) back-facing triangles
gl.enable(gl.CULL_FACE);

//enable the z-buffer (only drawn if z component LESS than that already there)
gl.enable(gl.DEPTH_TEST);

function perspective_mat(fov, aspect, near, far){
    /*
     * See workings on gphotos for proof of this matrix (different to webglfundamental's, 
     * because our z-axis is positive going away from us).
     * Warning: does not map z uniformly from near<-->far to -near<-->far (and hence -1<-->1)
     * so with n=5,f=7,z=6 =/=> z'=0, but z=6 maps to a lower value than z=6.0001, so main
     * thing is that the mapping preserves *order* for the depth buffer.
     */
    return [
        [ 1/(aspect*Math.tan(fov/2)),                 0,                     0,                     0],
        [                          0, 1/Math.tan(fov/2),                     0,                     0],
        [                          0,                 0, (far+near)/(far-near), 2*near*far/(near-far)],
        [                          0,                 0,                     1,                     0]
    ];
}

/*
 * Creating the texture and binding it.
 */
// look in to bump mapping ??

let texture = gl.createTexture();
gl.bindTexture(gl.TEXTURE_2D, texture);
//void gl.texImage2D(target, level, internalformat, width, height, border, format, type, ArrayBufferView|HTMLImageElement|...? pixels);
//before the image loads in, we set a default texture of white (255,255,255,255)
gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([255,255,255,255]));
let image = new Image();
image.addEventListener('load', function(){
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
    gl.generateMipmap(gl.TEXTURE_2D);
});
//image.crossOrigin = '';
image.src = 'texture.png';

/*
 * Creating a matrix to squish and stretch world to fit into frame when looking down positive z-axis.
 * This should be the final matrix transform applied.
 */
let fov = misc.deg_to_rad(90);
let aspect = canvas.width/canvas.height;
let near = 0.1; //closest z-coordinate to be rendered
let far = 20; //furthest z-coordianted to be rendered

let perspective = perspective_mat(fov, aspect, near, far);

function update(){
    look_vec = [Math.sin(yaw)*Math.cos(pitch),Math.sin(pitch),Math.cos(yaw)*Math.cos(pitch)]
    let look_at = misc.add_vec(cam_pos, look_vec);

    let matrix = m4.identity();
    matrix = m4.multiply(m4.inverse(m4.orient(cam_pos, look_at)), matrix);
    matrix = m4.multiply(perspective, matrix);

    //2nd arg: transpose (must be false, but exists as OpenGL (non-ES [embedded system]) supports row major
    gl.uniformMatrix4fv(u_matrix_loc, false, m4.gl_format(matrix));

    //set our light direction (normalized in the fragment shader)
    gl.uniform3f(u_light_direction_loc, 1,-1,1);
    //gl.uniform3fv(u_light_direction_loc, look_vec);

    //tell the shader to use texture unit 0 for u_texture
    gl.uniform1i(u_texture_loc, 0);

    //actually call the clear call for all color buffers
    gl.clear(gl.COLOR_BUFFER_BIT);

    //primitive type, offset, count
    gl.drawArrays(gl.TRIANGLES, 0, positions.length/3);

    //debugging
    /*
    let watch = ['cam_pos','in_play','v'];
    watch.forEach(s=>console.log(s,'=',eval(s))); //eval() bad if called on user input
    */
    if (in_play)
    requestAnimationFrame(update);
}

let cam_pos = [0, 0, 0];
let look_vec = [0,0,1];
let yaw = 0;
let pitch = 0;
let in_play = false;

update(); //do an initial update, but won't trigger the requestAnimationFrame recursion, as in_play=false

//some really hacky code so left click moves forward in facing direction and right click moves backwards
//you look around with standard pointer lock stuff (click on the screen then move mouse)
document.addEventListener('pointerlockchange',_=>{if(document.pointerLockElement!=canvas)in_play=false;});
canvas.addEventListener('click',e=>{if (in_play){cam_pos=(e.button==0?misc.add_vec:misc.sub_vec)(cam_pos,look_vec);}else{canvas.requestPointerLock();requestAnimationFrame(update);in_play=true;}});
canvas.addEventListener('mousemove',e=>{if (!in_play) return; yaw += e.movementX * 0.002; pitch += -e.movementY * 0.002;});

//use CTRL-SHIFT-P --> "fps" --> ENTER to get fps menu (dev tools open)
