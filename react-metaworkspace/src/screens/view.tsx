import { CornerDialog, IconButton, Pane, PropertiesIcon, SideSheet, Text } from "evergreen-ui";
import { useEffect, createRef, useState, useLayoutEffect } from "react"
import { useParams } from "react-router"
import { MetacityEngine } from "../engine/engine"

function useWindowSize() {
    const [size, setSize] = useState([0, 0]);
    useLayoutEffect(() => {
        function updateSize() {
            setSize([window.innerWidth, window.innerHeight]);
        }
        window.addEventListener('resize', updateSize);
        updateSize();
        return () => window.removeEventListener('resize', updateSize);
    }, []);
    return size;
}

export function View() {
    const { project_name } = useParams<{ project_name: string }>();
    const [menuIsShown, setMenuIsShown] = useState(false);
    const [width, height] = useWindowSize();
    const [renderer, setRenderer] = useState<MetacityEngine | undefined>(undefined);
    const canvas = createRef<HTMLCanvasElement>();

    const [meta, setMeta] = useState<{[name: string]: any}>({});
    const [metaIsShown, setMetaIsShown] = useState(false);


    const applyStyle = (style: string) => {
        if (renderer == null)
            return;
        renderer.project.applyStyle(style);
    };

    const showMeta = (data: {[name: string]: any}) => {
        setMeta(data);
        setMetaIsShown(true);
    }


    useEffect(() => {
        if (canvas.current == null)
            return;

        const renderer = new MetacityEngine(project_name, canvas.current);
        renderer.init();
        renderer.renderer.frame();
        renderer.showMetaCallback = showMeta;
        setRenderer(renderer);

        return function cleanup() {
            renderer.exit();
            window.location.reload();
        };

    }, [project_name]);

    useEffect(() => {
        if (renderer == null)
            return;
        renderer.resize(width, height);
    }, [width, height]);



    return (
        <Pane className="canvasAnchor">
            <SideSheet
                isShown={menuIsShown}
                onCloseComplete={() => setMenuIsShown(false)}
                preventBodyScrolling>
                <Pane className="viewSettings">
                    Menu
                    {renderer?.project.layers.map(layer => (
                        <Pane key={layer.name}>
                            {layer.name}
                        </Pane>
                    ))}

                    {renderer?.project.styles.map(style => (
                        <Pane key={style} onClick={() => applyStyle(style)}>
                            {style}
                        </Pane>
                    ))}
                </Pane>
            </SideSheet>
            <CornerDialog
                    title="Metadata"
                    hasCancel={false}
                    hasFooter={false}
                    width="auto"
                    isShown={metaIsShown}
                    onCloseComplete={() => { renderer?.select(-1); setMetaIsShown(false)}}
                    onCancel={() => { renderer?.select(-1); setMetaIsShown(false)}}
                >
                <Pane className="meta">
                {
                    Object.keys(meta).map(key => (
                        <Pane key={key} className="attribute">
                            <Text className="key">{key}:</Text> <Text className="value">{meta[key]}</Text>
                        </Pane>
                    ))    
                }
                </Pane>
            </CornerDialog>
            <Pane className="viewControls">
                <IconButton icon={PropertiesIcon} appearance="minimal" onClick={() => setMenuIsShown(true)} />
            </Pane>
            <canvas
                ref={canvas}
                onDoubleClick={(event) => { if (!renderer) return; renderer.doubleclick(event.clientX, event.clientY) }}
                onKeyDown={(event) => { if (event.repeat || !renderer) return; renderer.keyDown(event.code); }}
                onKeyUp={(event) => { if (event.repeat || !renderer) return; renderer.keyUp(event.code); }}
                tabIndex={0}
            >
                Your browser does not support HTML5 canvas
            </canvas>
            <Pane id="viewStatusBar">
                Status
            </Pane>
        </Pane>
    )
}