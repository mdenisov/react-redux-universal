import qs from 'qs';

const stringifyQuery = query =>
  qs.stringify(query, { arrayFormat: 'brackets' }).replace(/%20/g, '+');

export const createPath = path => {
  if (typeof path === 'object') {
    let queryString = '';
    if (path.query) {
      queryString = stringifyQuery(path.query);
    }
    if (queryString === '') {
      return path.pathname;
    }
    return `${path.pathname}${path.pathname.indexOf('?') !== -1 ? '&' : '?'}${queryString}`;
  }
  return path;
};

export const addBasename = (path, basename) => {
  let newPath = path;
  if (basename) {
    switch (typeof newPath) {
      case 'string':
        newPath = `${basename}${newPath}`;
        break;
      case 'object':
        newPath.pathname = `${basename}${newPath.pathname}`;
        break;
      default:
        throw new Error('Path is should have type string or object');
    }
  }
  return newPath;
};

export const checkRelativePath = path => {
  if (typeof path !== 'string') {
    return;
  }
  const match = path.match(/^https?:\/\/[^\/]*/);
  if (match) {
    throw new Error(
      'A path must be pathname + search + hash only, ' +
      `not a fully qualified URL like "${path}"`);
  }
};
