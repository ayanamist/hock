mook [![Build Status](https://secure.travis-ci.org/ayanamist/mook.png)](http://travis-ci.org/fengmk2/mm) [![Coverage Status](https://coveralls.io/repos/ayanamist/mook/badge.png)](https://coveralls.io/r/ayanamist/mook)
====

A utility to hook methods/properties and return anything you want.

## Install

```bash
$ npm install mook
```

## Usage

### Hook `Date.now()`

```js
var mook = require('mook');

mook.hook(Date, 'now', function() {
  return 100000;
});

console.log(Date.now());
// output: 100000

mook.unhook(Date, 'now');

console.log(Date.now());
// normal unix epoch output: 1383481956310
 ```

## License

(The MIT License)

Copyright (c) 2012 - 2013 Ayanamist Yang &lt;contact@ayanamist.com&gt;

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
'Software'), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.