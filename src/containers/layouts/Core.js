import React, { PropTypes } from 'react';

export default class Core extends React.Component {
  static propTypes = {
    children: PropTypes.element.isRequired,
    apiPath: PropTypes.string.isRequired,
    instanceStore: PropTypes.object.isRequired,
    location: PropTypes.object.isRequired,
  };

  static childContextTypes = {
    apiPath: PropTypes.string.isRequired,
    instanceStore: PropTypes.object.isRequired,
    location: PropTypes.object.isRequired,
  };

  getChildContext = () => ({
    apiPath: this.props.apiPath,
    instanceStore: this.props.instanceStore,
    location: this.props.location,
  });

  render() {
    return this.props.children;
  }
}
