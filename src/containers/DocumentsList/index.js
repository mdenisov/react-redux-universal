import React, { PropTypes } from 'react';
import Helmet from 'react-helmet';
import { connect } from 'react-redux';
import styles from './index.css';
import { Link } from 'react-router';
import documentsSaga from './modules/documents/sagas';
import * as fromDocuments from './modules/reducer';

class DocumentsList extends React.Component {
  componentWillMount() {
    const { instanceStore } = this.context;
    const { documents, error } = this.props;

    if (!documents && !error) {
      // Run our sagas
      instanceStore.runSaga(documentsSaga, { apiPath: this.context.fullApiPath });
    }
  }

  render() {
    const { documents, isLoading, error } = this.props;

    return (
      <div className={styles.w}>
        <Helmet title="Документы" />
        <div className={styles.logo} />
        <Link to="addDocument">Добавить документ</Link>
        {isLoading && <p>Загружаю...</p>}
        {error && <p>Внутренняя ошибка приложения</p>}
        {documents &&
          <table className="pure-table">
            <caption className={styles.caption}>Документы</caption>
            <thead>
              <tr>
                <th>Дата</th>
                <th>Наименование</th>
              </tr>
            </thead>
            <tbody>
              {[...documents].map(document => (
                <tr key={document[0]}>
                  <td>
                    {document[1].get('docDate').split('-').reverse().
                    join('.')}
                  </td>
                  <td>
                    <Link to="documentInfo">{document[1].get('displayName')}</Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        }
      </div>
    );
  }
}

DocumentsList.propTypes = {
  documents: PropTypes.object,
  isLoading: PropTypes.bool.isRequired,
  error: PropTypes.string,
};

DocumentsList.contextTypes = {
  instanceStore: PropTypes.object.isRequired,
  fullApiPath: PropTypes.string.isRequired,
};

export default connect((state) => ({
  documents: fromDocuments.getDocuments(state),
  isLoading: fromDocuments.isLoading(state),
  error: fromDocuments.getError(state),
}))(DocumentsList);
