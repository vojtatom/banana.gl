import { Pane, Heading, Button, StyleIcon, EmptyState, TrashIcon, EditIcon } from 'evergreen-ui'
import { useCallback, useEffect, useState } from 'react'
import iaxios from '../../axios'
import { url, apiurl } from '../../url'
import { authUser } from '../login'
import { useHistory } from 'react-router'
import { InputDialog, TextDialog } from './dialog'

interface IStyleListProps {
    project: string;
}

export function Styles(props: IStyleListProps) {
    const [styles, setStyles] = useState<any[]>([]);
    const history = useHistory();

    const getStyles = useCallback(() => {
        iaxios.post(apiurl.LISTSTYLES, { name: props.project }).then((response) => {
            setStyles(response.data);
        });
    }, [props.project]);

    useEffect(() => {
        authUser(history, () => {
            getStyles();
        })
    }, [props.project, history, getStyles]);

    return (
        <Pane className="styles">
            <Pane className="projectHeader">
                <Heading className="wide" is="h3">Styles</Heading> 
            </Pane>
            <Pane className="styleList">
                {styles.length > 0 ? styles.map((style) => (
                    <Pane key={style} className="styleItem">
                        <Pane className="styleTitle" onClick={() => { history.push(url.STYLE + props.project + "/" + style) }}>
                            {style}
                        </Pane>
                        <Pane>

                        <InputDialog
                            submitUrl={apiurl.RENAMESTYLE}
                            title={`Rename style ${style}`}
                            label={`Choose a new name for style ${style}`}
                            confirmLabel="Rename"
                            method="post"
                            submitBody={(name) => { return {project: props.project, new: name, old: style } }}
                            onSubmit={() => { getStyles() }}
                            onError={(reject, name) => {return "Project already exists"}} 
                        >

                            <Button marginRight={16} appearance="minimal" iconBefore={EditIcon}>
                                Rename
                            </Button>

                        </InputDialog>


                        <TextDialog
                            submitUrl={apiurl.DELETESTYLE}
                            title={`Delete style ${style}`}
                            label={`Do you really want to delete style ${style}?`}
                            confirmLabel="Delete"
                            method="delete"
                            intent="danger"
                            submitBody={() => { return { data: { project: props.project, name: style }}}}
                            onSubmit={() => { getStyles() }}
                            onError={(reject) => {return "Style could not be deleted"}} 
                        >
                            <Button appearance="minimal" intent="danger" iconBefore={TrashIcon}>
                                Delete
                            </Button>
                        </TextDialog>

                        </Pane>
                    </Pane>
                )) : 
                <EmptyState
                    background="light"
                    title="No Styles in this Project"
                    orientation="vertical"
                    icon={<StyleIcon color="#C1C4D6" />}
                    iconBgColor="#EDEFF5"
                    description="Styles modify the appearance of the layer in the visualization according to the layer and object metadata"
                />
                }
            </Pane>
        </Pane>
    )
}