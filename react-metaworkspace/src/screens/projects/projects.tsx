import { EmptyState, Pane, ProjectsIcon } from 'evergreen-ui';
import { useEffect, useState } from 'react';
import { useHistory, useParams } from 'react-router-dom';
import iaxios from '../../axios';
import { apiurl, url } from '../../url';
import { Header } from '../elements/header';
import { Project } from './project';
import { ProjectList } from './projectlist';


export function Projects() {
    const { project_name } = useParams<{ project_name: string|undefined }>();
    const [currentProject, setCurrentProject] = useState<string|undefined>(project_name);
    const [projects, setProjects] = useState<string[]>([]);
    const history = useHistory();

    const getProjects = () => {
        iaxios.get(apiurl.LISTPROJECT).then((response) => {
            setProjects(response.data);
        });
    }

    useEffect(() => {
        getProjects();

        return () => {
            setProjects([]);
        };
    }, [history]);

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
            <Header projects />
            <Pane className="projects">
                <ProjectList
                    currentProject={currentProject}
                    onSelect={showProject}
                    projects={projects}
                />
                <Pane className={`content ${currentProject ? "" : "empty"}`} justifyContent="center" alignItems="center">
                    {currentProject ?
                        (projects.indexOf(currentProject) > -1 ?    
                            <Project
                            name={currentProject} 
                            showProject={showProject}
                            /> :
                            <EmptyState
                            background="light"
                            title={`Project ${currentProject} not found`}
                            orientation="vertical"
                            icon={<ProjectsIcon color="#C1C4D6" />}
                            iconBgColor="#EDEFF5"
                        />                            
                        ) :
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