'use strict'

module.exports = function (gulp, PLUGIN, CONF) {

    gulp.task('html', function () {
        gulp.src([CONF.src + '/*.html'])
            .pipe(gulp.dest(CONF.demo));
    });
}