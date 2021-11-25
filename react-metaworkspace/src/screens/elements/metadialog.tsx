import { CornerDialog, Pane, Text } from "evergreen-ui";
import { useEffect, useState } from "react"
import { MetacityEngine } from "../../engine/engine"




export function MetaDialog(props: {engine: MetacityEngine | undefined}) {
    const {engine} = props;

    const [meta, setMeta] = useState<{[name: string]: any}>({});
    const [metaIsShown, setMetaIsShown] = useState(false);


    const showMeta = (data: {[name: string]: any}) => {
        setMeta(data);
        setMetaIsShown(true);
    }

    const closeMeta = () => {
        engine?.controls?.select(-1);
        setMetaIsShown(false);
    }


    useEffect(() => {
        if (engine && engine.controls)
        {
            engine.controls.showMetaCallback = showMeta;
            engine.controls.closeMetaCallback = closeMeta;
        }
    }, [engine]);


    return (
        <CornerDialog
            title="Metadata"
            hasCancel={false}
            hasFooter={false}
            width="auto"
            isShown={metaIsShown}
            onCloseComplete={closeMeta}
            onCancel={closeMeta}
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
    )
}