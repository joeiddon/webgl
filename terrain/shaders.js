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
uniform mat4 u_rot_matrix;
uniform mat4 u_view_matrix;

uniform vec3 u_light;

varying float intensity;
varying vec2 texcoord;
varying float camdist;

void main(){
    gl_Position = u_world_matrix * vec4(a_position, 1);

    intensity = dot(
        normalize(-u_light),
        normalize((u_rot_matrix * vec4(a_normal, 1)).xyz)
    );
    if (intensity < 0.0) intensity = 0.0;
    texcoord = a_texcoord;

    // distance of vertex from camera
    camdist = length((u_view_matrix * vec4(a_position, 1)).xyz);
}
`;

let fragment_shader_src = `
precision mediump float;

varying float intensity;
varying vec2 texcoord;

uniform sampler2D u_texture;

varying float camdist;

void main(){
    vec4 texcol = texture2D(u_texture, texcoord); //vec4(0.6, 0, 0, 1);
    // use this code if don't care about color of texture
    //float texgreyscale = 0.333 * texcol.r + 0.333 * texcol.g + 0.333 * texcol.b;
    //texgreyscale *= 4.0; // the greyscale wasn't maxing out at 1 so a rough //scale to get it there
    //gl_FragColor.rgb = (0.4 + 0.6 * intensity) * texgreyscale * vec3(1.0, 0.7, 0.4);
    vec3 fog_color = vec3(0.8, 0.8, 0.8); //this should match clear color
    float fog_intensity = 0.0;
    // these should be uniforms!
    float fog_near = 2.0;
    float fog_far = 4.0;
    if (camdist > fog_far) {
        fog_intensity = 1.0;
    } else if (camdist < fog_near) {
        fog_intensity = 0.0;
    } else {
        fog_intensity = (camdist - fog_near) / (fog_far - fog_near);
    }
    gl_FragColor.rgb = vec3(1,0,0);
    gl_FragColor.rgb = (1.0 - fog_intensity) * (0.1 + 0.9 * intensity) * texcol.rgb + fog_intensity * fog_color;
    gl_FragColor.a = 1.0;
}
`;
