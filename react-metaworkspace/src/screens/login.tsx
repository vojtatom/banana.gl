import { Pane, Tablist, Tab, Heading, EmptyState, ProjectsIcon, AddIcon, Dialog, TextInput, Text } from 'evergreen-ui'
import { useEffect, useState, FormEvent, createRef } from 'react'
import { useHistory, useParams } from 'react-router-dom';
import iaxios from '../axios';
import { url, apiurl } from '../url';


export function authUser(history: any, callback: CallableFunction) {
    iaxios.get(apiurl.AUTHUSER).then((response) => {
        console.log('user auth', response.data);
        callback();
    }).catch((reject) => {
        history.push(url.LOGIN);
    });
}


export function Login() {
  const [status, setStatus] = useState<string>("");
  let history = useHistory();

  const name = createRef<HTMLInputElement>();
  const pass = createRef<HTMLInputElement>();

  const login = (event: FormEvent) => {
    event.preventDefault();
    console.log(name.current?.value, pass.current?.value);

    let formData = new FormData();
    formData.append("username", name.current?.value || "");
    formData.append("password", pass.current?.value || "");

    iaxios.post(apiurl.TOKEN, formData, {
      headers: {
        "Content-Type": "multipart/form-data"
      }
    }).then((response) => {
      console.log(response);
      localStorage.setItem("JWT", response.data.access_token);
      iaxios.defaults.headers.common["Authorization"] = `Bearer ${response.data.access_token}`;
      history.push(url.PROJECTS);
    }).catch((reject) => {
      console.error(reject);
      setStatus("There was a problem with your login, check your username and password.")
    });
  };

  useEffect(() => {
    iaxios.get(apiurl.AUTHUSER, ).then(() => {
      history.push(url.PROJECTS);
    }).catch((reject) => {
        //silently pass
    });
  }, []);


  return (
    <Pane className="fullScreen">
        <Pane>
          <Heading is="h1">Login</Heading>
          { status.length > 0? <p>{status}</p> : ""}
          <form onSubmit={login}>
            <TextInput width="100%" placeholder="username" ref={name} type="text" />
            <TextInput width="100%" placeholder="password" ref={pass} type="password" />
            <TextInput type="submit"/>
          </form>
        </Pane>
    </Pane>
  )
}