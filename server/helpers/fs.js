import fs from 'fs';

/**
 * Read File
 * @param path
 * @returns {Promise|function(): Promise}
 */
export const readFilePromise = path => {
  return new Promise((resolve, reject) => {
    fs.readFile(path, { encoding: 'utf8' }, (err, data) => {
      if (err) {
        reject(err);
      } else {
        resolve(data);
      }
    });
  });
};

/**
 * Write File
 * @param path
 * @returns {Promise|function(): Promise}
 */
export const writeFilePromise = (path, data) => {
  return new Promise((resolve, reject) => {
    fs.writeFile(path, data, { encoding: 'utf8' }, err => {
      if (err) {
        reject(err);
      }
      resolve();
    });
  });
};
