



//draft API 
//  open layer
//     init loader
//     - specify layer names and general settings
//     - load layer
//     - location, style in URL
//     - load as much to fill thre screen

import { BananaGL } from "./bananagl";

//  styles
//  - switch between styles specified inside 


window.onload = () => {
    const canvas = document.getElementById("canvas") as HTMLCanvasElement;
    const gl = new BananaGL({ 
        graphics: {
            canvas: canvas, 
            background: 0x495155
        },
        workerPath: "dist/worker.js",
    });

    gl.layer({
        path: "/data/buildings",
        material: {
            baseColor: 0xffffff,
            lineColor: 0xfdbe56,
        },
        pickable: true,
    });

    gl.layer({
        path: "/data/terrain",
        material: {
            baseColor: 0x495155,
        }
    });
}

