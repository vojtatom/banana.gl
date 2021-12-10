import { Button, ConsoleIcon, EmptyState, Heading, Pane, Paragraph, Pre, SearchInput, SideSheet, Table } from 'evergreen-ui';
import { useEffect, useState } from 'react';
import iaxios from '../../axios';
import { apiurl } from '../../url';


interface IJob {
    type: string;
    status: number;
    project?: string;
    job_id: string;
}

export function JobList() {
    const [jobs, setJobs] = useState<IJob[]>([]);
    const [detailIsShown, setDetailIsShown] = useState(false);
    const [logName, setLogName] = useState<string|undefined>();
    const [updatingLog, setUpdatingLog] = useState<NodeJS.Timeout|undefined>(undefined);
    const [logContents, setLogContents] = useState("");
    
    useEffect(() => {
        let update: NodeJS.Timeout;

        const loadLog = () => {
            if (!logName || logName.length === 0) {
                setLogContents("");
                return;
            }

            iaxios.post(apiurl.LOG, {
                name: logName
            }).then((response) => {
                setLogContents(response.data);
                update = setTimeout(loadLog, 2000);
            })
        }

        if (updatingLog)
            clearTimeout(updatingLog);
        setUpdatingLog(setTimeout(loadLog, 1000));

        return () => {
            setLogContents("");
            clearTimeout(update);
        };
    
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [logName]);


    useEffect(() => {
        let update: NodeJS.Timeout;

        const loadJobs = () => {
            iaxios.get(apiurl.LISTJOBS).then((response) => {
                setJobs(response.data);
                update = setTimeout(loadJobs, 2000);
            });
        }

        loadJobs();

        return () => {
            clearTimeout(update);
            setJobs([]);
        };
    }, []);

    return (
        <>
            <SideSheet
                isShown={detailIsShown}
                onCloseComplete={() => setDetailIsShown(false)}
                preventBodyScrolling>
                <Pane>
                    <Heading margin={15}>Running Jobs</Heading>
                    <Paragraph margin={15}>
                        These are the jobs that are currently running or have been queued.
                    </Paragraph>
                    <Table margin={15}>
                        <Table.Head className="row">
                            <Table.TextHeaderCell className="wide">Job Type</Table.TextHeaderCell>
                            <Table.TextHeaderCell className="wide">Status</Table.TextHeaderCell>
                            <Table.TextHeaderCell className="wide">Project</Table.TextHeaderCell>
                            <Table.TextHeaderCell className="narrow">Log</Table.TextHeaderCell>
                        </Table.Head>
                        <Table.Body>
                            {jobs.length > 0 ? jobs.map((job) => (
                                <Table.Row key={job.job_id} paddingY={12} height="auto" className="row">
                                    <Table.TextCell className="wide">{job.type}</Table.TextCell>
                                    <Table.TextCell className="wide">{job.status}</Table.TextCell>
                                    <Table.TextCell className="wide">{job.project ? job.project : "--"}</Table.TextCell>
                                    <Table.TextCell className="narrow"><Button onClick={() => setLogName("worker0")}>Log</Button></Table.TextCell>
                                </Table.Row>
                            )) :
                                <EmptyState
                                    background="light"
                                    title="No Running Jobs"
                                    orientation="horizontal"
                                    icon={<ConsoleIcon color="#C1C4D6" />}
                                    iconBgColor="#EDEFF5"
                                    description="Jobs run in the background and process input data into visualizable elements"
                                />
                            }
                        </Table.Body>
                    </Table>
                    <SearchInput placeholder='Type worker0 to see processing logs' width="calc(100% - 30px)" margin={15} onChange={(e: any) => setLogName(e.target.value)} value={logName} />
                    <Pane className="logContents">
                        { logContents && logContents.length > 0 ?
                            <Pre className="logLines">{logContents.split(/[\r\n]+/).map((line, index) => <span key={index}>{line}</span>)}</Pre>
                            :
                            <Pre>No contents or no log selected</Pre>
                        }
                    </Pane>
                
                </Pane>
            </SideSheet>
            <Button iconBefore={ConsoleIcon} appearance='minimal' onClick={() => setDetailIsShown(true)}>Running Tasks</Button>
        </>
    );
}

