import { Pane, Table, CodeIcon, ApplicationIcon, IconButton, EmptyState, ConsoleIcon, SideSheet, Heading } from 'evergreen-ui'
import { useEffect, useState } from 'react'
import iaxios from '../../axios'
import { apiurl } from '../../url'
import ReactJson from 'react-json-view'


interface IJob {
    type: string;
    status: number;
    project?: string;
    job_id: string;
}

export function JobList() {
    const [jobs, setJobs] = useState<IJob[]>([]);
    const [selectedJob, setSelectedJob] = useState<IJob | undefined>(undefined);
    const [detailIsShown, setDetailIsShown] = useState(false)

    
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
        <Pane>
            <SideSheet
                isShown={detailIsShown}
                onCloseComplete={() => setDetailIsShown(false)}
                preventBodyScrolling>
                <Pane className="jsonRaw">
                    <Heading className="jsonHeading">Job {selectedJob?.job_id}</Heading>

                    <Pane className="json">
                        <ReactJson 
                            src={selectedJob as object} 
                            enableClipboard={false}
                            theme={{
                                base00: "#FFF",
                                base01: "#DDD",
                                base02: "#DDD",
                                base03: "#444",
                                base04: "#BBB",
                                base05: "#444",
                                base06: "#444",
                                base07: "#444",
                                base08: "#444",
                                base09: "#3366FF",
                                base0A: "#3366FF",
                                base0B: "#3366FF",
                                base0C: "#3366FF",
                                base0D: "#BBB",
                                base0E: "#BBB",
                                base0F: "#3366FF"
                                //https://github.com/chriskempson/base16/blob/master/styling.md
                            }}/>
                    </Pane>
                </Pane>
            </SideSheet>
            <Table>
                <Table.Head className="row">
                    <Table.TextHeaderCell className="wide">Job Type</Table.TextHeaderCell>
                    <Table.TextHeaderCell className="wide">Status</Table.TextHeaderCell>
                    <Table.TextHeaderCell className="wide">Project</Table.TextHeaderCell>
                    <Table.TextHeaderCell className="narrow">Log</Table.TextHeaderCell>
                    <Table.TextHeaderCell className="narrow">Raw</Table.TextHeaderCell>
                </Table.Head>
                <Table.Body>
                    {jobs.length > 0 ? jobs.map((job) => (
                        <Table.Row key={job.job_id} paddingY={12} height="auto" className="row">
                            <Table.TextCell className="wide">{job.type}</Table.TextCell>
                            <Table.TextCell className="wide">{job.status}</Table.TextCell>
                            <Table.TextCell className="wide">{job.project ? job.project : "--"}</Table.TextCell>
                            <Table.TextCell className="narrow">
                                <IconButton icon={ApplicationIcon} onClick={() => {}} disabled/>
                            </Table.TextCell>
                            <Table.TextCell className="narrow">
                                <IconButton icon={CodeIcon} onClick={() => { setSelectedJob(job); setDetailIsShown(true); }} />
                            </Table.TextCell>
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
        </Pane>
    );
}

