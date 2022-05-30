import React from 'react'
import ReactDOM from 'react-dom'
import { IconContext } from 'react-icons/lib'
import { App } from './app'

ReactDOM.render(
  <React.StrictMode>
    <IconContext.Provider value={{ className: 'react-icons' }}>
      <App /> 
      </IconContext.Provider>
  </React.StrictMode>,
  document.getElementById('root')
);
