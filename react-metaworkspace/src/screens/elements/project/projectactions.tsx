import { Pane, Button, CubeIcon, AddToArtifactIcon, MergeColumnsIcon, Text, StyleIcon, PresentationIcon, EditIcon, TrashIcon } from 'evergreen-ui'
import { useEffect, useState } from 'react'
import { useHistory } from 'react-router-dom'
import { InputDialog, TextDialog } from '../dialog'
import { url, apiurl } from '../../../url'


interface IProjectProps {
    name: string;
    showProject: (name?: string) => void;

}

export function ProjectActions(props: IProjectProps) {
    const history = useHistory();

    const recompile = () => {
        history.push(url.JOBS);
    }

    return (
        <Pane className="actions">

            <Button marginRight={12} marginBottom={12} appearance="minimal" iconBefore={AddToArtifactIcon} onClick={() => history.push(url.UPLOADLAYER + props.name)}>
                Add Layer
            </Button>

            <InputDialog
                submitUrl={apiurl.CREATESTYLE}
                title="Add Style"
                label={`Choose the name of the new style`}
                confirmLabel="Create"
                method="post"
                submitBody={(name) => { return { project: props.name, name: name } }}
                onSubmit={(style) => { history.push(url.STYLE + props.name + "/" + style) }}
                onError={(reject, style) => {return "Style already exists"}} 
            >
                <Button marginRight={12} marginBottom={12} appearance="minimal" iconBefore={StyleIcon}>
                    Add Style
                </Button>
            </InputDialog>

            <TextDialog
                submitUrl={apiurl.BUILDPROJECT}
                title={`Recompile project ${props.name}`}
                label={`Are you sure you want to recompile project ${props.name}?`}
                confirmLabel="Recompile"
                method="post"
                submitBody={() => { return { data: { name: props.name }}}}
                onSubmit={recompile}
                onError={(reject) => {return "Project could not be recompiled"}} 
                tooltip="Recompile after updating layers or styles to view the changes in the visualization"
            >
                <Button marginRight={12} marginBottom={12} appearance="minimal" iconBefore={CubeIcon}>
                    Recompile 3D
                </Button>
            </TextDialog>

            <Button  marginBottom={12} appearance="minimal" iconBefore={MergeColumnsIcon} onClick={() => {}} disabled>
                Map Layers
            </Button>
            <Button marginRight={12} marginBottom={12} appearance="minimal" iconBefore={PresentationIcon} onClick={() => { history.push(url.VIEW + props.name) }}>
                View
            </Button>
            <InputDialog
                submitUrl={apiurl.RENAMEPROJECT}
                title={`Rename project ${props.name}`}
                label={`Choose a new name for project ${props.name}`}
                confirmLabel="Rename"
                method="post"
                submitBody={(name) => { return {new: name, old: props.name} }}
                onSubmit={props.showProject}
                onError={(reject, name) => {return "Project already exists"}} 
            >
                <Button marginRight={12} marginBottom={12} appearance="minimal" iconBefore={EditIcon}>
                    Rename
                </Button>
            </InputDialog>
            <TextDialog
                submitUrl={apiurl.DELETEPROJECT}
                title={`Delete project ${props.name}`}
                label={`Do you really want to delete project ${props.name}?`}
                confirmLabel="Delete"
                method="delete"
                intent="danger"
                submitBody={() => { return { data: { name: props.name }}}}
                onSubmit={() => { props.showProject() }}
                onError={(reject) => {return "Project could not be deleted"}} 
            >
                <Button  marginBottom={12} appearance="minimal" iconBefore={TrashIcon} intent="danger">
                    Delete Project
                </Button>
            </TextDialog>

        </Pane>
    );
}

