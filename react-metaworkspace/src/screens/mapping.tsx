import { Pane, Heading, LayersIcon, Icon, TextInput, Button, Spinner, Text, SelectMenu, MergeColumnsIcon, Tooltip, Paragraph, ArrowRightIcon, Code } from 'evergreen-ui'
import { useEffect, useState, createRef, FormEvent } from 'react'
import { useHistory, useParams } from 'react-router-dom';
import iaxios from '../axios';
import { url, apiurl } from '../url';
import { Header } from './elements/header'
import { authUser } from './login';
import { toast } from 'react-toastify';
import { ILayer } from './elements/layers';



export function Mapping() {
    const { project_name } = useParams<{ project_name: string }>();
    const [layers, setLayers] = useState<ILayer[]>([]);
    const [selectedSource, setSelectedSource] = useState<string | undefined>(undefined);
    const [selectedTarget, setSelectedTarget] = useState<string | undefined>(undefined);
    const name = createRef<HTMLInputElement>();
    const history = useHistory();


    const loadLayers = () => {
        iaxios.post(apiurl.LISTLAYER, { name: project_name }).then((response) => {
            setLayers(response.data.filter((x: ILayer) => x.type === 'layer'));
        });
    }

    useEffect(() => {
        authUser(history, () => {
            loadLayers();
        })

        return () => {
            setLayers([]);
        };
    }, [project_name]);


    const submit = (event: FormEvent) => {
        event.preventDefault();

        const overlay_name = name.current!.value;
        if (overlay_name === undefined || overlay_name.length == 0)
        {
            toast.error('No name specified.');
            return;
        }

        if (selectedSource === undefined || selectedTarget === undefined) {
            toast.error('Please select source and target layer.');
            return;
        }

        if (selectedSource === selectedTarget) {
            toast.error('Source and target layer cannot be same.');
            return;
        }

        iaxios.post(apiurl.MAPLAYERS, {
                project: project_name,
                source: selectedSource,
                target: selectedTarget,
                overlay: overlay_name
            }).then(() => {
                toast.success('Mapping layers successfully.');
            }).catch(() => {
                toast.error('Mapping layers failed.');
            });
    };


    return (
        <Pane>
            <Header projects />
            <Pane className="mapping">
                <Icon icon={MergeColumnsIcon} size={30} color="#C1C4D6" background="#EDEFF5" className="uploadIcon" padding={20} borderRadius={40} />
                <Heading className="mappingTitle">Layer mapping in Project {project_name}</Heading>

                <Pane className="mappingDialog">
                    <form onSubmit={submit} id="layerMappingForm">
                        <TextInput placeholder="overlay name" ref={name} className="layerName" />
                        <Paragraph className="mappingDescription">
                            Geometry of source layer is mapped onto geometry of target layer. The output of this operation is a new layer with type <Code size={300}>overlay</Code>. The <Code size={300}>source</Code> layer can contain any geometry, the <Code size={300}>target</Code> layer must contain any <Code size={300}>polygons</Code>.
                        </Paragraph>
                        <Pane className="mappingLayerPicker">
                            <SelectMenu
                                title="Select source layer"
                                options={layers.map((layer) => ({ label: layer.name, value: layer.name }))}
                                selected={selectedSource}
                                onSelect={(item) => setSelectedSource(item.value as string)}
                            >
                                <Tooltip content="Can contain 2D or 3D points, lines or polygons">
                                    <Button type="button">{selectedSource || 'select source layer'}</Button>
                                </Tooltip>
                        </SelectMenu>
                        <Pane className="dialogPart">
                            <Icon icon={ArrowRightIcon} color="#C1C4D6"/>
                        </Pane>
                        <SelectMenu
                            title="Select target layer"
                            options={layers.map((layer) => ({ label: layer.name, value: layer.name }))}
                            selected={selectedTarget}
                            onSelect={(item) => setSelectedTarget(item.value as string)}
                        >
                            <Tooltip content="Must contain 2D or 3D polygons">
                            <Button type="button">{selectedTarget || 'select target layer'}</Button>
                            </Tooltip>
                        </SelectMenu>
                        </Pane>
                    </form>
                    <Button appearance="primary" type="submit" form="layerMappingForm">
                        Apply Mapping
                    </Button>
                </Pane>
            </Pane>
        </Pane>
    );
}