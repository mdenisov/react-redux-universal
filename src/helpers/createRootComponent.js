import React, { PropTypes } from 'react';
import { withRouter } from 'react-router';
import compose from 'recompose/compose';
import withContext from 'recompose/withContext';
import { extendRouter } from '../helpers/router';
import extendLocation from '../helpers/extendLocation';
import RouteTransition from '../components/RouteTransition';

export default ({
    childContextTypes,
    childContext,
  } = {}) => {
  const Root = ({ children }) => (
    <div>
      <RouteTransition children={children} />
      {children}
    </div>
  );

  Root.propTypes = {
    children: PropTypes.element.isRequired,
  };

  const enhancedWithContext = withContext(
    {
      ...childContextTypes,
      location: PropTypes.object.isRequired,
      router: PropTypes.object.isRequired,
    },
    (props) => ({
      ...childContext,
      location: extendLocation(props.location, props.params),
      router: extendRouter(props.router, props.location.basename),
    })
  );

  return compose(
    withRouter,
    enhancedWithContext
  )(Root);
};
