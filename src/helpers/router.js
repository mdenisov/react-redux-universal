import { HttpError } from './customErrors';
import { createPath, addBasename, checkRelativePath } from './pathUtils';

const pushReplace = basename => {
  return path => {
    checkRelativePath(path);
    const newPath = addBasename(path, basename);
    throw new HttpError(302, createPath(newPath));
  };
};

export const extendRouter = (router, basename) => {
  if (typeof window === 'undefined') {
    router.push = pushReplace(basename);
    router.replace = pushReplace(basename);
  }
  return router;
};

export const createRouter = (history, basename) => {
  const serverSide = path => {
    checkRelativePath(path);
    const newPath = addBasename(path, basename);
    throw new HttpError(302, createPath(newPath));
  };
  return {
    push: path => {
      if (typeof window !== 'undefined') {
        history.push(path);
        return Promise.resolve();
      }
      serverSide(path);
    },
    replace: path => {
      if (typeof window !== 'undefined') {
        history.replace(path);
        return Promise.resolve();
      }
      serverSide(path);
    },
  };
};
