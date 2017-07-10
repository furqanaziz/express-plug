var fs = require('fs');
var path = require('path');
var callerId = require('caller-id');

var registered = {
  app: {},
  model: {},
  route: {},
  service: {},
  controller: {},
};

var add = function(_type, _name, _path) {
  if(!registered.hasOwnProperty(_type)) {
    throw Error('Invalid register type passed.');
  }
  if(!_name || !_path) {
    throw Error('Path and name cannont be empty.');
  }

  var caller = callerId.getData().filePath.split(path.sep).slice(0, -1).join(path.sep);
  var filepath = path.resolve(caller, _path);

  // TODO: Check if file does not exists and throw error
  return registered[_type][_name] = filepath;
};

var get = function(_type, _name, _default) {
  if(!registered.hasOwnProperty(_type)) {
    throw Error('Invalid register type passed.');
  }

  var mod = (_name ? registered[_type][_name] : registered[_type]) || _default || false;
  return fs.existsSync(mod + '.js') ? require(mod) : mod;
};

var remove = function(_type, _name) {
  if(!registered.hasOwnProperty(_type)) {
    throw Error('Invalid register type passed.');
  }
  if(!_name) {
    throw Error('Path and name cannont be empty.');
  }
  delete registered[_type][_name];
};

module.exports = {
  get: get,
  add: add,
  remove: remove,
};

//
// module.exports = omfg
//
// function omfg() {
//   var caller = getCaller()
//   console.log(caller.filename)
// }
//
// // private
//
// function getCaller() {
//   var stack = getStack()
//
//   // Remove superfluous function calls on stack
//   stack.shift() // getCaller --> getStack
//   stack.shift() // omfg --> getCaller
//
//   // Return caller's caller
//   return stack[1].receiver
// }
//
// function getStack() {
//   // Save original Error.prepareStackTrace
//   var origPrepareStackTrace = Error.prepareStackTrace
//
//   // Override with function that just returns `stack`
//   Error.prepareStackTrace = function (_, stack) {
//     return stack
//   }
//
//   // Create a new `Error`, which automatically gets `stack`
//   var err = new Error()
//
//   // Evaluate `err.stack`, which calls our new `Error.prepareStackTrace`
//   var stack = err.stack
//
//   // Restore original `Error.prepareStackTrace`
//   Error.prepareStackTrace = origPrepareStackTrace
//
//   // Remove superfluous function call on stack
//   stack.shift() // getStack --> Error
//
//   return stack
// }
// And a test that includes omfg module:
//
//   #!/usr/bin/env node
// // test.js
//
// var omfg = require("./omfg")
//
// omfg()

