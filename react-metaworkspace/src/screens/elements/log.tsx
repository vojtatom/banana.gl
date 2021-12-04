import { Pane, Pre } from 'evergreen-ui'
import { useEffect, useState } from 'react'
import iaxios from '../../axios'
import { apiurl } from '../../url'


interface ILogProps {
    name: string;
}

export function Log(props: ILogProps) {
    const [contents, setContents] = useState("");

    useEffect(() => {
        let update: NodeJS.Timeout;

        const loadLog = () => {
            iaxios.post(apiurl.LOG, {
                name: props.name
            }).then((response) => {
                setContents(response.data);
                update = setTimeout(loadLog, 2000);
            })
        }

        loadLog();
        return () => {
            setContents("");
            clearTimeout(update);
        };
    }, [props.name]);

    return ( 
        <Pane className="logContents">
            { contents && contents.length > 0 ?
                <Pre className="logLines">{contents.split(/[\r\n]+/).map((line, index) => <span key={index}>{line}</span>)}</Pre>
                :
                <Pre>No contents</Pre>
            }
        </Pane>
    );
}

