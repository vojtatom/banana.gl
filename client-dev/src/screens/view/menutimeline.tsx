import { Button, Heading, IconButton, Pane, PauseIcon, PlayIcon, SelectMenu } from "evergreen-ui";
import { useEffect, useRef, useState } from "react";
import { MetacityEngine } from "../../engine/engine";


export function TimelineMenu(props: { engine: MetacityEngine | undefined, visible: boolean }) {
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
            {visible && (
                engine?.controls?.hasTimeData ?
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
                                        options={speedOptions.map((value) => ({ label: `${value}\u00D7`, value: value }))}
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
                :
                <>
                    <Heading size={300} paddingBottom={32} className="title">No dynamic data</Heading>
                </>
                )
            }
        </>
    )
}
