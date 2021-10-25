import React from 'react';
import './style.css'


interface IPageProps {
  children?: React.ReactNode;
};


export function Page(props: IPageProps) {
    return (
        <div className='outer'>
            <div className='page'>
                {props.children}
            </div>
        </div>
    )
}
