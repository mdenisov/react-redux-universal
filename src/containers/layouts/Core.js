import React, { PropTypes } from 'react';

export default class Core extends React.Component {
  static propTypes = {
    children: PropTypes.element.isRequired,
    projectPath: PropTypes.string.isRequired,
    apiPath: PropTypes.string.isRequired,
    instanceStore: PropTypes.object.isRequired,
  };

  static childContextTypes = {
    projectPath: PropTypes.string.isRequired,
    apiPath: PropTypes.string.isRequired,
    instanceStore: PropTypes.object.isRequired,
  };

  getChildContext = () => ({
    projectPath: this.props.projectPath,
    apiPath: this.props.apiPath,
    instanceStore: this.props.instanceStore,
  });

  render() {
    return this.props.children;
  }
}
