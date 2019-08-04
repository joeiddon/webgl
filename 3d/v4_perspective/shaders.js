'use strict';

/*
 * Language is called OpenGL ES Shader Language or GLSL
 * for short.
 * See: https://www.khronos.org/files/webgl/webgl-reference-card-1_0.pdf
 * and: https://www.khronos.org/files/opengles_shading_language.pdf
 *
 */

let vertex_shader_src = `

//identifier prefixes like a_ and u_ signify types

//rendering verticies
attribute vec4 a_position;
uniform mat4 u_matrix;

//colours
attribute vec4 a_color;
varying vec4 v_color;


void main(){
    //pass the vertex attibute to a varying
    //so the fragment shader can access it
    v_color = a_color;

    vec4 pos = u_matrix * a_position;

    /*
     * WebGL plots the x,y coordinate of the vec4 gl_Position, but uses the z and w
     * components:
     *  z: used for depth (z) buffer
     *  w: divides x and y and z components by w for perspective effect (default value is 1)
     * Also remember that x,y,z in "clip space", so only renders points in [-1,1]
     */

    gl_Position = pos;
    //equivalent to:
    //gl_Position = vec4(pos_in.xy/pos_in.w, pos_in.z, 1);
}
`;

let fragment_shader_src = `
//set precision to "medium" for calculating floats
precision mediump float;

varying vec4 v_color;

void main(){
    //vec4: r,g,b,a
    //all components are floats in range [0,1]
    gl_FragColor = vec4(v_color.xyz, 0.8); // MODIFIED THIS TO ADD AN OPACITY!!
}
`;
