import statuses from 'statuses';

const formsHandlers = {};
const addFormHandler = (arg) => {
  if (!arg.formName) {
    throw new Error('FormName isn\'t valid');
  }
  if (!arg.handler) {
    throw new Error('Handler form isn\'t valid');
  }
  if (!arg.method) {
    throw new Error('Method form isn\'t valid');
  }
  if (!arg.validate) {
    throw new Error('Validate form isn\'t valid');
  }
  formsHandlers[arg.formName] = arg;
};

const checkPathMatch = (url, path) => {
  if (url) {
    if (url instanceof RegExp) {
      return url.test(path);
    }
    return url === path;
  }
  return false;
};

const processingRequest = function* processingRequest(middlProps) {
  const requestFromFetchAPI = !this.request.headers.accept ||
    this.request.headers.accept.indexOf('text/html') === -1;
  const { next } = middlProps;
  const thisMiddlProps = middlProps;
  thisMiddlProps.componentProps = middlProps.componentProps;
  let needRenderPage = true;
  let formData;
  if (this.request.method.toLowerCase() === 'get') {
    formData = this.request.query;
  } else {
    formData = this.request.body;
  }
  const transferHeaderIsForm = this.request.headers['content-type'] &&
    this.request.headers['content-type'].indexOf('application/x-www-form-urlencoded') !== -1;

  const forms = Object.keys(formsHandlers);
  for (let i = 0; i < forms.length; i++) {
    const formName = forms[i];
    const propValidate = formsHandlers[formName];
    // Check transfer form
    if (formData[formName] !== undefined &&
      this.request.method.toLowerCase() === propValidate.method.toLowerCase() &&
      (transferHeaderIsForm || checkPathMatch(propValidate.url, this.request.path))) {
      // collect values form fields
      thisMiddlProps.componentProps.initialValues = {};
      Object.keys(formData).forEach((param) => {
        thisMiddlProps.componentProps.initialValues[param] = formData[param];
      });
      thisMiddlProps.requestFromFetchAPI = requestFromFetchAPI;
      const formErrors = propValidate.validate(formData);
      // Errors are found
      if (Object.keys(formErrors).length) {
        if (formsHandlers[formName].manualResponse) {
          thisMiddlProps.componentProps.serverErrors = formErrors;
          // Call registered Form handler
          yield formsHandlers[formName].handler.call(this, thisMiddlProps);
          needRenderPage = false;
        } else {
          // FetchAPI request. Return HTTP code 450
          if (requestFromFetchAPI) {
            statuses[450] = 'Error form data';
            this.throw('Ошибки в данных формы', 450);
          } else {
            // JS off by client or JS errors (maybe old browser).
            thisMiddlProps.componentProps.serverErrors = formErrors;
          }
        }
      } else {
        // Call registered Form handler
        yield formsHandlers[formName].handler.call(this, thisMiddlProps);
        needRenderPage = false;
      }
      break;
    }
  }
  if (needRenderPage) {
    yield next.call(this, thisMiddlProps);
  }
};

export default {
  addFormHandler,
  processingRequest,
};
