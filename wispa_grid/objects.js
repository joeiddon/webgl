'use strict';

/*
 * tcs stands for texture coordinates,
 * this attribute is a mapping from vert indicies to texture map coordinates
 * maps vert to texture coordinate
 *
 * tls is triangles -> indicies of verts
 * all triangles (tls) arrays must have lengths multiple of 3
 * bump mapping
 *
 * left-handed coordinate system!
 *
 * if use gl.drawElements instead of gl.drawArrays, this may be easier and faster
 */

const objects = {
    wispa_cube: {
        texture_img_src: 'wispa.png',
        texture_map: [
            [0,0], //0 bl
            [0,1], //1 tl
            [1,1], //2 tr
            [1,0]  //3 br
        ],
        verts: [
            [0,0,0], //0 fbl
            [0,0,1], //1 bbl
            [0,1,0], //2 ftl
            [0,1,1], //3 btl
            [1,0,0], //4 fbr
            [1,0,1], //5 bbr
            [1,1,0], //6 ftr
            [1,1,1]  //7 btr
        ],
        faces: [
            //TODO: calculate normals automatically with cross product
            {tls: [0,4,2, 4,6,2], tcs: {0:1, 4:2, 2:0, 6:3}, norm: [ 0, 0,-1]}, //front
            {tls: [1,0,3, 0,2,3], tcs: {1:1, 0:2, 3:0, 2:3}, norm: [-1, 0, 0]}, //left
            {tls: [1,3,5, 5,3,7], tcs: {1:2, 3:3, 5:1, 7:0}, norm: [ 0, 0, 1]}, //back
            {tls: [4,5,7, 4,7,6], tcs: {4:1, 5:2, 7:3, 6:0}, norm: [ 1, 0, 0]}, //right
            {tls: [2,6,3, 3,6,7], tcs: {2:1, 6:2, 3:0, 7:3}, norm: [ 0, 1, 0]}, //top
            {tls: [1,4,0, 4,1,5], tcs: {1:1, 4:3, 0:0, 5:2}, norm: [ 0,-1, 0]}  //bottom
        ]
    },
    map: {}
};
