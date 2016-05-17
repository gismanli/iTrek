'use strict'

module.exports = function (gulp, PLUGIN, CONF) {

    var cssmin = PLUGIN.cssmin;
    var rename = PLUGIN.rename;
    var less = PLUGIN.less;

    gulp.task('css', function () {
        gulp.src([CONF.src + '/style/iTrek.less'])
            .pipe(less())
            .pipe(gulp.dest(CONF.demo + '/css'))
            .pipe(gulp.dest(CONF.build))
            .pipe(cssmin())
            .pipe(rename({
                suffix: '.min'
            }))
            .pipe(gulp.dest(CONF.build));
    });
}