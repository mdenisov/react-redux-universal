import React, { PropTypes } from 'react';
import { extendRouter } from '../helpers/router';
import { extendLocation } from '../helpers/location';
import RouteTransition from '../containers/RouteTransition';
import { withRouter } from 'react-router';

export default ({
    childContextTypes,
    childContext,
  } = {}) => {
  class Root extends React.Component {
    static propTypes = {
      children: PropTypes.element.isRequired,
      location: PropTypes.object.isRequired,
      router: PropTypes.object.isRequired,
      params: PropTypes.object.isRequired,
    };

    static childContextTypes = Object.assign({
      location: PropTypes.object.isRequired,
      router: PropTypes.object.isRequired,
    }, childContextTypes);

    getChildContext = () => (Object.assign({
      location: extendLocation(this.props.location, this.props.params),
      router: extendRouter(this.props.router, this.props.location.basename),
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
