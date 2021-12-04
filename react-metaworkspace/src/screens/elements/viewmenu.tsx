import { Button, CompassIcon, EyeOffIcon, EyeOpenIcon, Heading, Icon, IconButton, LayersIcon, MinusIcon, Pane, PlusIcon, SettingsIcon, StyleIcon, Switch, TimeIcon, Tooltip, PlayIcon, PauseIcon, SelectMenu  } from "evergreen-ui";
import { useEffect, useRef, useState } from "react"
import { MetacityEngine } from "../../engine/engine"


function SideMenu(props: {children: any, isShown: boolean, onClose: () => void}) {
    const { children, isShown } = props;

    //<IconButton className="closeViewMenu" appearance="minimal" icon={CrossIcon} onClick={onClose}/>
    return (
        <Pane className="viewMenu" display={isShown? "block" : "none"}>
            {children}
        </Pane>
    );
}


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


function TimelineMenu(props: { engine: MetacityEngine | undefined, visible: boolean }) {
    const { engine, visible } = props;
    const [time, setTime] = useState<number>(0);
    const [start, setStart] = useState<number>(0);
    const [play, setPlay] = useState<boolean>(false);
    const [end, setEnd] = useState<number>(0);
    const [speed, setSpeed] = useState<number>(1);
    const timeRef = useRef<HTMLInputElement>(null);

    const speedOptions = [0.25, 0.5, 1, 2, 5, 10, 20, 30, 60];


    const timing = (time: number, start: number, end: number) => {
        setTime(Math.floor(time));

        setStart(start);
        setEnd(end);
    }

    const togglePlay = () => {
        if (!engine || !engine.controls)
            return;
        
        engine.controls.setPlay(!play);
        setPlay(!play);
    }

    const setupTime = () => {
        const time = timeRef.current?.value;
        
        if (!engine || !engine.controls || !time)
            return;
        
        const t = parseFloat(time);
        if (isNaN(t))
            return;

        engine.controls.setTime(t);
    }

    useEffect(() => {
        if (!engine || !engine.controls)
            return;

        engine.controls.setSpeed(speed);
    }, [speed, engine]);

    useEffect(() => {
        if (!engine || !engine.controls)
            return;

        engine.controls.updateTimeCallback = timing;
        setPlay(engine.controls.getPlay());
        setSpeed(engine.controls.getSpeed());
    }, [engine]);
        
    const pad = (n: number) => {
        return n.toString().padStart(2, '0');
    }

    const formatedTime = () => {
       return pad(Math.floor(time / 3600)) + ':' + pad(Math.floor((time % 3600) / 60)) + ':' + pad(Math.floor(time % 60));
    }
    
    return (
        <>
            {visible &&
                <>
                    <Heading size={300} className="title">Timeline</Heading>
                    <Pane className="timeline">
                        <Pane className="setting">
                            <Pane display="flex" flexDirection="row" justifyContent="center">
                                <Pane flexGrow="1">
                                    <Heading size={100}>Time</Heading>
                                    <Heading size={400}>{formatedTime()}</Heading>
                                </Pane>
                                <Pane>
                                    <IconButton icon={play ? PauseIcon : PlayIcon} appearance="minimal" onClick={togglePlay} /> 
                                    <SelectMenu
                                        title="Select speed"
                                        options={speedOptions.map((value) => ({ label: `${value}\u00D7` , value: value }))}
                                        selected={`${speed}\u00D7`}
                                        hasFilter={false}
                                        onSelect={(item) => setSpeed(item.value as number)}>
                                        <Button appearance="minimal">{`Speed ${speed}\u00D7`}</Button>
                                    </SelectMenu>
                                </Pane>
                            </Pane>
                            <Pane className="controls">
                                <Pane className="timescroll">
                                    <input             
                                        ref={timeRef} 
                                        type="range" 
                                        min={start} 
                                        max={end} 
                                        step={1} 
                                        value={time} 
                                        onChange={() => setupTime()}
                                    />
                                </Pane>
                            </Pane>
                        </Pane>
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

enum Menu {
    None,
    Layers,
    Styles,
    Settings,
    Timeline,
}

enum CameraType {
    D2,
    D3
}

export function Compas(props: {engine: MetacityEngine | undefined}) {
    const { engine } = props;
    const [angle, setAngle] = useState<number>(0);

    const rotate = (angleInRadians: number) => {
        const angleInDegrees = - (angleInRadians * 180 / Math.PI);
        setAngle(angleInDegrees);
    }

    useEffect(() => {
        if (!engine || !engine.controls)
            return;

        engine.controls.updateCompasCallback = rotate;
    }, [engine]);

    const resetRotation = () => {
        engine?.renderer.controls.topView();
    }

    return (
        <Tooltip content="Reset view rotation">
            <IconButton icon={<CompassIcon  style={{ transform: `rotate(${angle}deg)` }}/>} appearance="minimal" onClick={resetRotation} />
        </Tooltip>
    );
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
        <Pane className="viewControls">
            <Pane className="controlBar">
                <Tooltip content="Layers" >
                    <IconButton icon={LayersIcon} className={menu === Menu.Layers && menuShown ? "active" : ""} appearance="minimal" onClick={() => toggleMenu(Menu.Layers)} />
                </Tooltip>
                <Tooltip content="Styles">
                    <IconButton icon={StyleIcon} className={menu === Menu.Styles && menuShown ? "active" : ""} appearance="minimal" onClick={() => toggleMenu(Menu.Styles)} />
                </Tooltip>
                <Tooltip content="Settings">
                    <IconButton icon={SettingsIcon} className={menu === Menu.Settings && menuShown ? "active" : ""} appearance="minimal" onClick={() => toggleMenu(Menu.Settings)} />
                </Tooltip>
                <Tooltip content="Timeline">
                    <IconButton icon={TimeIcon} className={menu === Menu.Timeline && menuShown ? "active" : ""} appearance="minimal" onClick={() => toggleMenu(Menu.Timeline)}  />
                </Tooltip>
                <Tooltip content="Switch between 2D/3D view">
                    <Button appearance="minimal" id="perspectiveControl" onClick={swapCamera}>
                        {camera === CameraType.D2 ? "3D" : "2D"}
                    </Button>
                </Tooltip>
                <Tooltip content="Zoom in">
                    <IconButton icon={PlusIcon} appearance="minimal" onClick={() => { engine?.controls?.zoomIn()}} />
                </Tooltip>
                <Tooltip content="Zoom out">
                    <IconButton icon={MinusIcon} appearance="minimal" onClick={() => { engine?.controls?.zoomOut()}} />
                </Tooltip>
                <Compas engine={engine}/>
            </Pane>
            <SideMenu isShown={menuShown} onClose={() => toggleMenu(menu)}>
                <LayerMenu engine={engine}    visible={menu === Menu.Layers}/>
                <StyleMenu engine={engine}    visible={menu === Menu.Styles}/>
                <SettingsMenu engine={engine} visible={menu === Menu.Settings}/>
                <TimelineMenu engine={engine} visible={menu === Menu.Timeline}/>
            </SideMenu>
        </Pane>
    )
}