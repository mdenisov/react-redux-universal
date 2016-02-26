import React from 'react';
import Helmet from 'react-helmet';
import { connect } from 'react-redux';
import * as PageActions from '../../redux/modules/documents/index';
import styles from './index.css';
import { Link } from 'react-router';

const mapStateToProps = (state) => ({
  documents: state.documents.documents,
});

class DocumentsList extends React.Component {
  static propTypes = {
    documents: React.PropTypes.object,
  };

  static fetchData = [
    PageActions.init,
  ];

  render() {
    const { documents } = this.props;

    return (
      <div className={styles.w}>
        <Helmet title="Документы" />
        <div className={styles.logo}/>
        <Link to="addDocument">Добавить документ</Link>
        { !documents.size ? <p>Загружаю...</p> :
          <table className="pure-table">
            <caption className={styles.caption}>Документы</caption>
            <thead>
              <tr>
                <th>Дата</th>
                <th>Наименование</th>
              </tr>
            </thead>
            <tbody>
              {[...documents].map(document => {
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
