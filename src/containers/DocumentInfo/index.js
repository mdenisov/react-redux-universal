import React from 'react';
import Helmet from 'react-helmet';
import styles from './index.css';
import { Link } from 'react-router';

const DocumentInfo = () => (
  <div className={styles.w}>
    <Helmet title="Детальная информация по документу" />
    <div className={styles.logo} />
    <table className="pure-table">
      <caption className={styles.caption}>Документ</caption>
      <thead>
        <tr>
          <th>Дата</th>
          <th>Название</th>
          <th>Категория</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>25.04.2005</td>
          <td>Кредитный договор (ипотечное кредитование - земельный участок с поручителями)</td>
          <td>Кредитные договора</td>
        </tr>
      </tbody>
    </table>
    <br />
    <Link to="/">Назад</Link>
  </div>
);

export default DocumentInfo;
