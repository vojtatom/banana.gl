import { GraphicsProps, GraphicContext } from './context/context';
import { LayerProps, Layer } from './layer/layer';

interface BananaProps extends GraphicsProps {
    onClick?: (id: number) => void;
}

export function BananaGL(props: BananaProps) {
    const ctx = GraphicContext(props);
    const canvas = props.canvas;
    let mouseLastDownTime = 0;

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
            console.log(id);
        }

        ctx.navigation.update();
    };

    let updateCall: any;
    canvas.addEventListener('wheel', (e) => {
        clearTimeout(updateCall);
        updateCall = setTimeout(() => {
            ctx.navigation.update();
            //TODO calculate near and far to fit
        }, 100);
    });

    window.onresize = () => {
        ctx.updateSize(window.innerWidth, window.innerHeight);
    }

    const loadLayer = (props: LayerProps) => {
        Layer(ctx, props);
    };

    return {
        loadLayer
    };
}
