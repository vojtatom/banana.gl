import { Heading, Pane } from "evergreen-ui";
import { useEffect, useState } from "react";
import iaxios from "../../axios";
import { MetacityEngine } from "../../engine/engine";
import { apiurl } from "../../url";

type color = [number, number, number];

interface colormap {
    range: [number, number];
    colors: color[];
}

export function StyleMenu(props: { engine: MetacityEngine | undefined, visible: boolean }) {
    const { engine, visible } = props;
    const [selected, setSelected] = useState<string | undefined>(undefined);
    const [legend, setLegend] = useState<{ [name: string]: color | colormap  } | undefined>(undefined);

    const applyStyle = (style?: string) => {
        if (engine == null)
            return

        setSelected(style);

        if (style)
        {
            engine.project.applyStyle(style);
            iaxios.get(`${apiurl.PROJECTDATA}${engine.project.name}/styles/${style}_legend.mss.json`, {
                headers: {
                    'Cache-Control': 'no-cache',
                    'Pragma': 'no-cache',
                    'Expires': '0'
                }
            }).then((response) => {
                setLegend(response.data);
            }).catch(() => {
                setLegend(undefined);
            });
        }
        else {
            engine.project.clearStyle();
            setLegend(undefined);
        }
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
                    <Heading size={300} className="title">Legend</Heading>
                    <Pane className="legend">
                        {legend ? Object.keys(legend).map(name => (
                            <Pane key={name} className={`legend-item ${(legend[name] as colormap).range && "vertical"}`}>
                                <Pane className="legend-name">{name}</Pane>
                                { (legend[name] as colormap).range ?
                                    <Pane className="legend-colormap-cont">
                                        <Pane className="legend-colormap"
                                            style={{ backgroundImage:
                                                `linear-gradient(to right, ${
                                                    (legend[name] as colormap).colors.map(color => `rgb(${color[0]}, ${color[1]}, ${color[2]})`).join(", ")
                                                })` }}
                                        />
                                        <Pane className="legend-range">
                                                <Pane>
                                                    {(legend[name] as colormap).range[0]}
                                                </Pane>
                                                <Pane>
                                                    {(legend[name] as colormap).range[1]}
                                                </Pane>
                                        </Pane>
                                    </Pane>

                                    : 
                                    <Pane className="legend-color" style={{ backgroundColor: `rgb(${(legend[name] as color)[0]}, ${(legend[name] as color)[1]}, ${(legend[name] as color)[2]})` }} />
                                }
                            </Pane>
                        )) : <Pane className="legend-item">No Legend</Pane>}
                    </Pane>
                </>
            }
        </>
    )
}