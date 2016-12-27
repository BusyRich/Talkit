var gulp = require('gulp'),
    concat = require('gulp-concat'),
    rename = require('gulp-rename'),  
    uglify = require('gulp-uglify'),
    sass = require('gulp-sass'),
    spawn = require('child_process').spawn;

gulp.task('default', ['scripts', 'sass']);

var scriptsDir = 'public/js',
    scriptFiles = [
      scriptsDir + '/ditree.nodes.js',
      scriptsDir + '/ditree.app.js'
    ];

gulp.task('scripts', function() {
  return gulp.src(scriptFiles)
    .pipe(concat('ditree.js'))
    .pipe(gulp.dest(scriptsDir))
    .pipe(rename('ditree.min.js'))
    .pipe(uglify())
    .pipe(gulp.dest(scriptsDir));
});

var scssFiles = 'public/css/*.scss';
gulp.task('sass', function () {
  return gulp.src(scssFiles)
    .pipe(sass({outputStyle: 'compressed'}).on('error', sass.logError))
    .pipe(rename('ditree.min.css'))
    .pipe(gulp.dest('public/css'));
});

var node;
gulp.task('dev', ['scripts', 'sass'], function() {
  if (node) {
    node.kill();
  }

  node = spawn('node', ['app.js'], {stdio: 'inherit'});
  node.on('close', function (code) {
    if (code === 8) {
      gulp.log('Error detected, waiting for changes...');
    }
  });

  gulp.watch(scriptFiles, ['scripts']);
  gulp.watch(scssFiles, ['sass']);
});
