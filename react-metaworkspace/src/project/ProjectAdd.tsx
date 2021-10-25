import React, { useState } from 'react';
import { useHistory } from 'react-router';
import iaxios from '../axios';
import { Page } from '../elements/Page';
import './style.css'


enum NameState {
  empty,
  exists,
  valid
}


export function ProjectAdd() {  
  const [name, setName] = useState("");
  const [availability, setAvailability] = useState(NameState.empty);
  let history = useHistory();


  const testAvailability = (event: React.FormEvent<HTMLInputElement>) => {
    const name = event.currentTarget.value;
    iaxios.post('/project/exists', { name: name }).then((response) => {
      if (name.length === 0)
        setAvailability(NameState.empty);
      else if (response.data.exists)
        setAvailability(NameState.exists);
      else 
        setAvailability(NameState.valid);
      setName(name);
    })
  };

  const availabilityMessage = () => {
    switch (availability) {
      case NameState.empty:
        return 'No name specified';
      case NameState.valid:
        return 'Create project';
      default:
        return `Project ${name} already exists`;
    }
  };

  const addProject = () => {
    if (availability === NameState.valid) {
      iaxios.post('/project/add', { name: name }).then((response) => {
         console.log(response.data);
         history.push("/");
      })
    }
  };

  return (
    <Page>
      <h1>Add Project</h1>
        <input width="100%"
                placeholder="Project Name" 
                onChange={ (e) => testAvailability(e)}
                value={name}/>
        <button onClick={(e) => addProject()} 
            className={availability !== NameState.valid ? 'nonactive' : '' }>
              {availabilityMessage()}
        </button>
    </Page>
  )
}

