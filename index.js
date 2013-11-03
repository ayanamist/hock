/* vim: set expandtab tabstop=2 shiftwidth=2 foldmethod=marker: */
/**
 * @fileOverview 提供一个方便的钩子，可以钩住任何对象的任何方法
 */

'use strict';

/** the name of a property hidden in other objects */
var HIDDEN_PROP_NAME = '__hookMethods__';


var isFunction = function (obj) {
  return Object.prototype.toString.call(obj) === "[object Function]";
};

/**
 * Hook some methods of a object
 * @param {Object} obj The object holds the method
 * @param {String} prop The name of the method need to be hooked
 * @param {Function} fn The function used to replace the original one, has
 *   the same signature plus the last argument points to the last one.
 * @returns {Number} The count of this being hooked
 */
exports.hook = function (obj, prop, fn) {
  // Avoid prototype inheritance
  var hookMethodsProp = Object.getOwnPropertyDescriptor(obj, HIDDEN_PROP_NAME);

  if (!hookMethodsProp) {
    hookMethodsProp = {
      'value': Object.create(null),
      'configurable': false,
      'writable': false,
      'enumerable': false
    };
    Object.defineProperty(obj, HIDDEN_PROP_NAME, hookMethodsProp);
  }
  else {
    if (hookMethodsProp['writable'] || hookMethodsProp['enumerable'] || hookMethodsProp['configurable']) {
      throw new Error('Property ' + HIDDEN_PROP_NAME + ' has been used');
    }
  }
  var origValues = hookMethodsProp['value'];
  if (!(origValues[prop])) {
    origValues[prop] = [];
  }

  // Reference default method
  var refProp = obj[prop];

  // Use closure in closure to keep obj[prop] untouched
  if (isFunction(refProp)) {
    obj[prop] = (function (refProp) {
      return function () {
        var args = Array.prototype.slice.call(arguments);

        // Our hook should take the same number of arguments
        // as the original method so we must fill with undefined
        // optional args not provided in the call
        while (args.length < refProp.length) {
          args.push(undefined);
        }

        // Last argument is always original method call
        args.push(refProp.bind(obj));

        return fn.apply(this, args);
      };
    })(refProp);
  }
  else {
    var protoObj = obj;
    while (!(protoObj.hasOwnProperty(prop)) && protoObj.prototype) {
      protoObj = protoObj.prototype;
    }
    var propDesc = Object.getOwnPropertyDescriptor(protoObj, prop);
    if (propDesc) {
      var getter = propDesc['get'];
      if (getter) {
        refProp = getter.bind(obj);
      }
    }
    else {
      propDesc = {
        'value': refProp,
        'configurable': true,
        'enumerable': true
      };
    }

    Object.defineProperty(obj, prop, {
      'get': (function (refProp) {
        return function () {
          if (isFunction(refProp)) {
            return fn(refProp());
          }
          else {
            return fn(refProp);
          }
        }
      })(refProp),
      'configurable': true,
      'enumerable': propDesc['enumerable']
    });

    refProp = propDesc;
  }

  var ref = {
    'inherited': !(obj.hasOwnProperty(prop)),
    'property': refProp,
  };
  origValues[prop].push(ref);

  return origValues[prop].length;
};

/**
 * @param {Object} obj The object holds the method
 * @param {String} prop The name of the method need to be hooked
 * @returns {Number} The count of this being hooked
 */
exports.unhook = function (obj, prop) {
  var origValues = obj[HIDDEN_PROP_NAME];

  if (!origValues || !origValues[prop]) {
    return 0;
  }

  delete obj[prop];

  var ref = origValues[prop].pop();

  if (!ref['inherited']) {
    var refProp = ref['property'];
    if (isFunction(refProp)) {
      obj[prop] = refProp;
    }
    else {
      Object.defineProperty(obj, prop, refProp);
    }
  }
  return origValues[prop].length;
};
