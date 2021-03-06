/*
  I'm going to defend myself here and say that I was trying to create a clean
  way to handle errors but the child-process-async module doesn't throw errors in the promise.
  For once, the bad code isn't entirely my fault, alright?
*/

const { exec } = require('child-process-async');

const execWrap = async (command) => {
  const retVal = null;
  const execCommand = exec(command).then((result) => {
    return result;
  })
  .catch((err) => {
    return null;
  });


  return execCommand.then(function(result) {
    return result;
  })
  .catch((err) => {
    return null;
  });
}

module.exports.execWrap = execWrap;
