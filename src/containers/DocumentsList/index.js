import React, { PropTypes } from 'react';
import Helmet from 'react-helmet';
import { connect } from 'react-redux';
import styles from './index.css';
import { Link } from 'react-router';
import documentsSaga from '../../redux/modules/documents/sagas';
import shallowCompare from 'react-addons-shallow-compare';

const mapStateToProps = state => ({
  documents: state.documents.documents,
});

class DocumentsList extends React.Component {
  static propTypes = {
    documents: PropTypes.object.isRequired,
  };

  static contextTypes = {
    instanceStore: PropTypes.object.isRequired,
    fullApiPath: PropTypes.string.isRequired,
  };

  componentWillMount() {
    const { instanceStore } = this.context;
    const { documents } = this.props;

    if (!documents.value && !documents.error) {
      // Run our sagas
      instanceStore.runSaga('documents/index', documentsSaga, { apiPath: this.context.fullApiPath });
    }
  }

  shouldComponentUpdate(nextProps, nextState) {
    return shallowCompare(this, nextProps, nextState);
  }

  render() {
    const { documents } = this.props;

    return (
      <div className={styles.w}>
        <Helmet title="Документы" />
        <div className={styles.logo}/>
        <Link to="addDocument">Добавить документ</Link>
        { documents.loading && <p>Загружаю...</p> }
        { documents.error && <p>Внутренняя ошибка приложения</p> }
        { documents.value &&
          <table className="pure-table">
            <caption className={styles.caption}>Документы</caption>
            <thead>
              <tr>
                <th>Дата</th>
                <th>Наименование</th>
              </tr>
            </thead>
            <tbody>
              {[...documents.value].map(document => {
                return (
                  <tr key={document[0]}>
                    <td>{document[1].get('docDate').split('-').reverse().join('.')}</td>
                    <td>
                      <Link to="documentInfo">{document[1].get('displayName')}</Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        }
      </div>
    );
  }
}

export default connect(mapStateToProps)(DocumentsList);
