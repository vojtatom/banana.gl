# 🗺 BananaGL

<sup>⚠️☕️ Careful, still hot, very early stages of development, consume with caution</sup>

BananaGL is a small, low-level WebGL library designed as an alternative to three.js for developers who seek a more hands-on approach without diving into the complexities of bare WebGL. Honestly, it's just a fun project for me after using three.js for a while.

## Roadmap

The following list is a rough roadmap of what I want to achieve with BananaGL. It's not a promise, but rather a list of things I want to implement:

### Core

-   [x] Lightweight and low-level API
-   [x] Window management - split canvas views with individual cameras and controls
-   [x] Scene
-   [x] Shader compilation
-   [x] Per-model uniforms
-   [x] Camera (switchable between perspective and orthographic)
-   [x] UI controls (map-like)
-   [ ] Optimized for scenes with funky coordinates (e.g. too large or too small)
-   [ ] View frustum culling
-   [ ] LOD
-   [ ] Textures
-   [ ] Cubemaps
-   [ ] Skybox
-   [ ] Environment maps
-   [ ] Shadows
-   [ ] Post-processing pipeline
-   [ ] Transparency
-   [ ] Transform feedback API for general purpose GPU computation (maybe?)

### Data

-   [x] Basic buffer - WebGLBuffer
-   [x] Element buffer
-   [x] Atttribute
-   [x] Instanced attribute
-   [x] Element attribute

### Picking

-   [ ] Built-in BVH - ⚠️ in progress
-   [ ] Ray-based picking
-   [ ] Texture-based picking

### Render Pass

-   [x] Strategy minimizing GPU program switches
-   [x] Per-model uniforms updated only when needed
-   [x] Indexed triangle mode
-   [x] Triangle mode
-   [ ] Indexed Line Mode
-   [ ] Line mode
-   [ ] Instancing mode

## Installation

To install BananaGL, run the following command in your project's root directory:

```bash
npm install bananagl
```
