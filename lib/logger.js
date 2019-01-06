
const Logger  = {
  log(...args){
    return console.log(...args);
  },
  debug(...args){
    return console.log(...args);
  },
  error(...args){
    return console.error(...args);
  }
}

module.exports = Logger
