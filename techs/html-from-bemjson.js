/**
 * html-from-bemjson
 * =================
 *
 * Собирает *html*-файл с помощью *bemjson* и *bemhtml*.
 *
 * **Опции**
 *
 * * *String* **bemhtmlTarget** — Исходный BEMHTML-файл. По умолчанию — `?.bemhtml.js`.
 * * *String* **bemjsonTarget** — Исходный BEMJSON-файл. По умолчанию — `?.bemjson.js`.
 * * *String* **destTarget** — Результирующий HTML-файл. По умолчанию — `?.html`.
 *
 * **Пример**
 *
 * ```javascript
 * nodeConfig.addTech(require('enb/techs/html-from-bemjson'));
 * ```
 */
var requireOrEval = require('../lib/fs/require-or-eval');
var asyncRequire = require('../lib/fs/async-require');

module.exports = require('../lib/build-flow').create()
    .name('html-from-bemjson')
    .target('destTarget', '?.html')
    .useSourceFilename('bemhtmlTarget', '?.bemhtml.js')
    .useSourceFilename('bemjsonTarget', '?.bemjson.js')
    .builder(function (bemhtmlFilename, bemjsonFilename) {
        return requireOrEval(bemjsonFilename).then(function (json) {
            return asyncRequire(bemhtmlFilename).then(function(bemhtml) {
                return bemhtml.BEMHTML.apply(json);
            });
        });
    })
    .createTech();
