/* eslint-disable no-return-assign  */
import React from 'react';
import styles from './index.css';
import { Link } from 'react-router';
import { reduxForm } from 'redux-form';
import Helmet from 'react-helmet';
import { cleanDocuments } from '../DocumentsList/modules/documents';
import compose from 'recompose/compose';
import getContext from 'recompose/getContext';
import { schema, validate, fields } from './validate';

class AddDocument extends React.Component {
  componentDidMount() {
    this.myForm.setAttribute('novalidate', 'novalidate');
  }

  formSubmit = (values) =>
    new Promise(async (resolve, reject) => {
      let data = '';
      Object.keys(values).forEach(name => {
        data += `&${name}=${encodeURIComponent(values[name])}`;
      });
      data = `AddDocument=true${data}`;
      const url = this.myForm.getAttribute('action');
      const response = await fetch(url, {
        method: this.myForm.getAttribute('method'),
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: data,
      });
      if (response.status !== 200) {
        reject({ _error: 'Внутренняя ошибка сервера' });
      }
      this.props.cleanDocuments();
      resolve(this.props.router.push('/'));
    });

  render() {
    const { fields: { nameDocument }, handleSubmit, submitting,
      error, serverErrors, location } = this.props;

    return (
      <div className={styles.w}>
        <Helmet title="Добавление документа" />
        <div className={styles.logo} />
        <form
          ref={(ref) => this.myForm = ref}
          className="pure-form pure-form-stacked"
          method="POST"
          action={`${location.basename}${location.pathname}`}
          onSubmit={handleSubmit(this.formSubmit)}
        >
          <fieldset>
            <input
              id="nameDocument"
              name="nameDocument"
              type="text"
              placeholder="Наименование документа"
              required={schema.nameDocument.required}
              pattern={schema.nameDocument.regExp}
              {...nameDocument}
            />
            {nameDocument.touched && nameDocument.error &&
              <div className={styles.error}>{nameDocument.error}</div>
            }
            {!nameDocument.touched && serverErrors.nameDocument &&
              <div className={styles.error}>{serverErrors.nameDocument}</div>
            }
            <br />
            {error && <div className={styles.error}>{error}</div>}
            <button
              disabled={submitting}
              type="submit"
              name="AddDocument"
              className="pure-button pure-button-primary"
              onClick={handleSubmit(this.formSubmit)}
            >
              Добавить
            </button>
          </fieldset>
        </form>
        <br />
        <Link to="/">Назад</Link>
      </div>
    );
  }
}

AddDocument.propTypes = {
  fields: React.PropTypes.object.isRequired,
  handleSubmit: React.PropTypes.func.isRequired,
  error: React.PropTypes.string,
  submitting: React.PropTypes.bool.isRequired,
  serverErrors: React.PropTypes.object,
  cleanDocuments: React.PropTypes.func,
  router: React.PropTypes.object.isRequired,
  location: React.PropTypes.object.isRequired,
};

AddDocument.defaultProps = {
  serverErrors: {},
};

export default compose(
  reduxForm({
    form: 'AddDocument',
    fields,
    validate,
  }, null, {
    cleanDocuments,
  }),
  getContext({
    router: React.PropTypes.object,
    location: React.PropTypes.object,
  })
)(AddDocument);
