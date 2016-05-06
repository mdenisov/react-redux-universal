import React, { PropTypes } from 'react';
import { extendRouter } from '../helpers/router';
import RouteTransition from '../containers/RouteTransition';
import { withRouter } from 'react-router';

export default ({
    childContextTypes,
    childContext,
  } = {}) => {
  class Root extends React.Component {
    static propTypes = {
      children: PropTypes.element.isRequired,
      apiPath: PropTypes.string.isRequired,
      instanceStore: PropTypes.object.isRequired,
      location: PropTypes.object.isRequired,
      projectPath: PropTypes.string.isRequired,
      router: PropTypes.object.isRequired,
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
      router: extendRouter(this.props.router, this.props.location.basename),
      projectPath: this.props.projectPath,
    }, childContext));

    componentDidMount() {
      const { router } = this.props;
      router.listenBefore(newLocation => {
        if (this.getCurrentLocation() !== `${newLocation.pathname}${newLocation.search}`) {
          this.routeTransition.getWrappedInstance().start();
        }
      });
    }

    componentWillReceiveProps(props) {
      if (props.children !== this.props.children) {
        this.routeTransition.getWrappedInstance().end();
      }
    }

    getCurrentLocation() {
      return `${window.location.pathname}${window.location.search}`;
    }

    render() {
      return (
        <div>
          <RouteTransition ref={ref => this.routeTransition = ref}/>
          {this.props.children}
        </div>
      );
    }
  }
  return withRouter(Root);
};
