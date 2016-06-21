import buildSchema from 'redux-form-schema';

export const schema = {
  nameDocument: {
    required: true,
    validate: {
      validNameDocument: (formValues, fieldValue) =>
        new RegExp(`^${schema.nameDocument.regExp}$`).test(fieldValue),
    },
    // eslint-disable-next-line
    regExp: `[А-Я]+[_\\s\(\)№""''0-9А-ЯЁа-яё]*`,
    error: 'Наименование документа указано неверно',
  },
};

export const { fields, validate } = buildSchema(schema);
