import { CrossIcon, Heading, IconButton, Pane } from 'evergreen-ui';
import { useState, cloneElement } from 'react'

export function SideMenu(props: {children: any, isShown: boolean, onClose: () => void}) {
    const { children, isShown, onClose } = props;

    return (
        <Pane className="viewMenu" display={isShown? "block" : "none"}>
            <IconButton className="closeViewMenu" appearance="minimal" icon={CrossIcon} onClick={onClose}/>
            {children}
        </Pane>
    );
}