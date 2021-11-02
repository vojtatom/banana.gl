import { Pane, EmptyState, ProjectsIcon } from 'evergreen-ui'
import { useEffect, useState } from 'react'
import { useHistory, useParams } from 'react-router-dom';
import iaxios from '../axios';
import { url, apiurl } from '../url';
import { Header } from './elements/header'
import { Project } from './elements/project'
import { ProjectList } from './elements/projectlist'
import { AddProjectDialog } from './elements/projectadd'
import { authUser } from './login';


export function Projects() {
    const { project_name } = useParams<{ project_name: string|undefined }>();
    const [currentProject, setCurrentProject] = useState<string|undefined>(project_name);
    const [projects, setProjects] = useState<string[]>([]);
    const [addDialogShown, setAddDialogShown] = useState(false);
    const history = useHistory();

    const getProjects = () => {
        iaxios.get(apiurl.LISTPROJECT).then((response) => {
            console.log(response.data);
            setProjects(response.data);
        });
    }

    useEffect(() => {
        authUser(history, () => {
            getProjects();
        });
        return () => {
            setProjects([]);
        };
    }, []);

    const showProject = (name?: string) => {
        getProjects();
        setCurrentProject(name);

        let lurl = url.PROJECTS;
        if (name)
            lurl += name;
        history.push(lurl);
    }

    return (
        <Pane>
            <AddProjectDialog
                isShown={addDialogShown}
                setIsShown={(isShown: boolean) => setAddDialogShown(isShown)}
                onSubmit={getProjects} />
            <Header projects />
            <Pane className="projects">
                <ProjectList
                    currentProject={currentProject}
                    onSelect={showProject}
                    onAddDialog={() => setAddDialogShown(true)}
                    projects={projects}
                />
                <Pane className={`content ${currentProject ? "" : "empty"}`} justifyContent="center" alignItems="center">
                    {currentProject ?
                        <Project
                            name={currentProject} 
                            showProject={showProject}
                        />
                        :
                        <EmptyState
                            background="light"
                            title="No project selected"
                            orientation="vertical"
                            icon={<ProjectsIcon color="#C1C4D6" />}
                            iconBgColor="#EDEFF5"
                        />}
                </Pane>
            </Pane>
        </Pane>
    );
}