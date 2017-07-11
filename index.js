var fs = require('fs');
var path = require('path');
var callerId = require('caller-id');

var registered = {
  apps: {},
  modules: {},
};

var add = function(_name, _path) {
  if(!_name || !_path) {
    throw Error('Path and name cannont be empty.');
  }

  var caller = callerId.getData().filePath.split(path.sep).slice(0, -1).join(path.sep);
  var filepath = path.resolve(caller, _path);

  // TODO: Check if file does not exists and throw error
  return registered.modules[_name] = filepath;
};

var get = function(_name, _default) {
  var mod = (_name ? registered.modules[_name] : registered.modules) || _default || false;
  return fs.existsSync(mod) ? require(mod.replace('.js', '')) : mod;
};

var addApp = function(_name, _dirname, _routes) {
  if(!_name || !_dirname) {
    throw Error('Path and name cannont be empty.');
  }

  var caller = callerId.getData().filePath.split(path.sep).slice(0, -1).join(path.sep);
  var filepath = path.resolve(caller, _dirname);
  var routePath = path.resolve(caller, (_routes || ''));

  // TODO: Check if file does not exists and throw error
  return registered.apps[_name] = {
    'routes': _routes ? [routePath] : [],
    'dirname': filepath,
  };
};

var addRoutes = function(_name, _routes) {
  if(!_name || !_routes) {
    throw Error('Routes and name cannont be empty.');
  }

  if(!registered.apps[_name]) {
    throw Error('Invalid app name.');
  }

  var caller = callerId.getData().filePath.split(path.sep).slice(0, -1).join(path.sep);
  var routePath = path.resolve(caller, _routes);

  // TODO: Check if file does not exists and throw error
  return registered.apps[_name].routes.push(routePath);
};

var getApps = function(_name) {
  return (_name ? registered.apps[_name] : registered.apps);
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

var walk = function(dir, done) {
  var results = [];
  var list = fs.readdirSync(dir);
  var pending = list.length;
  if(!pending) {
    return done(null, results);
  }
  list.forEach(function(file) {
    file = path.resolve(dir, file);
    var stat = fs.statSync(file);

    if(stat && stat.isDirectory()) {
      walk(file, function(err, res) {
        results = results.concat(res);
        if(!--pending) {
          done(null, results);
        }
      });
    } else {
      if(file.indexOf('.js') > 0) {
        results.push(file);
      }
      if(!--pending) {
        done(null, results);
      }
    }
  });
};

var register = function(_name, _path) {
  walk(_path, function(err, results) {
    if(err) {
      throw err;
    }

    results.forEach(function(file) {
      var name = file.replace(_path, _name).replace('.js', '').replace(/\\/g, '/');
      add(name, file);
    });
  });
};

module.exports = {
  get: get,
  add: add,
  walk: walk,
  addApp: addApp,
  remove: remove,
  getApps: getApps,
  register: register,
  addRoutes: addRoutes,
};
