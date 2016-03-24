import React from 'react';
import styles from './index.css';
import { Link } from 'react-router';
import { reduxForm } from 'redux-form';
import Helmet from 'react-helmet';
import { cleanDocuments } from '../../redux/modules/documents';
import { bindActionCreators } from 'redux';
import buildSchema from 'redux-form-schema';

const schema = {
  'nameDocument': {
    required: true,
    validate: {
      validNameDocument: (formValues, fieldValue) => {
        return new RegExp(`^${schema.nameDocument.regExp}$`).test(fieldValue);
      },
    },
    regExp: `[А-Я]+[_\\s\(\)№""''0-9А-ЯЁа-яё]*`,
    error: 'Наименование документа указано неверно',
  },
};

const { fields, validate } = buildSchema(schema);

class AddDocument extends React.Component {
  static propTypes = {
    fields: React.PropTypes.object.isRequired,
    handleSubmit: React.PropTypes.func.isRequired,
    error: React.PropTypes.string,
    submitting: React.PropTypes.bool.isRequired,
    serverErrors: React.PropTypes.object,
    cleanDocuments: React.PropTypes.func,
  };

  static contextTypes = {
    router: React.PropTypes.object.isRequired,
    location: React.PropTypes.object.isRequired,
  };

  static defaultProps = {
    serverErrors: {},
  };

  componentDidMount() {
    this.refs.form.setAttribute('novalidate', 'novalidate');
  }

  static formValidate = {
    name: 'AddDocument',
    method: 'POST',
    validate,
  };

  formSubmit = (values) => {
    return new Promise(async (resolve, reject) => {
      const form = this.refs.form;
      let data = '';
      for (const name in values) {
        if (values.hasOwnProperty(name)) {
          data += `&${name}=${encodeURIComponent(values[name])}`;
        }
      }
      data = `${AddDocument.formValidate.name}=true${data}`;
      const url = form.getAttribute('action');
      const response = await fetch(url, {
        method: form.getAttribute('method'),
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: data,
      });
      if (response.status !== 200) {
        return reject({ _error: 'Внутренняя ошибка сервера' });
      }
      this.props.cleanDocuments();
      resolve(this.context.router.push('/'));
    });
  };

  render() {
    const { fields: { nameDocument }, handleSubmit, submitting, error, serverErrors } = this.props;
    const { location } = this.context;

    return (
      <div className={styles.w}>
        <Helmet title="Добавление документа"/>
        <div className={styles.logo}/>
        <form ref="form" className="pure-form pure-form-stacked" method="POST" action={`${location.basename}${location.pathname}`} onSubmit={handleSubmit(this.formSubmit)}>
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
            <br/>
            {error && <div className={styles.error}>{error}</div>}
            <button disabled={submitting} type="submit" name={AddDocument.formValidate.name} className="pure-button pure-button-primary" onClick={handleSubmit(this.formSubmit)}>Добавить</button>
          </fieldset>
        </form>
        <br/>
        <Link to="/">Назад</Link>
      </div>
    );
  }
}

export default reduxForm({
  form: AddDocument.formValidate.name,
  fields,
  validate,
}, null, (dispatch) => {
  return bindActionCreators({ cleanDocuments }, dispatch);
})(AddDocument);
