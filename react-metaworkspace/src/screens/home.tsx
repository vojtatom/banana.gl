import { Pane, Heading, Button, Paragraph, Link } from 'evergreen-ui'
import { useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import iaxios from '../axios';
import { apiurl, url } from '../url';
import { EvergreenReactRouterLink } from './elements/header';


export function Home() {
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
  }, []);

  return (
    <Pane className="home">
      <Heading className="homeHeading">Metacity</Heading>
      <Pane className="homeProjectList">
        {projects.map((project, index) => (
          <Button height={48} key={index} onClick={() => history.push(url.VIEW + project)}>
            {project}
          </Button>)
        )}
      </Pane>
      <EvergreenReactRouterLink to={url.PROJECTS} className="homeNav">
        Go to Controls
      </EvergreenReactRouterLink>
    </Pane>
  );
}