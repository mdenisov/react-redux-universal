import React, { PropTypes } from 'react';
import { VelocityComponent } from 'velocity-react';
import { connect } from 'react-redux';
import * as TransitionActions from './reducer';
import styles from './index.css';

class PageLoadProgressBar extends React.Component {
  constructor(props) {
    super(props);
    props.bindApi({
      start: this.start.bind(this),
      end: this.end.bind(this),
    });
  }

  start() {
    this.startTimeout = setTimeout(() => {
      this.props.start();
    }, 100);
  }

  end() {
    clearTimeout(this.startTimeout);
    this.props.end();
  }

  render() {
    const { started, progress } = this.props;
    return (
      <VelocityComponent animation={{ opacity: started ? 1 : 0 }} duration={400}>
        <div>
          <VelocityComponent animation={{ width: `${progress}%` }} duration={400}>
            <div className={styles.line} />
          </VelocityComponent>
        </div>
      </VelocityComponent>
    );
  }
}

PageLoadProgressBar.propTypes = {
  progress: PropTypes.number.isRequired,
  started: PropTypes.bool.isRequired,
  start: PropTypes.func.isRequired,
  end: PropTypes.func.isRequired,
  bindApi: PropTypes.func.isRequired,
};

export default connect(state => ({
  started: state.routerTransition.start,
  progress: state.routerTransition.progress,
}), TransitionActions)(PageLoadProgressBar);
