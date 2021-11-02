import { Pane, Tablist, Tab, Heading, AddIcon } from 'evergreen-ui'

interface IProjectListProps {
    currentProject: string | undefined;
    onSelect: (name: string) => void;
    onAddDialog: () => void;
    projects: string[];
}

export function ProjectList(props: IProjectListProps) {

  return (
    <Pane className="list">
        <Heading className="projectList title">Projects</Heading>
        <Pane className="projectList action" onClick={props.onAddDialog}><AddIcon/>Add Project</Pane>
        <Tablist className="projectList tabs">
        {props.projects.map((project) => (
            <Tab
            key={project}
            id={`tab-${project}`}
            onSelect={() => props.onSelect(project)}
            isSelected={project === props.currentProject}
            aria-controls={`panel-${project}`}>
            {project}
            </Tab>
        ))}
        </Tablist>
    </Pane>
  );
}