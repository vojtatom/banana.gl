import { Heading, Pane, Switch } from "evergreen-ui";
import { useEffect, useState } from "react";
import { MetacityEngine } from "../../engine/engine";


export function SettingsMenu(props: { engine: MetacityEngine | undefined, visible: boolean }) {
    const { engine, visible } = props;
    const [radius, setRadius] = useState<number>(2000);
    const [pointSize, setPointSize] = useState<number>(1);
    const [lineWidth, setLineWidth] = useState<number>(5);
    const [shadows, setShadows] = useState<boolean>(false);
    const [cache, setCache] = useState<boolean>(false);

    useEffect(() => {
        if (!engine)
            return;
        Promise.resolve(1).then(() => engine.controls?.setVisibleRadius(radius));
    }, [engine, radius]);


    useEffect(() => {
        if (!engine)
            return;
        Promise.resolve(1).then(() => {
            engine.controls?.useShadows(shadows);
        });
    }, [engine, shadows]);

    useEffect(() => {
        if (!engine)
            return;
        Promise.resolve(1).then(() => {
            engine.controls?.useCache(cache);
        });
    }, [engine, cache]);

    useEffect(() => {
        if (!engine)
            return;
        Promise.resolve(1).then(() => engine.controls?.setPointSize(pointSize));
    }, [engine, pointSize]);

    useEffect(() => {
        if (!engine)
            return;
        Promise.resolve(1).then(() => engine.controls?.setLineWidth(lineWidth));
    }, [engine, lineWidth]);

    const updateRadius = (value: string) => {
        const v = parseInt(value);
        if (v !== radius) {
            setRadius(v);
        }
    }

    const updatePointSize = (value: string) => {
        const v = parseFloat(value);
        if (v !== pointSize) {
            setPointSize(v);
        }
    }

    const updateLineWidth = (value: string) => {
        const v = parseFloat(value);
        if (v !== pointSize) {
            setLineWidth(v);
        }
    }

    const toggleShadows = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!engine)
            return;

        setShadows(e.target.checked);
    }

    const toggleCache = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!engine)
            return;

        setCache(e.target.checked);
    }


    return (
        <>
            {visible &&
                <>
                    <Heading size={300} className="title">Settings</Heading>
                    <Pane className="settings">
                        <Pane className="setting">
                            <Heading size={100}>Visible Radius: {radius}</Heading>
                            <Pane className="controls">
                                <input type="range" min={0} max={20000} step={1000} defaultValue={radius} onChange={(e) => updateRadius(e.target.value)} />
                            </Pane>
                        </Pane>
                        <Pane className="setting">
                            <Heading size={100}>Point Size: {pointSize}</Heading>
                            <Pane className="controls">
                                <input type="range" min={0} max={5} step={0.1} defaultValue={pointSize} onChange={(e) => updatePointSize(e.target.value)} />
                            </Pane>
                        </Pane>
                        <Pane className="setting">
                            <Heading size={100}>Line width: {lineWidth}</Heading>
                            <Pane className="controls">
                                <input type="range" min={0} max={10} step={0.1} defaultValue={lineWidth} onChange={(e) => updateLineWidth(e.target.value)} />
                            </Pane>
                        </Pane>
                        <Pane className="setting">
                            <Pane className="inlineControls">
                                <Heading size={100}>Shadows: {shadows ? "on" : "off"}</Heading>
                                <Switch checked={shadows} onChange={(e) => toggleShadows(e)} />
                            </Pane>
                        </Pane>
                        <Pane className="setting">
                            <Pane className="inlineControls">
                                <Heading size={100}>Caching Data: {cache ? "on" : "off"}</Heading>
                                <Switch checked={cache} onChange={(e) => toggleCache(e)} />
                            </Pane>
                        </Pane>
                    </Pane>
                </>
            }
        </>
    )
}