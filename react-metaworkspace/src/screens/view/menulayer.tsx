import { EyeOffIcon, EyeOpenIcon, Heading, Icon, Pane } from "evergreen-ui";
import { useEffect, useState } from "react";
import { MetacityEngine } from "../../engine/engine";


export function LayerMenu(props: { engine: MetacityEngine | undefined, visible: boolean }) {
    const { engine, visible } = props;
    const [visibility, setVisibility] = useState<boolean[]>([]);


    useEffect(() => {
        if (!engine)
            return;
        setVisibility(engine.project.layers.map((layer) => layer.visible));
    }, [engine, visible]);

    const toggleVisibility = (index: number) => {
        if (!engine)
            return;
        engine.project.layers[index].visible = !visibility[index];
        setVisibility(visibility.map((v, i) => i === index ? !v : v));
    };


    return (
        <>
            {visible &&
                <>
                    <Heading size={300} className="title">Layers</Heading>
                    <Pane className="layers">
                        {engine?.project.layers.map((layer, i) => (
                            <Pane key={layer.name} className="layer" onClick={() => toggleVisibility(i)}>
                                {visibility[i] ? <Icon icon={EyeOpenIcon} /> : <Icon icon={EyeOffIcon} />}
                                <Pane className="layerName">{layer.name}</Pane>
                            </Pane>
                        ))}
                    </Pane>
                </>
            }
        </>
    )
}