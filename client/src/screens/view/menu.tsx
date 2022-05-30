import { Button, CameraIcon, IconButton, LayersIcon, MinusIcon, Pane, PlusIcon, SelectIcon, SettingsIcon, StyleIcon, TimeIcon, Tooltip } from "evergreen-ui";
import { useEffect, useState } from "react";
import { MetacityEngine } from "../../engine/engine";
import { Compas } from "./menucompas";
import { LayerMenu } from "./menulayer";
import { SelectorMenu } from "./menuselector";
import { SettingsMenu } from "./menusettings";
import { StyleMenu } from "./menustyle";
import { TimelineMenu } from "./menutimeline";


function SideMenu(props: { children: any, isShown: boolean, onClose: () => void }) {
    const { children, isShown } = props;
    
    return (
        <Pane className="viewMenu" display={isShown ? "block" : "none"}>
            {children}
        </Pane>
    );
}


enum Menu {
    None,
    Layers,
    Styles,
    Settings,
    Timeline,
    Selector
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
        if (menuShown && kind === menu) {
            setMenu(-1);
            setMenuShown(false);
        }
        else {
            setMenu(kind);
            setMenuShown(true);
        }
    };

    const swapCamera = () => {
        if (!engine)
            return;

        if (menu === Menu.Selector)
            return;

        engine.controls?.swapCamera();
        setCamera(camera === CameraType.D2 ? CameraType.D3 : CameraType.D2);
    };

    useEffect(() => {
        if (!engine)
            return;

        if (menu === Menu.Selector) {
            engine.controls?.useOrthogonalProjection();
            setCamera(CameraType.D2);
            engine.controls?.disableCamera();
            engine.controls?.startSelectingRegion();
        }

        if (menu !== Menu.Selector) {
            engine.controls?.enableCamera();
            engine.controls?.endSelectingRegion();
        }

    }, [engine, menu]);


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
                    <IconButton icon={TimeIcon} className={menu === Menu.Timeline && menuShown ? "active" : ""} appearance="minimal" onClick={() => toggleMenu(Menu.Timeline)} />
                </Tooltip>
                <Tooltip content="Export region">
                    <IconButton icon={SelectIcon} className={menu === Menu.Selector && menuShown ? "active" : ""} appearance="minimal" onClick={() => toggleMenu(Menu.Selector)} />
                </Tooltip>
                <Tooltip content="Save screenshot">
                    <IconButton icon={CameraIcon} appearance="minimal" onClick={() => { engine?.controls?.takeScreenshot(); }} />
                </Tooltip>
                <Tooltip content="Switch between 2D/3D view">
                    <Button appearance="minimal" id="perspectiveControl" onClick={swapCamera} disabled={menu === Menu.Selector}>
                        {camera === CameraType.D2 ? "3D" : "2D"}
                    </Button>
                </Tooltip>
                <Tooltip content="Zoom in">
                    <IconButton icon={PlusIcon} appearance="minimal" onClick={() => { engine?.controls?.zoomIn() }} />
                </Tooltip>
                <Tooltip content="Zoom out">
                    <IconButton icon={MinusIcon} appearance="minimal" onClick={() => { engine?.controls?.zoomOut() }} />
                </Tooltip>
                <Compas engine={engine} />
            </Pane>
            <SideMenu isShown={menuShown} onClose={() => toggleMenu(menu)}>
                <LayerMenu engine={engine} visible={menu === Menu.Layers} />
                <StyleMenu engine={engine} visible={menu === Menu.Styles} />
                <SettingsMenu engine={engine} visible={menu === Menu.Settings} />
                <TimelineMenu engine={engine} visible={menu === Menu.Timeline} />
                <SelectorMenu engine={engine} visible={menu === Menu.Selector} />
            </SideMenu>
        </Pane>
    )
}