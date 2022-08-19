import { GraphicsProps, GraphicContext } from "./context/context";
import { LayerProps, Layer } from "./layer/layer";

interface BananaProps extends GraphicsProps {
    loaderPath?: string;
    stylerPath?: string;
    onClick?: (id: number) => void;
}

export function BananaGL(props: BananaProps) {
    const ctx = GraphicContext(props);
    const canvas = props.canvas;
    let mouseLastDownTime = 0;
    let layers = [];

    canvas.onmousedown = (e) => {
        mouseLastDownTime = Date.now();
    };

    canvas.onmouseup = (e) => {
        const now = Date.now();
        const duration = now - mouseLastDownTime;

        if (duration < 200) {
            const x = e.clientX;
            const y = e.clientY;
            const id = ctx.picker.pick(x, y);
            props.onClick?.(id);
        }

        ctx.navigation.update();
    };

    canvas.addEventListener('wheel', (e) => {
        const updateCall = setTimeout(() => {
            ctx.navigation.update();
            clearTimeout(updateCall);
        }, 500);
    }, { passive: true });


    const loadLayer = (props: LayerProps) => {
        Layer(ctx, props);
    }

    return {
        loadLayer
    }
}
