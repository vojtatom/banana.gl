import { Heading, Pane, TextInput } from 'evergreen-ui';
import { createRef, FormEvent, useState } from 'react';
import iaxios from '../../axios';
import { apiurl } from '../../url';


export function Login(props: { onLogin: () => void }) {
  const { onLogin } = props;
  const [status, setStatus] = useState<string>("");

  const name = createRef<HTMLInputElement>();
  const pass = createRef<HTMLInputElement>();

  const login = (event: FormEvent) => {
    event.preventDefault();

    let formData = new FormData();
    formData.append("username", name.current?.value || "");
    formData.append("password", pass.current?.value || "");

    iaxios.post(apiurl.TOKEN, formData, {
      headers: {
        "Content-Type": "multipart/form-data"
      }
    }).then((response) => {
      localStorage.setItem("JWT", response.data.access_token);
      iaxios.defaults.headers.common["Authorization"] = `Bearer ${response.data.access_token}`;
      onLogin();
    }).catch((reject) => {
      console.error(reject);
      setStatus("There was a problem with your login, check your username and password.")
    });
  };

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