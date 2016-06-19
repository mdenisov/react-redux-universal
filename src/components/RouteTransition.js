import React, { PropTypes } from 'react';
import PageLoadProgressBar from './PageLoadProgressBar';
import { withRouter } from 'react-router';

class RouteTransition extends React.Component {
  constructor() {
    super();
    this.bindApi = this.bindApi.bind(this);
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

  shouldComponentUpdate() {
    return false;
  }

  getCurrentLocation() {
    return `${window.location.pathname}${window.location.search}`;
  }

  bindApi({ start, end }) {
    this.routeTransitionStart = start;
    this.routeTransitionEnd = end;
  }

  render() {
    return <PageLoadProgressBar bindApi={this.bindApi} />;
  }
}

RouteTransition.propTypes = {
  children: PropTypes.element.isRequired,
  router: PropTypes.object.isRequired,
};

export default withRouter(RouteTransition);
