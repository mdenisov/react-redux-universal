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
    constructor() {
      super();
      this.bindApi = this.bindApi.bind(this);
    }

    getChildContext() {
      return Object.assign({
        location: extendLocation(this.props.location, this.props.params),
        router: extendRouter(this.props.router, this.props.location.basename),
      }, childContext);
    }

    componentDidMount() {
      const { router } = this.props;
      router.listenBefore(newLocation => {
        if (this.getCurrentLocation() !== `${newLocation.pathname}${newLocation.search}`) {
          this.routeTransitionStart();
        }
      });
    }

    componentWillReceiveProps(props) {
      if (props.children !== this.props.children) {
        this.routeTransitionEnd();
      }
    }

    getCurrentLocation() {
      return `${window.location.pathname}${window.location.search}`;
    }

    bindApi({ start, end }) {
      this.routeTransitionStart = start;
      this.routeTransitionEnd = end;
    }

    render() {
      return (
        <div>
          <RouteTransition bindApi={this.bindApi} />
          {this.props.children}
        </div>
      );
    }
  }

  Root.propTypes = {
    children: PropTypes.element.isRequired,
    location: PropTypes.object.isRequired,
    router: PropTypes.object.isRequired,
    params: PropTypes.object.isRequired,
  };

  Root.childContextTypes = Object.assign({
    location: PropTypes.object.isRequired,
    router: PropTypes.object.isRequired,
  }, childContextTypes);

  return withRouter(Root);
};
