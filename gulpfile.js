const {task, series, parallel, src, dest, watch} = require('gulp');
const sass = require('gulp-sass');
const browserSync = require('browser-sync');
const notify = require('gulp-notify');
const cssnano = require('cssnano');
const rename = require('gulp-rename');
const postcss = require('gulp-postcss');
const csscomb = require('gulp-csscomb');
const autoprefixer = require('autoprefixer');
const mqpacker = require('css-mqpacker');
const sortCSSmq = require('sort-css-media-queries');

const PATH = {
  scssFile: './assets/scss/style.scss',
  scssFiles: './assets/scss/**/*.scss',
  scssFolder: './assets/scss',
  cssFolder: './assets/css',
  htmlFiles: './*.html',
  jsFiles: './assets/js/**/*.js'
};

const plugins = [
  autoprefixer({
    overrideBrowserslist: [
      'last 12 versions',
      '> 0.1%'
    ],
    cascade: true
  }),
  mqpacker({sort: sortCSSmq})
];

function comb() {
  return src(PATH.scssFiles).
    pipe(csscomb()).
    on(
      'error',
      notify.onError(function (error) {
        return 'File: ' + error.message;
      })
    ).
    pipe(dest(PATH.scssFolder));
}

function scss() {
  return src(PATH.scssFile).
    pipe(sass({outputStyle: 'expanded'}).on('error', sass.logError)).
    pipe(postcss(plugins)).
    pipe(dest(PATH.cssFolder)).
    pipe(notify({message: 'Compiled!',
      sound: false})).
    pipe(browserSync.reload({stream: true}));
}

function min() {
  const pluginsExtended = plugins.concat([cssnano({preset: 'default'})]);

  return src(PATH.scssFile).
    pipe(sass({outputStyle: 'expanded'}).on('error', sass.logError)).
    pipe(postcss(pluginsExtended)).
    pipe(rename({suffix: '.min'})).
    pipe(dest(PATH.cssFolder)).
    pipe(notify({message: 'Compiled!',
      sound: false})).
    pipe(browserSync.reload({stream: true}));
}

function dev() {
  return src(PATH.scssFile, {sourcemaps: true}).
    pipe(sass({outputStyle: 'expanded'}).on('error', sass.logError)).
    pipe(dest(PATH.cssFolder, {sourcemaps: true})).
    pipe(notify({message: 'Compiled!',
      sound: false})).
    pipe(browserSync.reload({stream: true}));
}

function syncInit() {
  browserSync({
    server: {
      baseDir: './'
    },
    notify: false
  });
}

async function sync() {
  browserSync.reload();
}

function watchFiles() {
  syncInit();
  watch(PATH.scssFiles, series(scss));
  watch(PATH.htmlFiles, sync);
  watch(PATH.jsFiles, sync);
}

task('comb', comb);
task('scss', scss);
task('min', min);
task('dev', dev);
task('watch', watchFiles);