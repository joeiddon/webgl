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

// ensure this matches the vertex shader #define
const MAX_CHARGES = 50;

let canvas = document.getElementById('canvas');
let gl = canvas.getContext('webgl');
if (!gl) canvas.innerHTML = 'Oh no! WebGL is not supported.';

function fit_canvas_to_screen(){
    canvas.width = innerWidth;
    canvas.height = innerHeight;
    gl.viewport(0, 0, canvas.width, canvas.height);
}
fit_canvas_to_screen();
window.addEventListener('resize', fit_canvas_to_screen);

let program = misc.create_gl_program(vertex_shader_src, fragment_shader_src);
gl.useProgram(program);

//set the color we want to clear to
gl.clearColor(0.8, 0.8, 0.8, 1);

let a_position_loc = gl.getAttribLocation(program, 'a_position');
let a_normal_loc = gl.getAttribLocation(program, 'a_normal');
let u_world_matrix_loc = gl.getUniformLocation(program, 'u_world_matrix');
let u_view_matrix_loc = gl.getUniformLocation(program, 'u_view_matrix');
let u_light_loc = gl.getUniformLocation(program, 'u_light');

gl.enableVertexAttribArray(a_position_loc);
gl.enableVertexAttribArray(a_normal_loc);

let positions_buffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, positions_buffer);
gl.vertexAttribPointer(a_position_loc, 3, gl.FLOAT, false, 0, 0);

let normals_buffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, normals_buffer);
gl.vertexAttribPointer(a_normal_loc, 3, gl.FLOAT, false, 0, 0);

function gh(x,y) {
    // get height at x,y
    return perlin.get(x,y) + perlin.get(2*x, 2*y) / 2 + perlin.get(5*x, 5*y)/5;
}

function calculate_normal(x,y) {
    /* un-normalised - shader can take care of that! */
    let delta = 0.1;
    let h = gh(x,y);
    let hdx = gh(x+delta,y);
    let hdy = gh(x,y+delta);
    return misc.cross(
        misc.sub_vec([x, h, y], [x, hdy, y+delta]),
        misc.sub_vec([x, h, y], [x+delta, hdx, y]),
    );
}

function gen_terrain() {
    let positions = [];
    let normals = [];

    let divs = 50;
    // d is interval / step
    let d = 2 / divs;
    for (let xx = 0; xx < divs; xx++){
        for (let yy = 0; yy < divs; yy++){
            let x = xx / divs * 2 - 1;
            let y = yy / divs * 2 - 1;
            // remember y and z flipped in 3d
            positions.push(x, gh(x,y), y);
            positions.push(x+d, gh(x+d,y), y);
            positions.push(x+d, gh(x+d,y+d), y+d);
            positions.push(x, gh(x,y), y);
            positions.push(x, gh(x,y+d), y+d);
            positions.push(x+d, gh(x+d,y+d), y+d);
            // use this code for per-triangle normals ...
            //let n1 = misc.cross(
            //    misc.sub_vec([x+d, gh(x+d,y+d), y+d], [x+d, gh(x+d,y), y]),
            //    misc.sub_vec([x+d, gh(x+d,y+d), y+d], [x, gh(x,y), y]),
            //);
            //normals.push(...n1);
            //normals.push(...n1);
            //normals.push(...n1);
            //let n2 = misc.cross(
            //    misc.sub_vec([x+d, gh(x+d,y+d), y+d], [x, gh(x,y), y]),
            //    misc.sub_vec([x+d, gh(x+d,y+d), y+d], [x, gh(x,y+d), y+d]),
            //);
            //normals.push(...n2);
            //normals.push(...n2);
            //normals.push(...n2);
            // per vertex normals ...
            normals.push(...calculate_normal(x, gh(x,y), y));
            normals.push(...calculate_normal(x+d, gh(x+d,y), y));
            normals.push(...calculate_normal(x+d, gh(x,y+d), y+d));
            normals.push(...calculate_normal(x, gh(x,y), y));
            normals.push(...calculate_normal(x, gh(x,y+d), y+d));
            normals.push(...calculate_normal(x+d, gh(x,y+d), y+d));
        }
    }
    return {'positions': positions, 'normals': normals};
}

function populate_buffers() {
    let positions = [];
    let normals = [];

    let terrain = gen_terrain();
    positions.push(...terrain['positions']);
    normals.push(...terrain['normals']);

    gl.bindBuffer(gl.ARRAY_BUFFER, positions_buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

    gl.bindBuffer(gl.ARRAY_BUFFER, normals_buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(normals), gl.STATIC_DRAW);

    //return number of triangles
    if (positions.length != normals.length) console.error('normals and positions different lengths');
    return positions.length / 3;
}

//clockwise triangles are back-facing, counter-clockwise are front-facing
//switch two verticies to easily flip direction a triangle is facing
//"cull face" feature means kill (don't render) back-facing triangles
//gl.enable(gl.CULL_FACE);

//enable the z-buffer (only drawn if z component LESS than that already there)
gl.enable(gl.DEPTH_TEST);

function perspective_mat(fov, aspect, near, far){
    return [
        [ 1/(aspect*Math.tan(fov/2)),                 0,                     0,                     0],
        [                          0, 1/Math.tan(fov/2),                     0,                     0],
        [                          0,                 0, (far+near)/(far-near), 2*near*far/(near-far)],
        [                          0,                 0,                     1,                     0]
    ];
}

let fov = misc.deg_to_rad(50);
let near = 0.1; //closest z-coordinate to be rendered
let far = 100; //furthest z-coordianted to be rendered
let m_perspective;

function calculate_perspective_matrix() {
    // put in function so can call again on canvas re-size when aspect changes
    let aspect = canvas.width/canvas.height;
    m_perspective = perspective_mat(fov, aspect, near, far);
}
calculate_perspective_matrix();
window.addEventListener('resize', calculate_perspective_matrix);

let space_yaw = 0;
let space_pitch = 0;

let cam = [0, 1.5, -5]; // issues when cam is up x-axis with panning of space_pitch !!

let light = [-1, -1, 1]; // normalised in vertex shader

function set_u_matrix(){
    // matrices in right-to-left order (i.e. in order of application)

    // rotates space according to space_yaw and space_pitch
    let m_rot = m4.multiply(m4.rotation_x(space_pitch), m4.rotation_y(space_yaw));
    // transforms in front of cam's view
    let m_view = m4.multiply(m4.inverse(m4.orient(cam, [0,0,0])), m_rot);
    //maps 3d to 2d
    let m_world = m4.multiply(m_perspective, m_view);
    gl.uniformMatrix4fv(u_world_matrix_loc, false, m4.gl_format(m_world));
    gl.uniformMatrix4fv(u_view_matrix_loc, false, m4.gl_format(m_rot));
}

let time_ms;
let last_time;
let time_delta;

function update(time) {
    time_ms = time; // assign to global
    //time_delta = last_time ? time_ms - last_time : 10000;
    //last_time = time_ms;

    let num_triangles = populate_buffers();

    set_u_matrix();
    gl.uniform3fv(u_light_loc, new Float32Array(light));
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.drawArrays(gl.TRIANGLES, 0, num_triangles);
    requestAnimationFrame(update);
}

requestAnimationFrame(update);

function toclipspace(x, y) {
    return [
        (x / canvas.width) * 2 - 1,
        -((y / canvas.height) * 2 - 1),
    ];
}

canvas.addEventListener('mousemove', function(e) {
    let sensitivity = 400;
    // if right click held down, so panning
    if (e.buttons & 1) {
        space_yaw -= e.movementX / sensitivity;
        space_pitch -= e.movementY / sensitivity;
        if (space_pitch > Math.PI/2) space_pitch = Math.PI / 2;
        if (space_pitch < -Math.PI/2) space_pitch = -Math.PI / 2;
    }
});

canvas.addEventListener('wheel', e => {cam = misc.scale_vec(cam, 1 + e.deltaY / 200);});
//canvas.addEventListener('click', e => {charges.push({position: [...mouse_charge.position], magnitude: mouse_charge.magnitude})}); // unpacked so creates new object
