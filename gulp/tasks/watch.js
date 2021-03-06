'use strict'

module.exports = function (gulp, PLUGIN, CONF) {
    gulp.task('watch', function () {
        gulp.watch([CONF.src + '/**/*.js', CONF.src + '/**/*.less', CONF.src + '/*.html'], ['js', 'css', 'html']);
    });
};