import {src, dest, watch, series, parallel} from 'gulp';
import {deleteAsync} from 'del';
import postcss from 'gulp-postcss';
import cssnano from 'cssnano';
import atImport from 'postcss-import';
import purgecss from 'gulp-purgecss';
import {stream as critical} from 'critical';
import compiler from 'webpack';
import webpack from 'webpack-stream';
import concat from 'gulp-concat';
import uglify from 'gulp-uglify';
import imagemin, {gifsicle, mozjpeg, optipng, svgo} from 'gulp-imagemin';
import webp from 'gulp-webp';
import hb from 'gulp-hb';
import ext from 'gulp-ext-replace'
import sitemap from 'gulp-sitemap';
import browsersync from 'browser-sync';

export const clean = () => deleteAsync('dist/');

export function fonts() {
  return src('src/fonts/*', {encoding: false})
    .pipe(dest('dist/fonts/'))
    .pipe(browsersync.stream());
}

export function scripts() {
  return src('src/js/main.js', {encoding: false})
    .pipe(webpack({}, compiler, function() {}))
    .pipe(uglify())
    .pipe(concat('main.js'))
    .pipe(dest('dist/js/'))
    .pipe(browsersync.stream());
}

export function styles() {
  return src('src/css/main.css', {encoding: false})
    .pipe(postcss([
      atImport,
      cssnano({
        preset: ["default", { discardComments: { removeAll: true } }]
      })
    ]))
    .pipe(purgecss({
      content: ['dist/*.html']
    }))
    .pipe(dest('dist/css/'))
    .pipe(browsersync.stream());
}

export function criticalStyles() {
  return src('dist/**/*.html', {encoding: false})
    .pipe(
      critical({
        inline: true,
        base: 'dist/',
        css: 'dist/css/main.css',
        target: {
          uncritical: 'css/main.css'
        },
        extract: true
      })
    )
    .pipe(dest('dist/'))
    .pipe(browsersync.stream());
}

export function images() {
  src('src/img/**/**/*[.jpg|.gif|.png]', {encoding: false})
    .pipe(imagemin([
      gifsicle({interlaced: true}),
      mozjpeg({quality: 75, progressive: true}),
      optipng({optimizationLevel: 5}),
    ]))
    .pipe(webp())
    .pipe(dest('dist/img/'))
    .pipe(browsersync.stream());
  return src('src/img/**/**/*.svg')
    .pipe(imagemin([
      svgo({
        plugins: [
          {
            name: 'removeViewBox',
            active: true
          },
          {
            name: 'cleanupIDs',
            active: true
          },
          {
            name: 'collapseGroups',
            active: true
          }
        ]
      })
    ]))
    .pipe(dest('dist/img/'))
    .pipe(browsersync.stream());
}

export function html() {
  return src('src/html/*.hbs', {encoding: false})
    .pipe(hb().partials('src/html/partials/**/*.hbs'))
    .pipe(ext('.html'))
    .pipe(dest('dist/'))
    .pipe(browsersync.stream());
}

export function sitemaps() {
  return src('dist/*.html', {
    encoding: false,
    read: false
  })
    .pipe(sitemap({
      siteUrl: 'https://jamesmonk.me',
      fileName: 'sitemap.xml',
      changefreq: 'weekly',
      priority: function(siteUrl, loc, entry) {
        return loc.split('/').length === 0 ? 1 : 0.5;
      }
    }))
    .pipe(dest('dist/'))
    .pipe(browsersync.stream());
}

export function browserSync(done) {
  browsersync.init({server: {baseDir: "dist"}, port: 3000, open: false});
  done();
}

export function browserSyncReload(done) {
  browsersync.reload();
  done();
}

function watchFiles() {
  watch('src/js/**/*.js', scripts);
  watch(['src/html/**/*.hbs', 'src/css/**/*.css'], htmlBuild);
  watch('src/img/**/*', images);
}

const htmlBuild = series(html, styles, criticalStyles, sitemaps);
export const build = series(clean, parallel(fonts, images, scripts), htmlBuild);
const watchSrc = series(build, browserSync, watchFiles);

export default watchSrc;
