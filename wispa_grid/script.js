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
if (!gl) canvas.innerHTML = 'Oh no! WebGL is not supported.';

let program = misc.create_gl_program(vertex_shader_src, fragment_shader_src);
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
let a_texpos_loc = gl.getAttribLocation(program, 'a_texpos');
let u_matrix_loc = gl.getUniformLocation(program, 'u_matrix');
let u_light_direction_loc = gl.getUniformLocation(program, 'u_light_direction');
let u_texture_loc = gl.getUniformLocation(program, 'u_texture');

console.log(`position attribute is attribute ${a_position_loc}
normal attribute is attribute ${a_normal_loc}
texpos attribute is attribute ${a_texpos_loc}`);

//see http://github.com/joeiddon/webgl for comments on meanings of these functions
//[removed comments for this as was too cluttered]
gl.enableVertexAttribArray(a_position_loc);
gl.enableVertexAttribArray(a_normal_loc);
gl.enableVertexAttribArray(a_texpos_loc);

function populate_buffers(object){
    if (!object.buffers){
        let positions = [];
        let normals = [];
        let texture_positions = [];
        //loop over each face in the object
        object.faces.forEach(function(face){
            //one normal for each vertex
            for (let i = 0; i < face.tls.length; i++)
            normals = normals.concat(face.norm);
            //loop over each index in the face
            face.tls.forEach(function(vert_index){
                let vertex = object.verts[vert_index];
                positions = positions.concat(object.verts[vert_index]);
                texture_positions = texture_positions.concat(object.texture_map[face.tcs[vert_index]]);
            });
        });
        object.num_verticies = positions.length / 3;
        object.buffers = {positions: gl.createBuffer(),
                          normals: gl.createBuffer(),
                          texture_positions: gl.createBuffer()};
        gl.bindBuffer(gl.ARRAY_BUFFER, object.buffers.positions);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);
        gl.bindBuffer(gl.ARRAY_BUFFER, object.buffers.normals);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(normals), gl.STATIC_DRAW);
        gl.bindBuffer(gl.ARRAY_BUFFER, object.buffers.texture_positions);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(texture_positions), gl.STATIC_DRAW);

    }
    gl.bindBuffer(gl.ARRAY_BUFFER, object.buffers.positions);
    gl.vertexAttribPointer(a_position_loc, 3, gl.FLOAT, false, 0, 0);
    gl.bindBuffer(gl.ARRAY_BUFFER, object.buffers.normals);
    gl.vertexAttribPointer(a_normal_loc, 3, gl.FLOAT, false, 0, 0);
    gl.bindBuffer(gl.ARRAY_BUFFER, object.buffers.texture_positions);
    gl.vertexAttribPointer(a_texpos_loc, 2, gl.FLOAT, false, 0, 0);


    if (!object.texture){
        object.texture = misc.create_texture(object.texture_img_src);
    }
    //bind our texture to texure unit 0 which has been setup to be
    //the unit (out of a 8 possible) that u_texture refers to (unit 0)
    gl.bindTexture(gl.TEXTURE_2D, object.texture);

    return object.num_verticies;
}

gl.enable(gl.CULL_FACE);
gl.enable(gl.DEPTH_TEST);

/*
 * Creating a matrix to squish and stretch world to fit into frame when looking down positive z-axis.
 * This should be the final matrix transform applied.
 */
let fov = misc.deg_to_rad(50);
let aspect = canvas.width/canvas.height;
let near = 0.02; //closest z-coordinate to be rendered
let far = 40; //furthest z-coordianted to be rendered

let perspective = misc.perspective_mat(fov, aspect, near, far);


function update(){
    look_vec = [Math.sin(yaw)*Math.cos(pitch),Math.sin(pitch),Math.cos(yaw)*Math.cos(pitch)]
    let look_at = misc.add_vec(cam_pos, look_vec);

    //transformations are in order (going down the page)
    let m_persp = m4.identity();
    m_persp = m4.multiply(m4.inverse(m4.orient(cam_pos, look_at)), m_persp);
    m_persp = m4.multiply(perspective, m_persp);

    //set our light direction (normalized in the fragment shader)
    gl.uniform3f(u_light_direction_loc, 1,-1,1);
    //gl.uniform3fv(u_light_direction_loc, look_vec);

    //for texture usage: https://developer.mozilla.org/en-US/docs/Web/API/WebGL_API/Tutorial/Using_textures_in_WebGL
    //basically there a possible of 8 different texture units available at once - we will only ever use one (unit 0)
    //tell webgl that we are using texture unit 0
    gl.activeTexture(gl.TEXTURE0);
        //tell the shader that the u_texture_loc should reference the first texture unit (unit 0)
    gl.uniform1i(u_texture_loc, 0);

    //actually call the clear call for all color buffers
    gl.clear(gl.COLOR_BUFFER_BIT);

    let things_to_draw = [objects.wispa_cube];
    things_to_draw = things_to_draw.concat(things_to_draw);
    things_to_draw = things_to_draw.concat(things_to_draw);

    //TODO: pass a matrix into vertex shader which allows a further transform to be applied on object before world u_matrix is applied
    //also rename world u_matrix to something more appropriate like u_world_transform and this new one could be u_transform
    for (let j = 0; j < things_to_draw.length; j++)
    for (let i = 0; i < things_to_draw.length; i++){
        let thing = things_to_draw[i];
        let len = populate_buffers(thing);

        let m_thing = m4.translation(j*2,0,i*2);
        let u_matrix = m4.multiply(m_persp, m_thing); //m_thing gets applied first, then m_persp
        gl.uniformMatrix4fv(u_matrix_loc, false, m4.gl_format(u_matrix));

        //primitive type, offset, indicie count
        gl.drawArrays(gl.TRIANGLES, 0, len);
    }

    if (in_play)
    requestAnimationFrame(update);
}

let cam_pos = [-1, 1, -3];
let look_vec = [0,0,1];
let yaw = 0;
let pitch = 0;
let in_play = false;

//some really hacky code so left click moves forward in facing direction and right click moves backwards
//you look around with standard pointer lock stuff (click on the screen then move mouse)
document.addEventListener('pointerlockchange',_=>{if(document.pointerLockElement!=canvas)in_play=false;});
canvas.addEventListener('click',e=>{if (in_play){cam_pos=(e.button==0?misc.add_vec:misc.sub_vec)(cam_pos,misc.scale_vec(look_vec,0.5));}else{canvas.requestPointerLock();requestAnimationFrame(update);in_play=true;}});
canvas.addEventListener('mousemove',e=>{if (!in_play) return; yaw += e.movementX * 0.002; pitch += -e.movementY * 0.002;});

//use CTRL-SHIFT-P --> "fps" --> ENTER to get fps menu (dev tools open)
