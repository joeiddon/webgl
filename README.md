This repository records my work followng the http://weglfundamentals.org guide on WebGL. In general, some parts of the code are quite messsy, but they demonstrate the main features with working with the 2D rasterization graphics library. My comments also supplement those made in the fundamentals guide linked previously.

The final version can be viewed at https://joeiddon.github.io/webgl/3d/v7_textures. The only control is with the mouse: click anywhere to start; left/right click to move forwards/backwards.

Finally, after playing with the different aspects of 3D rendering, I decided to organise my code into more of a framework. This originally was with the goal in mind of making some sort of first-person-shooter, but due to lack of time, I have put it on hold. At the moment, I therefore resided that work into a folder named **`wispa_grid`**. As its name indicates, the furthest I reached with this was a grid of "wispa cubes" (Wispa is the name of my cat). As with the later 3d revisions in the `3d` folder, this world is navigated with the mouse as described previously. You can view it online here: https://joeiddon.github.io/webgl/wispa_grid.

---

The `calculations` folder contains images of calculations to supplement the code - referenced as "gphotos" (Google Photos) in code comments.

---

If running locally, remember to whip up a server with something like `python -m http.server 8000` and then use `http://localhost:8000`. Even though this should be the standard method of developing locally, it is only strictly necessary to work this way when running the `3d/v7_textures` version. This is because if you just go to file path directly, e.g. `/home/joe/webgl/3d/v7_textures/index.html`, then images cannot be loaded without CORS which requires a flag to be set when starting chrome (`--allow-file-access-from-file`). See `3d/v7_textures` for more information on this.

---

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
├── calculations
│   ├── IMG_20190730_192648950.jpg
│   ├── IMG_20190730_193202508.jpg
│   ├── IMG_20190731_204600945.jpg
│   ├── IMG_20190731_204609502.jpg
│   ├── IMG_20190801_121647034.jpg
│   ├── IMG_20190802_113307838.jpg
│   ├── IMG_20190802_113718055.jpg
│   ├── IMG_20190802_120700818.jpg
│   ├── IMG_20190802_154455885.jpg
│   └── IMG_20190802_154459719.jpg
├── README.md
└── wispa_grid
    ├── cube.json
    ├── helpers.js
    ├── index.html
    ├── objects.js
    ├── README
    ├── script.js
    ├── shaders.js
    └── textures
        ├── gen_texture
        ├── grunge_floor.png
        ├── grunge_wall.png
        └── wispa.png

12 directories, 52 files
```
