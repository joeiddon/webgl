'use strict';

/*
 * Language is called OpenGL ES Shader Language or GLSL
 * for short.
 * See: https://www.khronos.org/files/webgl/webgl-reference-card-1_0.pdf
 * and: https://www.khronos.org/files/opengles_shading_language.pdf
 *
 * http://learnwebgl.brown37.net/12_shader_language/glsl_control_structures.html
 */

let vertex_shader_src = `
attribute vec3 a_position;
attribute vec3 a_normal;

uniform mat4 u_world_matrix;
uniform mat4 u_view_matrix;

uniform vec3 u_light;

varying vec4 color;

void main(){
    gl_Position = u_world_matrix * vec4(a_position, 1);

    color = vec4(1, 0.3, 0, 1.0);
    color.xyz *= 0.2 + 0.8 * dot(
        normalize(-u_light),
        normalize((u_view_matrix * vec4(a_normal, 1)).xyz));
}
`;

let fragment_shader_src = `
precision mediump float;

varying vec4 color;

void main(){
    gl_FragColor = color;
}
`;
