import { Button, GitBranchIcon, Heading, Link, LogInIcon, Pane, Paragraph } from 'evergreen-ui';
import { useEffect, useState } from 'react';
import iaxios from '../../axios';
import { apiurl, url } from '../../url';
import { EvergreenReactRouterLink } from '../elements/header';


export function Home() {
	const [projects, setProjects] = useState<string[]>([]);
	const [exports, setExports] = useState<string[]>([]);

	const getData = () => {
		iaxios.get(apiurl.LISTPROJECT).then((response) => {
			setProjects(response.data);
		});
		iaxios.get(apiurl.LISTEXPORTS).then((response) => {
			setExports(response.data);
		});
	}

	useEffect(() => {
		getData();
		return () => {
			setProjects([]);
			setExports([]);
		};
	}, []);

	return (
		<>
			<Pane className="home page">
				<Heading size={900} marginBottom={64}>Metacity</Heading>
				<Paragraph marginBottom={64}>
				Metacity is a set of tools for urban data synthesis, analysis &amp; visualization. Our goal is to create a new generation of open-source tools and services targeted at developers, urban planners and the general public. We believe that urban data visualization should make the city look like a city, not a giant spreadsheet.
				</Paragraph>
				<Pane  position="absolute" top={10} right={10}>
					<Button is={Link} href={"https://github.com/MetacitySuite"} iconBefore={GitBranchIcon} appearance='minimal'>Github</Button>
					<Button is={EvergreenReactRouterLink} to={url.PROJECTS} iconBefore={LogInIcon} appearance='minimal'>Login</Button>
				</Pane>
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
					<Pane className="homeList">
						<Heading size={300} className="homeListHeading">Exports</Heading>
						{exports.map((exp, index) => (
							<EvergreenReactRouterLink to={url.EXPORT + exp} key={`export-${index}`}>
								{exp}
							</EvergreenReactRouterLink>
						))}
						{exports.length === 0 && (
							<Pane>
								<Heading size={300}>No exports</Heading>
							</Pane>
						)}
					</Pane>
				</Pane>
				<Heading size={300}>Partners</Heading>
				<Pane className="logos">
					<Link href="http://praha.camp/">
						<img className="logo" src={'../../assets/logos/camp.png'} alt="CAMP" />
					</Link>
					<Link href="https://iprpraha.cz/">
						<img className="logo" src={'../../assets/logos/ipr.png'} alt="IPR" />
					</Link>
					<Link href="https://fel.cvut.cz/en/">
						<img className="logo" src={'../../assets/logos/electrical_engeneering.svg'} alt="FEL CTU"/>
					</Link>
					<Link href="https://dcgi.fel.cvut.cz/">
						<img className="logo" src={'../../assets/logos/dcgi.png'} alt="DCGI"/>
					</Link>
					<Link href="https://fit.cvut.cz/cs">
						<img className="logo" src={'../../assets/logos/information_technology.svg'} alt="FIT CTU"/>
					</Link>
					<Link href="http://www.oncue.design/">
						<img className="logo" src={'../../assets/logos/ocd_logo_2.png'} alt="Ira Winder"/>
					</Link>
					<Link href="https://www.cesnet.cz/">
						<img className="logo" src={'../../assets/logos/cesnet.svg'} alt="Cesnet"/>
					</Link>
					<Link href="https://www.fujitsu.com/">
						<img className="logo" src={'../../assets/logos/fujitsu.png'} alt="Fujitsu"/>
					</Link>
				</Pane>
			</Pane>
		</>
	);
}