import { Renderer } from './renderer';
import { View } from './view';

interface ViewSize {
    width: number;
    height: number;
    mode: 'absolute' | 'relative';
}

interface ViewPosition {
    top?: number;
    left?: number;
    right?: number;
    bottom?: number;
    mode: 'absolute' | 'relative';
}

export class Window {
    private views: {
        view: View;
        size: ViewSize;
        position: ViewPosition;
    }[] = [];
    constructor(private canvas: HTMLCanvasElement) {
        const observer = new ResizeObserver((entries) => {
            for (const entry of entries) {
                const { width, height } = entry.contentRect;
                this.resize(width, height);
            }
        });
        observer.observe(canvas);
    }

    resize(width: number, height: number) {
        this.views.forEach(({ view, size, position }) => {
            const { x, y, w, h } = this.compute(size, position, width, height);
            view.resize(x, y, w, h);
        });
    }

    add(view: View, size: ViewSize, position: ViewPosition) {
        this.views.push({ view, size, position });
    }

    private compute(size: ViewSize, position: ViewPosition, width: number, height: number) {
        const { mode: sizeMode } = size;
        const { mode: positionMode } = position;

        const w = sizeMode === 'absolute' ? size.width : size.width * width;
        const h = sizeMode === 'absolute' ? size.height : size.height * height;

        let x = 0;
        let y = 0;

        if (positionMode === 'absolute') {
            if (position.left) x = position.left;
            if (position.right) x = width - position.right - w;
            if (position.top) y = position.top;
            if (position.bottom) y = height - position.bottom - h;
        } else {
            //percent
            if (position.left) x = position.left * width;
            if (position.right) x = width - position.right * width - w;
            if (position.top) y = position.top * height;
            if (position.bottom) y = height - position.bottom * height - h;
        }

        return { x, y, w, h };
    }

    render(renderer: Renderer) {
        this.views.forEach(({ view }) => view.render(renderer));
    }
}
