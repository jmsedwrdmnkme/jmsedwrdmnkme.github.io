'use strict';

const gulp = require('gulp');
const babel = require('gulp-babel');
const concat = require('gulp-concat');
const uglify = require('gulp-uglify');
const stylish = require('jshint-stylish');
const sass = require('gulp-sass');
const autoprefixer = require('gulp-autoprefixer');
const cleanCSS = require('gulp-clean-css');
const del = require('del');
const jshint = require('gulp-jshint');
const handlebars = require('gulp-compile-handlebars');
const ext = require('gulp-ext-replace');
const imagemin = require('gulp-imagemin');
const sasslint = require('gulp-sass-lint');
const browsersync = require('browser-sync').create();

const paths = {
    styles: {
        src: './src/scss/main.scss',
        dist: './dist/css/'
    },
    scripts: {
        src: './src/js/**/*.js',
        dist: './dist/js/',
        concat: [
            './node_modules/jquery/dist/jquery.slim.js',
            './node_modules/popper.js/dist/umd/popper.js',
            './node_modules/bootstrap/js/dist/util.js',
            './node_modules/bootstrap/js/dist/alert.js',
            './node_modules/bootstrap/js/dist/button.js',
            './node_modules/bootstrap/js/dist/carousel.js',
            './node_modules/bootstrap/js/dist/collapse.js',
            './node_modules/bootstrap/js/dist/dropdown.js',
            './node_modules/bootstrap/js/dist/index.js',
            './node_modules/bootstrap/js/dist/modal.js',
            './node_modules/bootstrap/js/dist/scrollspy.js',
            './node_modules/bootstrap/js/dist/tab.js',
            './node_modules/bootstrap/js/dist/toast.js',
            './node_modules/bootstrap/js/dist/tooltip.js',
            './node_modules/bootstrap/js/dist/popover.js',
            './src/js/**/*.js'
        ]
    },
    html: {
        src: './src/hbs/*.hbs',
        partials: './src/hbs/partials',
        dist: './dist/'
    },
    img: {
        src: './src/img/**/**/*',
        dist: './dist/img/'
    }
};

sass.compiler = require('node-sass');

// BrowserSync
function browserSync(done) {
    browsersync.init({
        server: {
            baseDir: "dist"
        },
        port: 3000
    });
    done();
}

function browserSyncReload(done) {
    browsersync.reload();
    done();
}

// Clean dist dir
function clean() {
    return del(paths.html.dist);
}

// Styles
function scss() {
    return gulp
        .src(paths.styles.src)
        .pipe(sasslint({'config': '.sass-lint.yml'}))
        .pipe(sasslint.format())
        .pipe(sasslint.failOnError())
        .pipe(sass({outputStyle: 'compressed'}))
        .pipe(autoprefixer({browsers: ['last 2 versions']}))
        .pipe(cleanCSS())
        .pipe(gulp.dest(paths.styles.dist))
        .pipe(browsersync.stream());
}

// JS
function jslint() {
    return gulp
        .src([paths.scripts.src, './gulpfile.js'])
        .pipe(jshint())
        .pipe(jshint.reporter(stylish));
}

function js() {
    return gulp
        .src(paths.scripts.concat)
        .pipe(babel())
        .pipe(uglify({
            mangle: true,
            compress: {
                sequences: true,
                dead_code: true,
                conditionals: true,
                booleans: true,
                unused: true,
                if_return: true,
                join_vars: true,
                drop_console: true
            }}
        ))
        .pipe(concat('main.js'))
        .pipe(gulp.dest(paths.scripts.dist))
        .pipe(browsersync.stream());
}

// Handlebars
function hbs() {
    return gulp
        .src(paths.html.src)
        .pipe(handlebars({}, {
          batch: paths.html.partials
        }))
        .pipe(ext('.html'))
        .pipe(gulp.dest(paths.html.dist))
        .pipe(browsersync.stream());
}

// Images
function img() {
  return gulp.src(paths.img.src)
    .pipe(
        imagemin([
            imagemin.gifsicle({ interlaced: true }),
            imagemin.jpegtran({ progressive: true }),
            imagemin.optipng({ optimizationLevel: 5 }),
            imagemin.svgo({
                plugins: [
                    {
                        removeViewBox: false,
                        collapseGroups: true
                    }
                ]
            })
        ])
    )
    .pipe(gulp.dest(paths.img.dist));
}

// Watch files
function watchFiles() {
    gulp.watch(paths.styles.src, scss);
    gulp.watch(paths.scripts.src, jslint, js);
    gulp.watch(paths.html.src, hbs);
    gulp.watch(paths.img.src, img);
}

// define complex tasks
const build = gulp.series(clean, gulp.parallel(scss, img, hbs, jslint, js));
const watch = gulp.parallel(watchFiles, browserSync);

// export tasks
exports.watch = watch;
exports.default = build;