import { Pane, Tablist, Tab, Heading, AddIcon } from 'evergreen-ui'
import { apiurl } from '../../url'
import { InputDialog } from '../elements/dialog';

interface IProjectListProps {
    currentProject: string | undefined;
    onSelect: (name: string) => void;
    projects: string[];
}

export function ProjectList(props: IProjectListProps) {

  return (
    <Pane className="list">
        <Heading className="projectList title">Projects</Heading>

        <InputDialog
                submitUrl={apiurl.ADDPROJECT}
                title="Add Project"
                label={`Choose the name of the new project`}
                confirmLabel="Create"
                method="post"
                submitBody={(name) => { return { name: name } }}
                onSubmit={(project) => { props.onSelect(project) }}
                onError={(reject, style) => {return "Project already exists"}} 
            >
              <Pane className="projectList action"><AddIcon/>Add Project</Pane>
          </InputDialog>

        <Tablist className="projectList tabs">
        {props.projects.map((project) => (
            <Tab
            key={project}
            id={`tab-${project}`}
            onSelect={() => props.onSelect(project)}
            isSelected={project === props.currentProject}>
            {project}
            </Tab>
        ))}
        </Tablist>
    </Pane>
  );
}