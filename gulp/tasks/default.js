'use strict'

module.exports = function (gulp, PLUGIN, CONF) {
    gulp.task('default', ['clean', 'js', 'css', 'html']);
};