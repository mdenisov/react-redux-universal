import React, { PropTypes } from 'react';
import { VelocityComponent } from 'velocity-react';
import { connect } from 'react-redux';
import * as TransitionActions from '../redux/modules/router/transition';
import { bindActionCreators } from 'redux';

const mapStateToProps = state => ({
  routerTransition: state.routerTransition,
});

const mapDispatchToProps = dispatch => ({
  transitionActions: bindActionCreators(TransitionActions, dispatch),
});

class RouterTransition extends React.Component {
  static propTypes = {
    routerTransition: PropTypes.shape({
      progress: PropTypes.number.isRequired,
      start: PropTypes.bool.isRequired,
    }).isRequired,
    transitionActions: PropTypes.object.isRequired,
  };

  start = () => {
    this.startTimeout = setTimeout(() => {
      this.props.transitionActions.start();
    }, 1000);
  };

  end = () => {
    clearTimeout(this.startTimeout);
    this.props.transitionActions.end();
  };

  render() {
    const { start, progress } = this.props.routerTransition;
    return (
      <VelocityComponent animation={{ opacity: start ? 1 : 0 }} duration={400}>
        <div>
          <VelocityComponent animation={{ width: `${progress}%` }} duration={400}>
            <div style={{ position: 'fixed', left: '0', top: '0', height: '2px', backgroundColor: '#77b6ff', boxShadow: '0 0 10px rgba(119,182,255,0.7)' }}/>
          </VelocityComponent>
        </div>
      </VelocityComponent>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps, null, { withRef: true })(RouterTransition);
