import { Button, GitBranchIcon, Link, Pane } from 'evergreen-ui'
import React from 'react'
import { Link as ReactRouterLink } from 'react-router-dom'
import { url } from '../../url'
import { JobList } from '../jobs/list'

export const EvergreenReactRouterLink = (props: any) =>
    <Link is={ReactRouterLink} {...props} />


interface IHeaderProps {
    home?: boolean;
    projects?: boolean;
    jobs?: boolean;
}

export function Header(props: IHeaderProps) {

    return (
        <Pane className="header">
            <Button is={EvergreenReactRouterLink} to={url.HOME} appearance='minimal'>Metacity</Button>
            <Pane flexGrow={1}></Pane>
            <Button is={Link} href={"https://github.com/MetacitySuite"} iconBefore={GitBranchIcon} appearance='minimal'>Github</Button>
            <JobList/>
        </Pane>
    )
}