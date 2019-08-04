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

    //gl_Position is a vec4
    gl_Position = u_matrix * a_position;
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
