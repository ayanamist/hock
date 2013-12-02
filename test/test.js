/* vim: set expandtab tabstop=2 shiftwidth=2 foldmethod=marker: */
/**
 * @fileOverview
 */

'use strict';

var assert = require('assert');

var mook = require('../');

describe('util.hook', function () {
  describe('basic', function () {
    it('should throw Error when hidden property is used', function () {
      var val = {
        'a': 2
      };
      Object.defineProperty(val, '__hookMethods__', {
        'value': 1,
        'configurable': true
      });
      assert.throws(function () {
        assert.strictEqual(mook.hook(val, 'a',function () {
          return 3;
        }), 1);
        assert.strictEqual(val.a, 3);
        assert.strictEqual(mook.unhook(val, 'a'), 0);
        assert.strictEqual(val.a, 2);
      }, /has been used/);
    });

    it('should throw Error when non-configurable property can not be set', function () {
      var val = {
      };
      Object.defineProperty(val, 'a', {
        'value': 1,
        'writable': false,
        'configurable': false
      });
      assert.throws(function () {
        assert.strictEqual(mook.hook(val, 'a',function () {
          return 3;
        }), 1);
        assert.strictEqual(val.a, 3);
        assert.strictEqual(mook.unhook(val, 'a'), 0);
        assert.strictEqual(val.a, 1);
      }, /Cannot redefine property/);
    });

    it('should always return zero when unhook is used on a not hooked method', function () {
      var val = {
        'a': 2
      };
      assert.strictEqual(mook.unhook(val, 'a'), 0);
    });

  });

  describe('own property', function () {
    it('should hook static method', function () {
      assert.strictEqual(mook.hook(Math, 'abs',function (val, fn) {
        return [val, fn(val)];
      }), 1);
      assert.deepEqual(Math.abs(-3), [-3, 3]);
      assert.strictEqual(mook.unhook(Math, 'abs'), 0);
      assert.strictEqual(Math.abs(-3), 3);
    });

    it('should hook instance method', function () {
      var O = function() {
        this.x = 2;
        this.y = 3;
      };
      O.prototype.sum = function() {
        return this.x + this.y;
      };
      var o = new O();
      assert.strictEqual(o.sum(), 5);
      assert.strictEqual(mook.hook(o, 'sum', function () {
        return this.x * this.y;
      }), 1);
      assert.strictEqual(o.sum(), 6);
      assert.strictEqual(mook.unhook(o, 'sum'), 0);
      assert.strictEqual(o.sum(), 5);
    });

    it('should work fine after multiple times for static method', function () {
      assert.strictEqual(mook.hook(Math, 'abs',function (val, fn) {
        return [val, fn(val)];
      }), 1);
      assert.strictEqual(mook.hook(Math, 'abs',function (val, fn) {
        return fn(val).map(function (v) {
          return v + 1;
        });
      }), 2);
      assert.deepEqual(Math.abs(-3), [-2, 4]);
      assert.strictEqual(mook.unhook(Math, 'abs'), 1);
      assert.deepEqual(Math.abs(-3), [-3, 3]);
      assert.strictEqual(mook.unhook(Math, 'abs'), 0);
      assert.strictEqual(Math.abs(-3), 3);
    });

    it('should work fine after multiple times for instance method', function () {
      var O = function() {
        this.x = 2;
        this.y = 3;
      };
      O.prototype.sum = function() {
        return this.x + this.y;
      };
      var o = new O();
      assert.strictEqual(o.sum(), 5);
      assert.strictEqual(mook.hook(o, 'sum', function () {
        return this.x * this.y;
      }), 1);
      assert.strictEqual(o.sum(), 6);
      assert.strictEqual(mook.hook(o, 'sum', function () {
        return this.x * 2 + this.y * 2;
      }), 2);
      assert.strictEqual(o.sum(), 10);
      assert.strictEqual(mook.unhook(o, 'sum'), 1);
      assert.strictEqual(o.sum(), 6);
      assert.strictEqual(mook.unhook(o, 'sum'), 0);
      assert.strictEqual(o.sum(), 5);
    });

    it('should works well with normal property', function () {
      var val = {
        'num': 3
      };
      assert.strictEqual(mook.hook(val, 'num',function (orig) {
        return orig * 2;
      }), 1);
      assert.strictEqual(val.num, 6);
      assert.strictEqual(mook.unhook(val, 'num'), 0);
      assert.strictEqual(val.num, 3);
    });

    it('should works well with normal property after multiple times', function () {
      var val = {
        'num': 3
      };
      assert.strictEqual(mook.hook(val, 'num',function (orig) {
        return orig * 2;
      }), 1);
      assert.strictEqual(mook.hook(val, 'num',function (val) {
        return val * val;
      }), 2);
      assert.strictEqual(val.num, 36);
      assert.strictEqual(mook.unhook(val, 'num'), 1);
      assert.strictEqual(val.num, 6);
      assert.strictEqual(mook.unhook(val, 'num'), 0);
      assert.strictEqual(val.num, 3);
    });

    it('should works well with existent getter', function () {
      var val = {
      };
      Object.defineProperty(val, 'a', {
        'get': function () {
          return 1;
        },
        'configurable': true
      });
      assert.strictEqual(mook.hook(val, 'a',function () {
        return 3;
      }), 1);
      assert.strictEqual(val.a, 3);
      assert.strictEqual(mook.unhook(val, 'a'), 0);
      assert.strictEqual(val.a, 1);
    });

    it('should works well with existent real getter', function () {
      var val = {
        'a': 1,
        'b': 2
      };
      Object.defineProperty(val, 'sum', {
        'get': function () {
          return this.a + this.b;
        },
        'configurable': true
      });
      assert.strictEqual(val.sum, 3);
      assert.strictEqual(mook.hook(val, 'sum',function (orig) {
        return orig * 2;
      }), 1);
      assert.strictEqual(val.sum, 6);
      val.a = 5;
      assert.strictEqual(val.sum, 14);
      assert.strictEqual(mook.unhook(val, 'sum'), 0);
      assert.strictEqual(val.sum, 7);
    });

    it('should works well with undefined property', function () {
      var val = {
      };
      assert.strictEqual(mook.hook(val, 'a',function () {
        return 3;
      }), 1);
      assert.strictEqual(val.a, 3);
      assert.strictEqual(mook.unhook(val, 'a'), 0);
      assert.strictEqual(val.a, undefined);
    });
  });

  describe('inherited property', function () {
    it('should works well with prototype function', function () {
      var O = function () {
        this.x = 3;
      };
      O.prototype.getX = function () {
        return this.x;
      };
      assert.strictEqual(mook.hook(O.prototype, 'getX', function () {
        return this.x * 2;
      }), 1);
      var o = new O();
      assert.strictEqual(o.getX(), 6);
      assert.strictEqual(mook.unhook(O.prototype, 'getX'), 0);
      assert.strictEqual(o.getX(), 3);
    });

    it('should works well with prototype assignment', function () {
      var O = function () {
        this.x = 3;
      };
      O.prototype = {
        'getX': function () {
          return this.x;
        }
      };
      assert.strictEqual(mook.hook(O.prototype, 'getX', function () {
        return this.x * 2;
      }), 1);
      var o = new O();
      assert.strictEqual(o.getX(), 6);
      assert.strictEqual(mook.unhook(O.prototype, 'getX'), 0);
      assert.strictEqual(o.getX(), 3);
    });

    it('should works well with inherited property', function () {
      var O = function(){};
      O.prototype.x = 1;
      var o = new O();
      assert.strictEqual(o.x, 1);
      assert.strictEqual(mook.hook(o, 'x', function() {
        return 2;
      }), 1);
      assert.strictEqual(o.x, 2);
      assert.strictEqual(mook.unhook(o, 'x'), 0);
      assert.strictEqual(o.x, 1);
    });

    it('should works well with prototype property', function () {
      var O = function(x){
        this.x = x;
      };
      O.prototype.getX = function () {
        return this.x;
      };
      var o = new O(1);
      assert.strictEqual(o.getX(), 1);
      assert.strictEqual(mook.hook(O.prototype, 'getX', function() {
        return this.x * 2;
      }), 1);
      assert.strictEqual(o.getX(), 2);
      assert.strictEqual(mook.unhook(O.prototype, 'getX'), 0);
      assert.strictEqual(o.getX(), 1);
    });

  });
});

describe('setTimeout', function () {
  before(function (done) {
    mook.hook(Date, 'now', function () {
      return 100000;
    });
    setTimeout(done, 0);
  });

  after(function (done) {
    mook.unhook(Date, 'now');
    done();
  });

  describe('case 1', function () {
    it('should', function (done) {
      setTimeout(done, 0);
    });
  });
});