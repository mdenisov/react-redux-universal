/* eslint-disable no-param-reassign */
import http from 'http';
import url from 'url';
import { logger, loggerDateTime, loggerWithoutDate } from './logger';

/**
 * Build object for HTTP request
 * @param src
 * @param method
 * @param headers
 * @param port
 * @returns {{hostname: (*|string), port: number, path: *, method: *, headers: *}}
 */
function buildHTTPRequest({ src, method, headers, port = 80 }) {
  const srcParsed = url.parse(src);
  return {
    host: srcParsed.host,
    port,
    path: srcParsed.path,
    method,
    headers,
  };
}

/**
 * Output in server console formatted input parameters.
 * @param {object} params Input parameters.
 * @param {bool} cachedLog Cached log. Don't output immediately..
 */
const httpLog = (() => {
  let cachedHttpLog = [];
  return (params, cachedLog) => {
    let maskData;
    if (params.maskData) {
      maskData = params.maskData;
    }
    const maskingData = (data, mask) => {
      if (data !== undefined) {
        let _maskData = data;
        // JSON
        let reg = new RegExp(`${mask}":"([^"]*)"`);
        let matches = _maskData.match(reg);
        if (matches && matches[1]) {
          reg = new RegExp(`(${mask}":")[^"]*(")`);
          const tmpArr = new Array(matches[1].length);
          _maskData = _maskData.replace(reg, `$1${tmpArr.fill('*').join('')}$2`);
        }

        // XML
        reg = new RegExp(`<${mask}>([^<]+)</${mask}>`);
        matches = _maskData.match(reg);
        if (matches && matches[1]) {
          reg = new RegExp(`(<${mask}>)[^<]+(</${mask}>)`);
          const tmpArr = new Array(matches[1].length);
          _maskData = _maskData.replace(reg, `$1${tmpArr.fill('*').join('')}$2`);
        }

        return _maskData;
      }
      return null;
    };

    const keyDescriptions = {
      errorMessage: 'Error message',
      requestHeaders: 'Request headers',
      requestMethod: 'Request method',
      requestPayload: 'Request payload',
      requestURL: 'Request URL',
      responseHeaders: 'Response headers',
      responseBody: 'Response body',
      statusCode: 'Status code',
    };
    const paramsArr = [];
    Object.keys(params).forEach(key => {
      switch (key) {
        case 'maskData':
          break;
        case 'requestPayload':
          if (maskData && params[key] !== undefined && params[key] !== null) {
            // mask log data for "*"
            if (Array.isArray(maskData)) {
              params[key] = JSON.stringify(params[key]).replace(/\\"/g, '"');
              maskData.forEach(mask => {
                params[key] = maskingData(params[key], mask);
              });
            } else {
              switch (typeof maskData) {
                case 'Object':
                  params[key] = Object.assign(params[key], maskData);
                  break;
                case 'String':
                  params[key] = JSON.stringify(params[key]).replace(/\\"/g, '"');
                  params[key] = maskingData(params[key], maskData);
                  break;
                default:
                  throw new Error(`typeof maskData isn't defined: ${typeof maskData}`);
              }
            }
          }
          if (params[key] !== undefined && params[key] !== null) {
            paramsArr.push(`${keyDescriptions[key]}:`);
            paramsArr.push(params[key]);
          }
          break;
        case 'requestHeaders':
        case 'responseHeaders':
        case 'responseBody':
          if (params[key] !== undefined && params[key] !== null) {
            paramsArr.push(`${keyDescriptions[key]}:`);
            paramsArr.push(params[key]);
          }
          break;
        default:
          if (keyDescriptions[key] !== undefined) {
            paramsArr.push(`${keyDescriptions[key]}: ${params[key]}`);
          }
          break;
      }
    });
    if (cachedLog) {
      cachedHttpLog.push({ params: paramsArr, date: new Date() });
    } else {
      logger(paramsArr);
      if (cachedHttpLog) {
        cachedHttpLog.reverse().forEach((log, index, src) => {
          if (index === 0 || index === (src.length - 1)) {
            global.console.log(`\n`, loggerDateTime(log.date));
            loggerWithoutDate(log.params);
            if (index === 0 && src.length > 2) {
              global.console.log(`\n`, '.....', `\n`);
            }
          }
        });
        cachedHttpLog = [];
      }
    }
  };
})();

/**
 * HTTP Get
 * @param src URL to resource
 * @param headers
 * @returns {Promise|function(): Promise}
 */
 // eslint-disable-next-line
export const httpGetPromise = ({
  src,
  accept = 'application/json',
  headers = {},
  recursion,
  port,
}) =>
  new Promise((resolve, reject) => {
    let result = new Buffer('');
    const extHeaders = Object.assign(headers, {
      Accept: accept,
    });
    const req = http.request(buildHTTPRequest({
      src,
      method:
      'GET',
      headers: extHeaders,
      port,
    }), res => {
      res.on('data', data => {
        result = Buffer.concat([result, data]);
      });
      res.on('end', () => {
        if (res.statusCode === 202 && res.headers.refresh) { // Async request
          const refreshData = res.headers.refresh.split(';');
          setTimeout(() => {
            httpGetPromise({ src: refreshData[1], recursion: true }).then(() => {
              resolve();
            }).catch((err) => {
              httpLog(
                {
                  requestURL: src,
                  requestMethod: 'GET',
                  responseHeaders: res.headers,
                  requestHeaders: extHeaders,
                },
                recursion
              );
              reject(err);
            });
          }, parseInt(refreshData[0], 10) * 1000);
        } else if (res.statusCode > 300 && res.statusCode < 400 && res.headers.location) {
          const redirectURL = url.parse(res.headers.location);
          const srcURL = url.parse(src);
          if (redirectURL.hostname && redirectURL.hostname === srcURL.hostname) {
            httpGetPromise({ src: res.headers.location, recursion: true }).then(() => {
              resolve();
            }).catch((err) => {
              if (!recursion) {
                httpLog(
                  {
                    requestURL: src,
                    requestMethod: 'GET',
                    responseHeaders: res.headers,
                    requestHeaders: extHeaders,
                  },
                  recursion
                );
              }
              reject(err);
            });
          } else {
            httpLog(
              {
                requestURL: src,
                requestMethod: 'GET',
                statusCode: `${res.statusCode} ${res.statusMessage}`,
                responseHeaders: res.headers,
                requestHeaders: extHeaders,
              },
              recursion
            );
            reject({
              res,
              url: src,
            });
          }
        } else { // Otherwise no redirect; capture the response as normal
          if (res.statusCode !== 200) {
            if (result) {
              result = result.toString('utf8');
            }
            httpLog(
              {
                requestURL: src,
                requestMethod: 'GET',
                statusCode: `${res.statusCode} ${res.statusMessage}`,
                responseHeaders: res.headers,
                responseBody: result,
                requestHeaders: extHeaders,
              },
              recursion
            );
            reject({
              res,
              result,
              url: src,
            });
          }
          resolve(result.toString('utf8'));
        }
      });
    });
    req.end();
    req.on('error', ex => {
      httpLog(
        {
          requestURL: src,
          requestMethod: 'GET',
          errorMessage: ex.message,
          requestHeaders: extHeaders,
        },
        recursion
      );
      reject(ex);
    });
  });
