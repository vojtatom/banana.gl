import React from 'react'
import { Link as ReactRouterLink } from 'react-router-dom'
import { Link, Pane } from 'evergreen-ui'
import { url } from '../../url'

export const EvergreenReactRouterLink = (props: any) =>
  <Link is={ReactRouterLink} {...props} />


interface IHeaderProps {
    home?: boolean;
    projects?: boolean;
    jobs?: boolean;
}

export function Header(props: IHeaderProps) {

    return (
        <Pane className="header" >
            <EvergreenReactRouterLink to={url.HOME} className={`headerLink ${props.home? 'selected' : ''}`}>Home</EvergreenReactRouterLink>
            <EvergreenReactRouterLink to={url.PROJECTS} className={`headerLink ${props.projects? 'selected' : ''}`}>Projects</EvergreenReactRouterLink>
            <EvergreenReactRouterLink to={url.JOBS} className={`headerLink ${props.jobs ? 'selected' : ''}`}>Jobs &amp; Logs</EvergreenReactRouterLink>
        </Pane>
    )
}