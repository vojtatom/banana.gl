import { Box3, Vector3 } from "three";
import { LineSegments2, LineSegmentsGeometry } from 'three-fatline';
import { Graphics } from "./graphics";
import { MaterialLibrary } from "./material";

export type ObjectSelectionProps = {
    graphics: Graphics,
    bbox: [number[], number[]],
    material: MaterialLibrary,
}


export class ObjectSelection {
    graphics: Graphics;
    mesh: LineSegments2;

    constructor(props: ObjectSelectionProps) { 
        this.graphics = props.graphics;
        const box = new Box3(new Vector3(...props.bbox[0]), new Vector3(...props.bbox[1]));
        
        //24 vertices per box
        const vertices = new Float32Array([
            box.min.x, box.min.y, box.min.z,
            box.min.x, box.min.y, box.max.z,
            box.min.x, box.max.y, box.min.z,
            box.min.x, box.max.y, box.max.z,
            box.max.x, box.min.y, box.min.z,
            box.max.x, box.min.y, box.max.z,
            box.max.x, box.max.y, box.min.z,
            box.max.x, box.max.y, box.max.z,

            box.min.x, box.min.y, box.min.z,
            box.max.x, box.min.y, box.min.z,
            box.min.x, box.max.y, box.min.z,
            box.max.x, box.max.y, box.min.z,
            box.min.x, box.min.y, box.max.z,
            box.max.x, box.min.y, box.max.z,
            box.min.x, box.max.y, box.max.z,
            box.max.x, box.max.y, box.max.z,

            box.min.x, box.min.y, box.min.z,
            box.min.x, box.max.y, box.min.z,
            box.max.x, box.min.y, box.min.z,
            box.max.x, box.max.y, box.min.z,
            box.min.x, box.min.y, box.max.z,
            box.min.x, box.max.y, box.max.z,
            box.max.x, box.min.y, box.max.z,
            box.max.x, box.max.y, box.max.z,
        ]);

        const geometry = new LineSegmentsGeometry();
        geometry.setPositions(vertices);
        
        this.mesh = new LineSegments2(geometry, props.material.line);
        this.graphics.scene.add(this.mesh);
    }

    remove() {
        this.mesh.geometry.dispose();
        this.graphics.scene.remove(this.mesh);
    }
}