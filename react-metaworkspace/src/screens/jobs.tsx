import { Pane, Heading } from 'evergreen-ui'
import { useEffect} from 'react'
import { useHistory } from 'react-router-dom';
import { Header } from './elements/header'
import { JobList } from './elements/jobs'
import { LogList } from './elements/logs'
import { authUser } from './login';


export function Jobs() {
    const history = useHistory();

    useEffect(() => {
        authUser(history, () => { });
    }, [history]);

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