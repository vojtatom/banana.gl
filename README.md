# BananaGL 🍌

[![NPM Package](https://img.shields.io/npm/v/bananagl)](https://www.npmjs.com/package/bananagl)

![title.png](title.png)

Provides web visualization for urban data processed by the [`Metacity` package](https://github.com/MetacitySuite/Metacity).

## Installation

```
npm i bananagl
```


## Minimal Example

Requres data preprocesed by the [`Metacity` package](https://github.com/MetacitySuite/Metacity). The output data can be visualized by `BananaGL`:

```js
const canvas = document.getElementById("canvas");

const gl = new BananaGL.BananaGL({ 
    graphics: {
        canvas: canvas, 
        background: 0x495155
    },
    loaderPath: "loader.js",
    stylerPath: "styler.js"
});

gl.loadLayer({
    path: "/data/buildings",
    material: {
        baseColor: 0xffffff,
        lineColor: 0xfdbe56,
    },
    pickable: true,
    styles: [
        gl.style.withAttributeRange("height", 0, 50)
                .useColor([0xfdbe56, 0xfa9a2e, 0xf76f00, 0xf54200, 0xf30000]),
    ]
});

gl.loadLayer({
    path: "/data/terrain",
    material: {
        baseColor: 0xeeeeee,
    }
});

gl.loadLayer({
    path: "/data/bridges",
    material: {
        baseColor: 0xeeeeee,
    }
});
```

---

## History

This is a complete rewrite of the original Metacity-Workspace library. After some experimentation, we have concluded, that maintaining the original library is not worth the effort. Instead, we propose to develop a smaller js library which will handle loading and manipulating files produced by the `metacity` package (Python). We will try make it as simple as possible.

Warning: Work in progress. The API is not stable yet.


 