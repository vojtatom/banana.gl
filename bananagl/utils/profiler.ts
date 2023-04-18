import { Renderer } from '@bananagl/renderer/renderer';
import { Scene } from '@bananagl/scene/scene';

export class Profiler {
    private scenes: Scene[] = [];
    private renderer?: Renderer;
    private renderTimeIndex = 0;

    constructor() {
        this.logMemory();
    }

    addScene(scene: Scene) {
        this.scenes.push(scene);
    }

    setRenderer(renderer: Renderer) {
        this.renderer = renderer;
    }

    logFps() {
        if (!this.renderer) return;

        const renderTimes = this.renderer.frameTimeLog;
        const avgTime = renderTimes.reduce((a, b) => a + b, 0) / renderTimes.length;
        const avgFPS = 1000 / avgTime;

        return avgFPS;
    }

    logMemory() {
        let bytesAllocated = 0;
        for (const scene of this.scenes) {
            bytesAllocated += scene.bytesAllocated;
        }
        return bytesAllocated;
    }
}
