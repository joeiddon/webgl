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
attribute vec2 a_texcoord;

uniform mat4 u_world_matrix;
uniform mat4 u_view_matrix;

uniform vec3 u_light;

varying float intensity;
varying vec2 texcoord;

void main(){
    gl_Position = u_world_matrix * vec4(a_position, 1);

    intensity = dot(
        normalize(-u_light),
        normalize((u_view_matrix * vec4(a_normal, 1)).xyz)
    );
    texcoord = a_texcoord;
}
`;

let fragment_shader_src = `
precision mediump float;

varying float intensity;
varying vec2 texcoord;

uniform sampler2D u_texture;

void main(){
    vec4 texcol = texture2D(u_texture, texcoord);
    gl_FragColor = (0.8 + 0.2 * intensity) * vec4(1.0*texcol[0], 0.5*texcol[1], 0.0*texcol[2], texcol[3]);
}
`;
