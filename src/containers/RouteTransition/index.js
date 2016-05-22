import React, { PropTypes } from 'react';
import { VelocityComponent } from 'velocity-react';
import { connect } from 'react-redux';
import * as TransitionActions from './reducer';
import { bindActionCreators } from 'redux';
import styles from './index.css';

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
    }, 100);
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
            <div className={styles.line}/>
          </VelocityComponent>
        </div>
      </VelocityComponent>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps, null, { withRef: true })(RouterTransition);