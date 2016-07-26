// eslint-disable-next-line
export const regNameDocument = `[А-Я]+[_\\s\(\)№"'0-9А-ЯЁа-яё]*`;

const validate = (values) => {
  const errors = {};
  if (!values.nameDocument) {
    errors.nameDocument = 'Необходимо заполнить';
  } else if (!(new RegExp(`^${regNameDocument}$`)).test(values.nameDocument)) {
    errors.nameDocument = 'Указано неверно';
  }
  return errors;
};

export default validate;
