import { Scene } from '@bananagl/scene/scene';

function formatByteSize(bytes: number) {
    if (bytes < 1024) {
        return `${bytes} bytes`;
    } else if (bytes < 1024 * 1024) {
        return `${(bytes / 1024).toFixed(2)} KB`;
    } else if (bytes < 1024 * 1024 * 1024) {
        return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
    } else {
        return `${(bytes / 1024 / 1024 / 1024).toFixed(2)} GB`;
    }
}

export class Profiler {
    private scenes: Scene[] = [];

    constructor() {
        this.logMemory();
    }

    public addScene(scene: Scene) {
        this.scenes.push(scene);
    }

    logMemory() {
        let bytesAllocated = 0;
        for (const scene of this.scenes) {
            bytesAllocated += scene.bytesAllocated;
        }
        console.log(`Memory: ${formatByteSize(bytesAllocated)}`);
    }
}
