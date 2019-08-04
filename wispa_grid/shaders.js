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

//normals
attribute vec3 a_normal;
varying vec3 v_normal;

//textures
attribute vec2 a_texpos;
varying vec2 v_texpos;

void main(){
    //pass the vertex attibute to a varying
    //so the fragment shader can access and interpolate it
    //pass the normal attribute
    v_normal = a_normal;
    //and the texture attribute
    v_texpos = a_texpos;

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

varying vec3 v_normal;
varying vec2 v_texpos;

uniform vec3 u_light_direction;
uniform sampler2D u_texture;

void main(){
    //normalising v_normal as it is a varying, so if normals were different
    //directions at different verticies, they could not be unit
    //(https://webglfundamentals.org/webgl/lessons/webgl-3d-lighting-directional.html)

    //must inverse intensity for dot product as comparing reflected beam
    float intensity = dot(normalize(v_normal), -1.0*u_light_direction);
    intensity = 0.7 + 0.3*intensity; //so that not black on sides opposite to light

    //gl_FragColor is a vec4 of: r,g,b,a
    //all components are floats in range [0,1]
    gl_FragColor = vec4(texture2D(u_texture, v_texpos).xyz * intensity, 1);
    //note: we just multiply the rgb and not the alpha
}
`;
