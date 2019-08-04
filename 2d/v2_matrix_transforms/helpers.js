'use strict';
/*

general 3x3 matrix:

[[0,1,2],
 [0,1,2],
 [0,1,2]]


tests:
m3.multiply(m3.identity(), [[1,2,3],[4,5,6],[7,8,9]])

*/

let misc = {
    deg_to_rad: (d) => d * Math.PI/180,
    rad_to_deg: (r) => r * 180/Math.PI,
}

let m3 = {
    identity: function(){
        return [
            [1,0,0],
            [0,1,0],
            [0,0,1]
        ];
    },
    multiply: function(a,b){
        //returns [a*b]
        return [
            [a[0][0]*b[0][0]+a[0][1]*b[1][0]+a[0][2]*b[2][0],a[0][0]*b[0][1]+a[0][1]*b[1][1]+a[0][2]*b[2][1],a[0][0]*b[0][2]+a[0][1]*b[1][2]+a[0][2]*b[2][2]],
            [a[1][0]*b[0][0]+a[1][1]*b[1][0]+a[1][2]*b[2][0],a[1][0]*b[0][1]+a[1][1]*b[1][1]+a[1][2]*b[2][1],a[1][0]*b[0][2]+a[1][1]*b[1][2]+a[1][2]*b[2][2]],
            [a[2][0]*b[0][0]+a[2][1]*b[1][0]+a[2][2]*b[2][0],a[2][0]*b[0][1]+a[2][1]*b[1][1]+a[2][2]*b[2][1],a[2][0]*b[0][2]+a[2][1]*b[1][2]+a[2][2]*b[2][2]]
        ];
    },
    translation: function(x,y){
        //returns a [3x3] translation matrix that translates by [x,y]
        return [
            [1,0,x],
            [0,1,y],
            [0,0,1]
        ];
    },
    rotation: function(r){
        //returns a [3x3] rotation matrix that rotates by r radians ACW
        let c = Math.cos(r), s = Math.sin(r);
        return [
            [c,-s,0],
            [s, c,0],
            [0, 0,1]
        ];
    },
    apply: function(m,v){
        //returns vector after applying tranformation matrix m
        return [
            m[0][0]*v[0]+m[0][1]*v[1]+m[0][2]*v[2],
            m[1][0]*v[0]+m[1][1]*v[1]+m[1][2]*v[2],
            m[2][0]*v[0]+m[2][1]*v[1]+m[2][2]*v[2]
        ];
    },
    gl_format: function(m){
        //transposes matrix m and then flattens it for WebGL
        return [m[0][0],m[1][0],m[2][0],m[0][1],m[1][1],m[2][1],m[0][2],m[1][2],m[2][2]];
        //e.g. [[1,2,3],[4,5,6],[7,8,9]] --> [1,4,7,2,5,8,3,6,9]
    }
}
