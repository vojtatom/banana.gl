import { Heading, Pane } from 'evergreen-ui';
import { useEffect, useState } from 'react';
import iaxios from '../../axios';
import { apiurl, url } from '../../url';
import { EvergreenReactRouterLink } from '../elements/header';


export function Home() {
	const [projects, setProjects] = useState<string[]>([]);

	const getData = () => {
		iaxios.get(apiurl.LISTPROJECT).then((response) => {
			setProjects(response.data);
		});
	}

	useEffect(() => {
		getData();
		return () => {
			setProjects([]);
		};
	}, []);

	return (
		<>
			<Pane className="home page">
				<Heading size={900} marginBottom={64}>Metacity</Heading>
				<Pane className="homeLists" marginBottom={64}>
					<Pane className="homeList">
						<Heading size={300} className="homeListHeading">Projects</Heading>
						{projects.map((project, index) => (
							<EvergreenReactRouterLink to={url.VIEW + project} key={`project-${index}`} size={500}>
								{project}
							</EvergreenReactRouterLink>
						))}
						{projects.length === 0 && (
							<Pane>
								<Heading size={500}>No projects found</Heading>
							</Pane>
						)}
					</Pane>
				</Pane>
			</Pane>
		</>
	);
}