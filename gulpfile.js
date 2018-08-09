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
        .pipe($.minifyCss())
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
        .pipe($.uglify({
            //  Remove console log
            compress: {
                drop_console: true
            }
        }))
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
        .pipe(gulp.dest('temp/vendors'));
        cb(err);
});

gulp.task('vendorJs', ['bower'], function() {
    return gulp.src('temp/vendors/**/**.js')
        .pipe($.concat('venders.js'))
        .pipe($.uglify())
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
 * Watching Files
 */
gulp.task('watch', function () {
    gulp.watch('./source/scss/**/*.scss', ['sass']);
    gulp.watch('./source/**/*.jade', ['jade']);
    gulp.watch('./source/js/**/*.js', ['babel']);
});

gulp.task('default', ['jade', 'sass', 'babel', 'vendorJs', 'browser-sync', 'watch']);