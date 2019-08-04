This repository records my work followng the http://weglfundamentals.org guide on WebGL. In general, some parts of the code are quite messsy, but they demonstrate the main features with working with the 2D rasterization graphics library. My comments also supplement those made in the fundamentals guide linked previously.

The final version can be viewed at https://joeiddon.github.io/webgl/3d/v7_textures. The only control is with the mouse: click anywhere to start; left/right click to move forwards/backwards.

Also, if running locally, remember to whip up a server with something like `python -m http.server 8000` and then use `http://localhost:8000`. Even though this should be the standard method of developing locally, it is only strictly necessary to work this way when running the `3d/v7_textures` version. This is because if you just go to file path directly, e.g. `/home/joe/webgl/3d/v7_textures/index.html`, then images cannot be loaded without CORS which requires a flag to be set when starting chrome (`--allow-file-access-from-file`). See `3d/v7_textures` for more information on this.

```
.
├── 2d
│   ├── v1_basic_drawing
│   │   ├── index.html
│   │   ├── script.js
│   │   └── shaders.js
│   └── v2_matrix_transforms
│       ├── helpers.js
│       ├── index.html
│       ├── script.js
│       └── shaders.js
├── 3d
│   ├── v3_orthogonal
│   │   ├── helpers.js
│   │   ├── index.html
│   │   ├── script.js
│   │   └── shaders.js
│   ├── v4_perspective
│   │   ├── helpers.js
│   │   ├── index.html
│   │   ├── script.js
│   │   └── shaders.js
│   ├── v5_cameras
│   │   ├── helpers.js
│   │   ├── index.html
│   │   ├── script.js
│   │   └── shaders.js
│   ├── v6_lighting
│   │   ├── helpers.js
│   │   ├── index.html
│   │   ├── script.js
│   │   └── shaders.js
│   └── v7_textures
│       ├── gen_texture
│       ├── helpers.js
│       ├── index.html
│       ├── README
│       ├── script.js
│       ├── shaders.js
│       └── texture.png
└── README.md

9 directories, 31 files
```
