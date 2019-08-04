'use strict';

/*
 * Written around 1/8/2019.
 *
 * m3.multiply(m3.identity(), [[1,2,3],[4,5,6],[7,8,9]])
 *
 *
 * Tests:
 *  m4.multiply([[1,2,3,4],[5,6,...],...] , [[1,2,3,4],[5,6,...],...])
 *  >>> [[90,100,110,120],[202,228,254,280],[314,356,398,440],[426,484,542,600]]
 */

let misc = {
    deg_to_rad: (d) => d * Math.PI/180,
    rad_to_deg: (r) => r * 180/Math.PI
}

let m4 = {
    identity: function(){
        return [
            [ 1, 0, 0, 0],
            [ 0, 1, 0, 0],
            [ 0, 0, 1, 0],
            [ 0, 0, 0, 1]
        ];
    },
    multiply: function(a,b){
        //returns [a*b]
        return a.map((r,ri)=>r.map((_,ci)=>a[ri][0]*b[0][ci]+a[ri][1]*b[1][ci]+a[ri][2]*b[2][ci]+a[ri][3]*b[3][ci]));
        /*
        return [
            [a[0][0]*b[0][0]+a[0][1]*b[1][0]+a[0][2]*b[2][0]+a[0][3]*b[3][0], a[0][0]*b[0][1]+a[0][1]*b[1][1]+a[0][2]*b[2][1]+a[0][3]*b[3][1],
                a[0][0]*b[0][2]+a[0][1]*b[1][2]+a[0][2]*b[2][2]+a[0][3]*b[3][2], a[0][0]*b[0][3]+a[0][1]*b[1][3]+a[0][2]*b[2][3]+a[0][3]*b[3][3]],
            [a[1][0]*b[0][0]+a[1][1]*b[1][0]+a[1][2]*b[2][0]+a[1][3]*b[3][0], a[1][0]*b[0][1]+a[1][1]*b[1][1]+a[1][2]*b[2][1]+a[1][3]*b[3][1],
                a[1][0]*b[0][2]+a[1][1]*b[1][2]+a[1][2]*b[2][2]+a[1][3]*b[3][2], a[1][0]*b[0][3]+a[1][1]*b[1][3]+a[1][2]*b[2][3]+a[1][3]*b[3][3]],
            [a[2][0]*b[0][0]+a[2][1]*b[1][0]+a[2][2]*b[2][0]+a[2][3]*b[3][0], a[2][0]*b[0][1]+a[2][1]*b[1][1]+a[2][2]*b[2][1]+a[2][3]*b[3][1],
                a[2][0]*b[0][2]+a[2][1]*b[1][2]+a[2][2]*b[2][2]+a[2][3]*b[3][2], a[2][0]*b[0][3]+a[2][1]*b[1][3]+a[2][2]*b[2][3]+a[2][3]*b[3][3]],
            [a[3][0]*b[0][0]+a[3][1]*b[1][0]+a[3][2]*b[2][0]+a[3][3]*b[3][0], a[3][0]*b[0][1]+a[3][1]*b[1][1]+a[3][2]*b[2][1]+a[3][3]*b[3][1],
                a[3][0]*b[0][2]+a[3][1]*b[1][2]+a[3][2]*b[2][2]+a[3][3]*b[3][2], a[3][0]*b[0][3]+a[3][1]*b[1][3]+a[3][2]*b[2][3]+a[3][3]*b[3][3]]
        ];
        */
        //see the jsperf.com comparison test: https://jsperf.com/map-efficiency
    },
    translation: function(x,y,z){
        //returns a [4x4] translation matrix that translates by [x,y,z]
        return [
            [ 1, 0, 0, x],
            [ 0, 1, 0, y],
            [ 0, 0, 1, z],
            [ 0, 0, 0, 1]
        ];
    },
    //all rotation functions take an argument in radians and rotate using
    //the left-hand rotation rule: thumb pointing in positive direction of axis,
    //then rotates the way the fingers curl (anti-clockwise looking down the axis)
    rotation_x: function(r){
        let c = Math.cos(r), s = Math.sin(r);
        return [
            [ 1, 0, 0, 0],
            [ 0, c,-s, 0],
            [ 0, s, c, 0],
            [ 0, 0, 0, 1]
        ];
    },
    rotation_y: function(r){
        let c = Math.cos(r), s = Math.sin(r);
        return [
            [ c, 0, s, 0],
            [ 0, 1, 0, 0],
            [-s, 0, c, 0],
            [ 0, 0, 0, 1]
        ];
    },
    rotation_z: function(r){
        let c = Math.cos(r), s = Math.sin(r);
        return [
            [ c,-s, 0, 0],
            [ s, c, 0, 0],
            [ 0, 0, 1, 0],
            [ 0, 0, 0, 1]
        ];
    },
    apply: function(m,v){
        //returns vector after applying tranformation matrix m
        return [
            m[0][0]*v[0]+m[0][1]*v[1]+m[0][2]*v[2]+m[0][3]*v[3],
            m[1][0]*v[0]+m[1][1]*v[1]+m[1][2]*v[2]+m[1][3]*v[3],
            m[2][0]*v[0]+m[2][1]*v[1]+m[2][2]*v[2]+m[2][3]*v[3],
            m[3][0]*v[0]+m[3][1]*v[2]+m[3][2]*v[2]+m[3][3]*v[3]
        ];
    },
    gl_format: function(m){
        //transposes matrix m and then flattens it for WebGL
        return [
            m[0][0], m[1][0], m[2][0], m[3][0],
            m[0][1], m[1][1], m[2][1], m[3][1],
            m[0][2], m[1][2], m[2][2], m[3][2],
            m[0][3], m[1][3], m[2][3], m[3][3]
        ];
    }
}
