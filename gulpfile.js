/**
 * Gulp Tasks
 *
 * @package     gulpTest
 * @author      HK Chen
 * @copyright   Copyright (c) HK Chen (http://hkchen.github.io)
 * @link        https://github.com/hkchen/gulpTest
 */

var gulp = require('gulp');
var $ = require('gulp-load-plugins')();
var autoprefixer = require('autoprefixer');
var mainBowerFiles = require('main-bower-files');
var browserSync = require('browser-sync').create();
var minimist = require('minimist');

var envOptions = {
    string: 'env',
    default: { env: 'develop'}
}
var options = minimist(process.argv.slice(2), envOptions)
console.log(options)

/**
 * Remove Temp & Public Folder
 */
gulp.task('clean', function () {
    return gulp.src(['./temp', './public'], { read: false })
        .pipe($.clean());
});

/**
 * Copy Files & Folders
 */
gulp.task('copyHTML', function() {
    return gulp.src('./source/**/*.html')
        .pipe(gulp.dest('./public/'))
})

gulp.task('jade', function() {
    gulp.src('./source/**/*.jade')
        .pipe($.plumber())
        .pipe($.jade({
            pretty: true
        }))
        .pipe(gulp.dest('./public/'))
        .pipe(browserSync.stream())
});

gulp.task('sass', function() {
    var plugins = [
        autoprefixer({ browsers: ['last 2 version'] })
    ];

    return gulp.src('./source/scss/**/*.scss')
        .pipe($.plumber())
        .pipe($.sourcemaps.init())
        .pipe($.sass().on('error', $.sass.logError))
        .pipe($.postcss(plugins))
        .pipe($.if(options.env === 'production', $.cleanCss()))
        .pipe($.sourcemaps.write('.'))
        .pipe(gulp.dest('./public/css'))
        .pipe(browserSync.stream())
});

gulp.task('babel', () => {
    return gulp.src('./source/js/**/*.js')
        .pipe($.plumber())
        .pipe($.sourcemaps.init())
        .pipe($.babel({
            presets: ['env']
        }))
        .pipe($.concat('all.js'))
        .pipe($.if(options.env === 'production',$.uglify({
            //  Remove console log
            compress: {
                drop_console: true
            }
        })))
        .pipe($.sourcemaps.write('.'))
        .pipe(gulp.dest('./public/js'))
        .pipe(browserSync.stream())
});

/**
 * Manage Frontend Tool
 */
gulp.task('bower', function () {
    return gulp.src(mainBowerFiles({
        "overrides": {
            "vue": {
                "main": "dist/vue.js"
            }
        }
    }))
        .pipe(gulp.dest('./temp/vendors'));
        cb(err);
});

gulp.task('vendorJs', ['bower'], function() {
    return gulp.src('./temp/vendors/**/**.js')
        .pipe($.concat('venders.js'))
        .pipe($.if(options.env === 'production',$.uglify()))
        .pipe(gulp.dest('./public/js'))
});

/**
 * Static Server
 */
gulp.task('browser-sync', function() {
    browserSync.init({
        server: {
            baseDir: "./public"
        }
    });
});

/**
 * Compress Image
 */
gulp.task('image-min', () =>
    gulp.src('./source/images/*')
        .pipe($.if(options.env === 'production',$.imagemin()))
        .pipe(gulp.dest('./public/images'))
);

/**
 * Watching Files
 */
gulp.task('watch', function () {
    gulp.watch('./source/scss/**/*.scss', ['sass']);
    gulp.watch('./source/**/*.jade', ['jade']);
    gulp.watch('./source/js/**/*.js', ['babel']);
});

/**
 * Deploy Github Page
 */
gulp.task('deploy', function () {
    return gulp.src('./public/**/*')
        .pipe($.ghPages());
});

/**
 * Build Production Task
 */
gulp.task('build', $.sequence('clean', 'jade', 'sass', 'babel', 'vendorJs', 'image-min'))

/**
 * Develop Task
 */
gulp.task('default', ['jade', 'sass', 'babel', 'vendorJs', 'browser-sync', 'watch']);