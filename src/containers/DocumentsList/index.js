import React, { PropTypes } from 'react';
import Helmet from 'react-helmet';
import { connect } from 'react-redux';
import styles from './index.css';
import { Link } from 'react-router';
import * as fromDocuments from '../../redux/modules/reducer';
import compose from 'recompose/compose';
import getContext from 'recompose/getContext';
import lifecycle from 'recompose/lifecycle';
// import createListeningSagas from '../../helpers/createListeningSagas';
import { startLoadDocuments, errorLoadDocuments, finishLoadDocuments }
  from '../../redux/modules/documents/index';

const DocumentsList = ({ documents, isLoading, error }) => (
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
          {documents.map((document, index) => (
            <tr key={index}>
              <td>
                {document.docDate.split('-').reverse().
                join('.')}
              </td>
              <td>
                <Link to="documentInfo">{document.displayName}</Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    }
  </div>
);

DocumentsList.propTypes = {
  documents: PropTypes.array,
  isLoading: PropTypes.bool.isRequired,
  error: PropTypes.string,
};

export default compose(
  connect((state) => ({
    documents: fromDocuments.getDocuments(state),
    isLoading: fromDocuments.isLoading(state),
    error: fromDocuments.getError(state),
  })),
  getContext({
    instanceStore: PropTypes.object,
    fullApiPath: PropTypes.string,
  }),
  // createListeningSagas('documents/TEST_ACTION'),
  lifecycle({
    componentWillMount() {
      const { documents, error, instanceStore, fullApiPath,
      /* subscribeListeningSagas*/ } = this.props;

      /* subscribeListeningSagas('documents/TEST_ACTION', (params) => {
        console.log(params);
      });

      setTimeout(() => {
        instanceStore.store.dispatch({
          type: 'documents/TEST_ACTION',
          payload: 'test',
        });
      }, 5000);*/

      if (!documents && !error) {
        // Run our sagas
        instanceStore.fetchData({
          startAction: startLoadDocuments,
          errorAction: errorLoadDocuments,
          finishAction: finishLoadDocuments,
          url: `${fullApiPath}/getDocuments`,
        });
      }
    },
  })
)(DocumentsList);
