const gulp = require('gulp')
const gulpIf = require('gulp-if')
const postcss = require('gulp-postcss')
const postcssImport = require('postcss-import')
const postcssNested = require('postcss-nested')
const autoPrefixer = require('autoprefixer')
const postcssCustomProperties = require('postcss-custom-properties')
const postcssCsso = require('postcss-csso')
const postCssCustomMedia = require('postcss-custom-media')
const browserSync = require('browser-sync')
const webpackStream = require('webpack-stream')
const uglify = require('gulp-uglify')

const isDev = process.env.NODE_ENV === 'development'
const isProd = process.env.NODE_ENV === 'production'

const path = {
  src: {
    css: './src/css/*.css',
    html: './src/*.html',
    js: './src/js/index.js',
    images: './src/images/**/*.*',
  },
  build: {
    css: './build/css',
    html: './build',
    js: './build/js',
    images: './build/images',
  },
  watch: {
    css: './src/css/**/*.css',
    html: './src/**/*.html',
    js: './src/js/**/*.js',
  },
}

const css = () => {
  const plugins = [
    postcssImport,
    postcssNested,
    postcssCustomProperties,
    postCssCustomMedia,
    autoPrefixer(),
    postcssCsso,
  ]

  return gulp
    .src(path.src.css, { sourcemaps: !!isDev })
    .pipe(postcss(plugins))
    .pipe(gulp.dest(path.build.css, { sourcemaps: !!isDev }))
    .pipe(browserSync.stream())
}

const html = () => {
  return gulp
    .src(path.src.html)
    .pipe(gulp.dest(path.build.html))
    .pipe(browserSync.stream())
}

const images = () => {
  return gulp
    .src(path.src.images)
    .pipe(gulp.dest(path.build.images))
    .pipe(browserSync.stream())
}

const js = () => {
  return gulp
    .src(path.src.js)
    .pipe(
      webpackStream({
        mode: env,
        output: {
          filename: 'bundle.js',
        },
        module: {
          rules: [
            {
              test: /\.(js)$/,
              exclude: /(node_modules)/,
              loader: 'babel-loader',
              query: {
                presets: ['@babel/preset-env'],
              },
            },
          ],
        },
      })
    )
    .pipe(gulpIf(isProd, uglify()))
    .pipe(gulp.dest(path.build.js))
    .pipe(browserSync.stream())
}

exports.dev = () => {
  browserSync.init({ server: './build' })

  gulp.watch(path.watch.css, css)
  gulp.watch(path.watch.html, html)
  gulp.watch(path.watch.js, js)
}

exports.build = gulp.series(gulp.parallel(html, css, js, images))
