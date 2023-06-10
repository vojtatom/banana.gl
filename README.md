# banana.gl 🍌

<sup>⚠️☕️ Careful, still hot, very early stages of development, consume with caution</sup>

banana.gl is a small, low-level WebGL library designed as an alternative to three.js for developers who seek a more hands-on approach without diving into the complexities of bare WebGL. Honestly, it's just a fun project for me after using three.js for a while.

## Installation

To install banana.gl, run the following command in your project's root directory:

```bash
npm install bananagl
```

## Roadmap

The following list is a rough roadmap of what I want to achieve with banana.gl. It's not a promise, but rather a list of things I want to implement:

### Core

-   [x] Lightweight and low-level API
-   [x] Window management - split canvas views with individual cameras and controls
-   [x] Scene
-   [x] Shader compilation
-   [x] Per-model uniforms
-   [x] Camera (switchable between perspective and orthographic)
-   [x] Mouse controls (map-like)
-   [x] Keyboard Shortcuts
-   [x] Resource Disposal (could be better though)
-   [x] Transparency
-   [x] Selection Management
-   [ ] Textures
-   [ ] View frustum culling
-   [ ] Shadows

### Data

-   [x] Basic buffer - WebGLBuffer
-   [x] Element buffer/Indexed geometry
-   [x] Atttributes
-   [x] Instanced attributes

### Picking

-   [x] Built-in BVH for triangular data (worker-based)
-   [ ] Built-in BVH for line data?
-   [ ] Built-in BVH for point data?
-   [x] Ray-based picking for triangular data
-   [x] Range-based picking for triangular data
-   [ ] Texture-based picking

### Render Pass

-   [x] Strategy minimizing GPU program switches
-   [x] Per-model uniforms updated only when needed
-   [x] Indexed triangle mode
-   [x] Triangle mode
-   [x] Instancing mode
-   [ ] Indexed Line Mode
-   [ ] Line mode

### Nice to have

-   [ ] Post-processing pipeline
-   [ ] Optimized for scenes with funky coordinates (e.g. too large or too small)
