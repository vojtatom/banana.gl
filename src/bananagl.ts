import { GraphicsProps, GraphicContext } from './context/context';
import { LayerProps, Layer, MetadataRecord } from './layer/layer';
import { Style } from './loader/style/style';
import { Labels } from './context/text';

export interface BananaProps extends GraphicsProps {
    onClick?: (id: number, metadata: MetadataRecord) => string;
}

export function BananaGL(props: BananaProps) {
    const ctx = GraphicContext(props);
    const canvas = props.canvas;
    let mouseLastDownTime = 0;
    let layers: Layer[] = [];
    const labels = Labels(ctx);

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
            const data = getMetadata(id);
            console.log(id, data);
            if (data && data.bbox && props.onClick) {
                labels.labelForBBox(data.bbox, props.onClick(id, data), id);
            }
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
