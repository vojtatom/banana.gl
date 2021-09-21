import React from 'react';
import { Card } from '@geist-ui/react'


class ProjectBar extends React.Component {
  render() {
    return (
        <Card>
          <input placeholder="Project Name" />
          <button>Create Project</button>
        </Card>
    )
  }
}

export default ProjectBar;