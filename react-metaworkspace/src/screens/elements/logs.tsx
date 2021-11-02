import { Pane, Tablist, Tab, EmptyState, ApplicationIcon } from 'evergreen-ui'
import { useEffect, useState } from 'react'
import { useHistory, useParams } from 'react-router-dom'
import { Log } from './log'
import iaxios from '../../axios'
import { url, apiurl } from '../../url'
import { EvergreenReactRouterLink } from './header'
import ReactJson from 'react-json-view'


export function LogList() {
    const [logs, setLogs] = useState<string[]>([]);
    const [selectedLog, setSelectedLog] = useState<string | undefined>(undefined);

    let update: NodeJS.Timeout;

    const loadLogs = () => {
        iaxios.get(apiurl.LISTLOGS).then((response) => {
            console.log(response.data);
            setLogs(response.data);
            update = setTimeout(loadLogs, 2000);
        });
    }

    useEffect(() => {
        loadLogs();
        return () => {
            setLogs([]);
            clearTimeout(update);
        };
    }, []);

    return (
        <Pane>
            <Tablist className="logList" marginBottom={16} flexBasis={240} marginRight={24}>
                {logs.map((log, index) => (
                    <Tab
                        key={log}
                        id={log}
                        onSelect={() => setSelectedLog(log)}
                        isSelected={log === selectedLog}
                        aria-controls={`panel-${log}`}
                        className="logTab"
                    >
                        {log}
                    </Tab>
                ))}
            </Tablist>
            <Pane>
                { selectedLog ?
                    <Log name={selectedLog}/>
                :
                <EmptyState
                    background="light"
                    title="No Log selected"
                    orientation="horizontal"
                    icon={<ApplicationIcon color="#C1C4D6" />}
                    iconBgColor="#EDEFF5"
                    description="Logs contain debug information for running processes"
                />
                }
            </Pane>
        </Pane>
    );
}

