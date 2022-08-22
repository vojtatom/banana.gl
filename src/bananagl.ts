import { GraphicsProps, GraphicContext } from './context/context';
import { LayerProps, Layer } from './layer/layer';
import { Style } from './loader/style/style';

export interface BananaProps extends GraphicsProps {
    onClick?: (id: number) => void;
}

export function BananaGL(props: BananaProps) {
    const ctx = GraphicContext(props);
    const canvas = props.canvas;
    let mouseLastDownTime = 0;
    let layers: Layer[] = [];

    const loadLayer = (props: LayerProps) => {
        let layer = Layer(ctx, props);
        layers.push(layer);
    };

    const getMetadata = (id: number) => {
        for (let i = 0; i < layers.length; i++) {
            const layer = layers[i];
            if (layer.metadata[id])
                return layer.metadata[id];
        }
        return undefined;
    };

    canvas.onpointerdown = (e) => {
        mouseLastDownTime = Date.now();
    };

    canvas.onpointerup = (e) => {
        const now = Date.now();
        const duration = now - mouseLastDownTime;

        if (duration < 200) {
            const x = e.clientX;
            const y = e.clientY;
            const id = ctx.picker.pick(x, y);
            console.log(id);
            console.log(getMetadata(id));
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
        ctx.updateSize();
    };

    return {
        loadLayer,
        get style() {
            return Style();
        }
    };
}
