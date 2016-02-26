export const loggerDateTime = (now = new Date()) => {
  return `[${now.getFullYear()}-${(`0${(now.getMonth() + 1)}`).slice(-2)}-${(`0${now.getDate()}`).slice(-2)}` +
    ` ${(`0${now.getHours()}`).slice(-2)}:${(`0${now.getMinutes()}`).slice(-2)}:${(`0${now.getSeconds()}`).slice(-2)}]`;
};

export const loggerWithoutDate = (...msgs) => {
  const formattedMsgs = msgs.reduce((prev, msg, index) => {
    prev.push(msg);
    if ((msgs.length - 1) !== index) {
      prev.push(`\n`);
    }
    return prev;
  }, []);
  global.console.log(...formattedMsgs, `\n`, `\n`);
};

/**
 * Output in server console input parameters with symbol end lines and output current datetime.
 * @param msgs Any parameters all types supports in global.console.log
 */
export const logger = (...msgs) => {
  global.console.log(loggerDateTime());
  loggerWithoutDate(...msgs);
};
