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
//note: we could change a_position type to vec3, and that would have
//      made it neater due to default 3rd component of 1 - we do this
//      in the next version of code - 3d
attribute vec2 a_position;
uniform mat3 u_matrix;

void main(){
    //gl_Position is a vec4
    gl_Position = vec4((u_matrix * vec3(a_position, 1)).xy, 0, 1);
}
`;

let fragment_shader_src = `
//set precision to "medium" for calculating floats
precision mediump float;

void main(){
    gl_FragColor = vec4(1, 0, 0.5, 1);
}
`;
