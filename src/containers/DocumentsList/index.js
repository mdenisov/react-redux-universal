import React, { PropTypes } from 'react';
import Helmet from 'react-helmet';
import { connect } from 'react-redux';
import styles from './index.css';
import { Link } from 'react-router';
import rootSaga from '../../redux/modules/documents/sagas';
import { loadDocuments } from '../../redux/modules/documents';
import { bindActionCreators } from 'redux';
import shallowCompare from 'react-addons-shallow-compare';

const mapStateToProps = state => ({
  documents: state.documents.documents,
});

const mapDispatchToProps = dispatch => ({
  loadDocuments: bindActionCreators(loadDocuments, dispatch),
});

class DocumentsList extends React.Component {
  static propTypes = {
    documents: PropTypes.object.isRequired,
    loadDocuments: PropTypes.func.isRequired,
  };

  static contextTypes = {
    instanceStore: PropTypes.object.isRequired,
    fullApiPath: PropTypes.string.isRequired,
  };

  componentWillMount() {
    const { instanceStore } = this.context;

    // Stop early running sagas
    instanceStore.stopSagas();
    // Run our sagas
    instanceStore.runSaga(rootSaga);

    this.props.loadDocuments({ apiPath: this.context.fullApiPath });
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

export default connect(mapStateToProps, mapDispatchToProps)(DocumentsList);
