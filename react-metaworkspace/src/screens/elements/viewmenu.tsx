import { Button, EyeOffIcon, EyeOpenIcon, Heading, Icon, IconButton, LayersIcon, Pane, SettingsIcon, StyleIcon, Switch, Tooltip  } from "evergreen-ui";
import { useEffect, useState } from "react"
import { MetacityEngine } from "../../engine/engine"
import { SideMenu } from "./sidemenu";



function StyleMenu(props: { engine: MetacityEngine | undefined, visible: boolean }) {
    const { engine, visible } = props;
    const [selected, setSelected] = useState<string | undefined>(undefined);

    const applyStyle = (style?: string) => {
        if (engine == null)
            return;

        setSelected(style);

        if (style)
            engine.project.applyStyle(style);
        else
            engine.project.clearStyle();
    };

    useEffect(() => {
        if (!engine)
            return;

        setSelected(engine.project.usedStyle);

    }, [engine]);

    return (
        <>
            {visible &&
                <>
            <Heading size={300} className="title">Styles</Heading>
            <Pane className="styles">
                {engine?.project.styles.map(style => (
                    <Pane key={style} onClick={() => applyStyle(style)} className={`style ${selected === style ? "selected" : ""}`}>
                        {style}
                    </Pane>
                ))}
                <Pane onClick={() => applyStyle()} className={`style ${selected === undefined ? "selected" : ""}`}>
                    No Style
                </Pane>
            </Pane>
        </>
                    }
                    </>
    )


}


function LayerMenu(props: { engine: MetacityEngine | undefined, visible: boolean }) {
    const { engine, visible } = props;
    const [visibility, setVisibility] = useState<boolean[]>([]);


    useEffect(() => {
        if (!engine)
            return;
        console.log(visibility);
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

function SettingsMenu(props: { engine: MetacityEngine | undefined, visible: boolean }) {
    const { engine, visible } = props;
    const [radius, setRadius] = useState<number>(2000);
    const [pointSize, setPointSize] = useState<number>(1);
    const [shadows, setShadows] = useState<boolean>(false);
    const [cache, setCache] = useState<boolean>(false);

    useEffect(() => {
        if (!engine)
            return;
        Promise.resolve(1).then(() => engine.project.setVisibleRadius(radius));
    }, [engine, radius]);


    useEffect(() => {
        if (!engine)
            return;
        Promise.resolve(1).then(() => {
            if (shadows)
                engine.project.renderer.enableShadows();
            else
                engine.project.renderer.disableShadows();
        });
    }, [engine, shadows]);

    useEffect(() => {
        if (!engine)
            return;
        Promise.resolve(1).then(() => {
            engine.project.useCache(cache);
        });
    }, [engine, cache]);

    useEffect(() => {
        if (!engine)
            return;
        Promise.resolve(1).then(() => engine.project.setPointSize(pointSize));
    }, [engine, pointSize]);

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
                                <input type="range" className="visibleRange" min={0} max={20000} step={1000} defaultValue={radius} onChange={(e) => updateRadius(e.target.value)} />
                            </Pane>
                        </Pane>
                        <Pane className="setting">
                            <Heading size={100}>Point Size: {pointSize}</Heading>
                            <Pane className="controls">
                                <input type="range" className="visibleRange" min={0} max={5} step={0.1} defaultValue={pointSize} onChange={(e) => updatePointSize(e.target.value)} />
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

enum Menu {
    None,
    Layers,
    Styles,
    Settings
}

enum CameraType {
    D2,
    D3
}

export function ViewMenu(props: { engine: MetacityEngine | undefined }) {
    const { engine } = props;
    const [menuShown, setMenuShown] = useState<boolean>(false);
    const [camera, setCamera] = useState<CameraType>(CameraType.D2);
    const [menu, setMenu] = useState<number>(Menu.None);

    const toggleMenu = (kind: number) => {
        if (menuShown && kind === menu)
            setMenuShown(false);
        else {
            setMenu(kind);
            setMenuShown(true);
        }
    };

    const swapCamera = () => {
        if (!engine)
            return;

        engine.controls?.swapCamera();
        setCamera(camera === CameraType.D2 ? CameraType.D3 : CameraType.D2);
    };


    return (
        <>
            <Pane className="viewControls">
                <Tooltip content="Layers" >
                    <IconButton icon={LayersIcon} className={menu === Menu.Layers && menuShown ? "active" : ""} appearance="minimal" onClick={() => toggleMenu(Menu.Layers)} />
                </Tooltip>
                <Tooltip content="Styles">
                    <IconButton icon={StyleIcon} className={menu === Menu.Styles && menuShown ? "active" : ""} appearance="minimal" onClick={() => toggleMenu(Menu.Styles)} />
                </Tooltip>
                <Tooltip content="Settings">
                    <IconButton icon={SettingsIcon} className={menu === Menu.Settings && menuShown ? "active" : ""} appearance="minimal" onClick={() => toggleMenu(Menu.Settings)} />
                </Tooltip>
                <Tooltip content="Switch between 2D/3D view">
                    <Button appearance="minimal" id="perspectiveControl" onClick={swapCamera}>
                        {camera === CameraType.D2 ? "2D" : "3D"}
                    </Button>
                </Tooltip>
            </Pane>
            <SideMenu isShown={menuShown} onClose={() => toggleMenu(menu)}>
                <LayerMenu engine={engine}    visible={menu === Menu.Layers}/>
                <StyleMenu engine={engine}    visible={menu === Menu.Styles}/>
                <SettingsMenu engine={engine} visible={menu === Menu.Settings}/>
            </SideMenu>
        </>
    )
}