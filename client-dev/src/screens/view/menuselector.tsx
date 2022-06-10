import { Button, Heading, Pane, Text } from "evergreen-ui";
import { useEffect, useState } from "react";
import { MetacityEngine } from "../../engine/engine";
import { AreaSelection } from "../../engine/types";



export function SelectorMenu(props: { engine: MetacityEngine | undefined, visible: boolean }) {
    const { engine, visible } = props;
    const [selection, setSelection] = useState<AreaSelection | undefined>(undefined);


    useEffect(() => {
        if (!engine || !engine.controls)
            return;

        engine.controls.updateSelection = setSelection;
        if (!visible)
            setSelection(undefined);

    }, [engine, visible]);

    const format = (num: number) => {
        return num.toFixed(2);
    };

    const exportOBJ = () => {
        if (!engine || !selection)
            return;

        /*iaxios.post(apiurl.EXPORTOBJ, {
            project: engine.project.name,
            start: selection.start,
            end: selection.end
        }).then(res => {
            window.open(url.EXPORT + res.data.exportID, "_blank");
        }).catch(err => {
            toast.error("Failed to export OBJ, try again later");
        });*/
    };


    const exportLego = () => {
        if (!engine || !selection)
            return;

        /*iaxios.post(apiurl.EXPORTLEGO, {
            project: engine.project.name,
            start: selection.start,
            end: selection.end
        }).then(res => {
            window.open(url.EXPORT + res.data.exportID, "_blank");
        }).catch(err => {
            toast.error("Failed to export LEGO, try again later");
        });*/
    }

    return (
        <>
            {visible &&
                <>
                    <Heading size={300} className="title">Selection</Heading>
                    <Pane className="selector">
                        <Text className="field" size={300}>
                            Selecting region with locked orthographic camera. If you wish to reposition your view, please close this menu first.
                        </Text>
                        {selection ?
                            <>
                                <Pane className="field">
                                    <Heading size={100}>Start coordinate</Heading>
                                    <Pane className="values">
                                        {format(selection.start[0])} {format(selection.start[1])}
                                    </Pane>
                                </Pane>
                                <Pane className="field">
                                    <Heading size={100}>End coordinate</Heading>
                                    <Pane className="values">
                                        {format(selection.end[0])} {format(selection.end[1])}
                                    </Pane>
                                </Pane>
                                <Pane className="field">
                                    <Heading size={100}>Area Size (coordinate diff)</Heading>
                                    <Pane className="values">
                                        {format(selection.size[0])} {format(selection.size[1])}
                                    </Pane>
                                </Pane>
                                <Pane className="field buttons">
                                    <Button marginRight={4} onClick={exportOBJ}>
                                        Export OBJ
                                    </Button>
                                    <Button onClick={exportLego}>
                                        Export Lego
                                    </Button>
                                </Pane>
                            </>
                            : <Heading size={100}>No selection</Heading>}
                    </Pane>
                </>
            }
        </>
    )
}
