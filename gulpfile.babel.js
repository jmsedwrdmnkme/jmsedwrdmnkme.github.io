'use strict';

/*
 *  Packages
 */

const gulp = require('gulp');
const del = require('del');
const ico = require('gulp-to-ico');
const svgsprite = require('gulp-svg-sprite');
const imagemin = require('gulp-imagemin');
const jshint = require('gulp-jshint');
const stylish = require('jshint-stylish');
const cleanCSS = require('gulp-clean-css');
const sass = require('gulp-sass');
const autoprefixer = require('gulp-autoprefixer');
const sasslint = require('gulp-sass-lint');
const ext = require('gulp-ext-replace');
const babel = require('gulp-babel');
const uglify = require('gulp-uglify');
const concat = require('gulp-concat');
const mustache = require("gulp-mustache");
const browsersync = require('browser-sync').create();

/*
 *  Processes
 */

// Clean
function clean() {
  return del('./dist');
}

// Favicon
function favicon() {
  return gulp
    .src('./src/favicon/favicon.png', { allowEmpty: true })
    .pipe(ico('favicon.ico', { resize: true, sizes: [16, 24, 32, 64] }))
    .pipe(gulp.dest('./dist/'))
    .pipe(browsersync.stream());
}

// Sprite
function sprite() {
  return gulp
    .src('./src/sprite/**/**/*.svg', { allowEmpty: true })
    .pipe(
      svgsprite({
        shape: {
          spacing: {
            padding: 5
          }
        },
        mode: {
          symbol: true
        },
        svg: {
          xmlDeclaration: false,
          doctypeDeclaration: false,
          namespaceIDs: false,
          namespaceClassnames: false
        }
      })
    )
    .pipe(concat('sprite.mustache'))
    .pipe(gulp.dest('./src/mustache/partials/global/'))
    .pipe(browsersync.stream());
}

// Fonts
function fonts() {
  return gulp
    .src('./src/fonts/*.scss', { allowEmpty: true })
    .pipe(sass({outputStyle: 'compressed'}))
    .pipe(gulp.dest('./dist/css/'))
    .pipe(browsersync.stream());
}

// Images
function images() {
  return gulp
    .src('./src/img/**/**/*', { allowEmpty: true })
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
    .pipe(gulp.dest('./dist/img/'))
    .pipe(browsersync.stream());
}

// JS lint
function jslint() {
  return gulp
    .src([
      './src/js/*/js',
      './gulpfile.babel.js'
    ], { allowEmpty: true })
    .pipe(jshint())
    .pipe(jshint.reporter(stylish))
    .pipe(browsersync.stream());
}

// CSS lint
function csslint() {
  return gulp
    .src('./src/scss/*.scss', { allowEmpty: true })
    .pipe(sasslint({'config': '.sass-lint.yml'}))
    .pipe(sasslint.format())
    .pipe(sasslint.failOnError())
    .pipe(browsersync.stream());
}

// JS lazyload modules
function jslazyloadmodules() {
  return gulp
    .src([
      './node_modules/loadjs/dist/loadjs.min.js',
      './node_modules/fg-loadcss/dist/cssrelpreload.min.js'
    ], { allowEmpty: true })
    .pipe(ext('.mustache'))
    .pipe(gulp.dest('./src/mustache/partials/global/'))
    .pipe(browsersync.stream());
}

// CSS critical
function csscritical() {
  return gulp
    .src('./src/scss/critical.scss', { allowEmpty: true })
    .pipe(sass({outputStyle: 'compressed'}))
    .pipe(autoprefixer({browsers: ['last 2 versions']}))
    .pipe(cleanCSS())
    .pipe(concat('css.scss'))
    .pipe(ext('.mustache'))
    .pipe(gulp.dest('./src/mustache/partials/global/'))
    .pipe(browsersync.stream());
}

// CSS non critical
function cssnoncritical() {
  return gulp
    .src('./src/scss/main.scss', { allowEmpty: true })
    .pipe(sasslint({'config': '.sass-lint.yml'}))
    .pipe(sasslint.format())
    .pipe(sasslint.failOnError())
    .pipe(sass({outputStyle: 'compressed'}))
    .pipe(autoprefixer({browsers: ['last 2 versions']}))
    .pipe(cleanCSS())
    .pipe(gulp.dest('./dist/css/'))
    .pipe(browsersync.stream());
}

// JS critical
function jscritical() {
  return gulp
    .src('./src/js/critical.js', { allowEmpty: true })
    .pipe(
      babel({
        presets: ['@babel/env'],
      })
    )
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
        drop_console: false
      }}
    ))
    .pipe(concat('js.js'))
    .pipe(ext('.mustache'))
    .pipe(gulp.dest('./src/mustache/partials/global/'))
    .pipe(browsersync.stream());
}

// JS non-critical
function jsnoncritical() {
  return gulp
    .src([
      './node_modules/jquery/dist/jquery.slim.js',
      './node_modules/popper.js/dist/umd/popper.js',
      './node_modules/jquery-lazy/jquery.lazy.js',
      './node_modules/jquery-lazy/jquery.lazy.plugins.js',
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
      './src/js/main.js'
    ], { allowEmpty: true })
    .pipe(
      babel({
        presets: ['@babel/env'],
        overrides: [{
          test: './node_modules/**',
          sourceType: 'script'
        }]
      })
    )
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
        drop_console: false
      }}
    ))
    .pipe(concat('main.js'))
    .pipe(gulp.dest('./dist/js/'))
    .pipe(browsersync.stream());
}

// HTML
function html() {
  return gulp
    .src('./src/mustache/*.mustache', { allowEmpty: true })
    .pipe(
      mustache()
    )
    .pipe(ext('.html'))
    .pipe(gulp.dest('./dist/'))
    .pipe(browsersync.stream());
}

// BrowserSync
function browserSync(done) {
  browsersync.init({
    server: {
      baseDir: "./dist"
    },
    port: 3000
  });
  done();
}

function browserSyncReload(done) {
  browsersync.reload();
  done();
}

/*
 * Watch
 */

const watch =
  gulp.series(
    clean,
    gulp.parallel(
      favicon,
      sprite,
      fonts,
      images,
      jslint,
      csslint
    ),
    gulp.parallel(
      csscritical,
      cssnoncritical,
      jscritical,
      jsnoncritical
    ),
    jslazyloadmodules,
    html,
    browserSync,
    watchFiles
  );

const csswatch =
  gulp.series(
    csslint,
    csscritical,
    cssnoncritical,
    html
  );

const jswatch =
  gulp.series(
    jslint,
    jscritical,
    jsnoncritical,
    html
  );

function watchFiles() {
  gulp.watch('./src/scss/**/**/*.scss', csswatch);
  gulp.watch('./src/fonts/*.scss', fonts);
  gulp.watch('./src/favicon/*', favicon);
  gulp.watch('./src/js/**/*.js', jswatch);
  gulp.watch('./src/sprite/**/**/*.svg', sprite);
  gulp.watch('./src/mustache/**/**/**/*.mustache', html);
  gulp.watch('./src/img/**/**/*', images);
}

/*
 *  Export tasks
 */

exports.default = watch;
