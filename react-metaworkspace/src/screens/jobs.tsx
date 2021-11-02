import { Pane, Heading } from 'evergreen-ui'
import { useEffect, useState, createRef, FormEvent } from 'react'
import { useHistory, useParams } from 'react-router-dom';
import iaxios from '../axios';
import { url, apiurl } from '../url';
import { Header } from './elements/header'
import { JobList } from './elements/jobs'
import { LogList } from './elements/logs'
import { Project } from './elements/project'
import { ProjectList } from './elements/projectlist'
import { AddProjectDialog } from './elements/projectadd'
import { authUser } from './login';
import { useDropzone } from 'react-dropzone';
import { toast } from 'react-toastify';


export function Jobs() {
    const history = useHistory();

    useEffect(() => {
        authUser(history, () => { });
    }, []);

    return (
        <Pane>
            <Header jobs />
            <Pane className="jobs">
                <Heading className="jobsHeading">Jobs</Heading>
                <JobList />
            </Pane>
            <Pane className="logs">
                <Heading className="logsHeading">Logs</Heading>
                <LogList />
            </Pane>
        </Pane>
    );
}