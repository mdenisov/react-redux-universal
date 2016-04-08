import { HttpError } from './customErrors';
import { createPath } from './pathUtils';

/**
 * Добавляет методы assign, reload и replace в переданный объект location
 * (на сервере методы возвращают Promise.reject с первым параметром - 302 и вторым параметром - новым URL;
 * на клиенте вызывают родные методы из объекта window.location)
 * Методы assign и replace принимают как строку в качестве параметра, так и объект с сигнатурой:
 * {path: <новый путь>, query: <объект параметров, преобразующийся в param1=valu1&param2=value2...}
 * @param  {Object} location объект
 * @return {Object} location расширенный объект location
 */
export const extendLocation = (() => {
  return location => {
    const newLocation = Object.assign({}, location);
    if (typeof window !== 'undefined') {
      newLocation.assign = path => {
        window.location.assign(createPath(path));
      };
      newLocation.reload = forceGet => {
        window.location.reload(forceGet);
      };
      newLocation.replace = path => {
        window.location.replace(createPath(path));
      };
    } else {
      newLocation.assign = path => {
        throw new HttpError(302, createPath(path));
      };
      newLocation.reload = () => {
        throw new HttpError(302, `${location.basename}${location.pathname}${location.search}${location.hash}`);
      };
      newLocation.replace = path => {
        throw new HttpError(302, createPath(path));
      };
    }
    return newLocation;
  };
})();
