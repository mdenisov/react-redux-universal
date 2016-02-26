import statuses from 'koa/node_modules/statuses';

const formsHandlers = {};
const addFormHandler = (formName, handler) => {
  if (!formName) {
    throw new Error(`FormName isn't valid`);
  }
  if (!handler) {
    throw new Error(`Handler form isn't valid`);
  }
  formsHandlers[formName] = handler;
};

const processingRequest = function* (middlProps) {
  const requestFromFetchAPI = this.request.headers.accept.indexOf('/html') === -1 ? true : false;
  const { next, renderProps } = middlProps;
  const thisMiddlProps = middlProps;
  thisMiddlProps.componentProps = {};
  let needRenderPage = true;
  // if contentType === application/x-www-form-urlencoded
  if (this.request.headers['content-type'] && this.request.headers['content-type'].indexOf('application/x-www-form-urlencoded') !== -1) {
    // Find component form and formValidate static methods
    const formValidate = renderProps.components.reduce((prev, current) => {
      if (current) {
        const propValidate = current.WrappedComponent ? current.WrappedComponent.formValidate : current.formValidate;
        if (propValidate) {
          if (!propValidate.name) {
            throw new Error(`formValdate.name is empty: ${JSON.stringify(current)}`);
          }
          if (!propValidate.method) {
            throw new Error(`formValdate.method is empty: ${JSON.stringify(current)}`);
          }
          prev.push(propValidate);
        }
      }
      return prev;
    }, []);
    // Validate form data by methods formValidate
    for (let i = 0, l = formValidate.length; i < l; ++i) {
      const propValidate = formValidate[i];
      const formName = propValidate.name;
      if (this.request.body[formName] !== undefined && this.request.method.toLowerCase() === propValidate.method.toLowerCase()) {
        if (!formsHandlers[formName]) {
          throw new Error(`FormHandler for ${formName} isn't found`);
        }
        // collect values form fields
        thisMiddlProps.componentProps.initialValues = {};
        for (const param in this.request.body) {
          if (this.request.body.hasOwnProperty(param)) {
            thisMiddlProps.componentProps.initialValues[param] = this.request.body[param];
          }
        }
        thisMiddlProps.requestFromFetchAPI = requestFromFetchAPI;
        const formErrors = propValidate.validate(this.request.body);
        // Errors are found
        if (Object.keys(formErrors).length) {
          // FetchAPI request. Return HTTP code 450
          if (requestFromFetchAPI) {
            statuses[450] = 'Error form data';
            this.throw('Ошибки в данных формы', 450);
          } else {
            // JS off by client or JS errors (maybe old browser).
            thisMiddlProps.componentProps.serverErrors = formErrors;
          }
        } else {
          // Call registered Form handler
          yield formsHandlers[formName].call(this, thisMiddlProps);
          needRenderPage = false;
        }
        break;
      }
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
