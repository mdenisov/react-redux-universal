import React, { PropTypes } from 'react';
import { extendRouter } from '../helpers/router';

export default ({
    childContextTypes,
    childContext,
  } = {}) => {
  return class Root extends React.Component {
    static propTypes = {
      children: PropTypes.element.isRequired,
      apiPath: PropTypes.string.isRequired,
      instanceStore: PropTypes.object.isRequired,
      location: PropTypes.object.isRequired,
      projectPath: PropTypes.string.isRequired,
    };

    static contextTypes = {
      router: PropTypes.object.isRequired,
    };

    static childContextTypes = Object.assign({
      apiPath: PropTypes.string.isRequired,
      instanceStore: PropTypes.object.isRequired,
      location: PropTypes.object.isRequired,
      router: PropTypes.object.isRequired,
      projectPath: PropTypes.string.isRequired,
    }, childContextTypes);

    getChildContext = () => (Object.assign({
      apiPath: this.props.apiPath,
      instanceStore: this.props.instanceStore,
      location: this.props.location,
      router: extendRouter(this.context.router, this.props.location.basename),
      projectPath: this.props.projectPath,
    }, childContext));

    render() {
      return this.props.children;
    }
  };
};
