var gulp = require('gulp'),
    concat = require('gulp-concat'),
    rename = require('gulp-rename'),  
    uglify = require('gulp-uglify'),
    sass = require('gulp-sass');

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

gulp.task('sass', function () {
  return gulp.src('public/css/*.scss')
    .pipe(sass({outputStyle: 'compressed'}).on('error', sass.logError))
    .pipe(rename('ditree.min.css'))
    .pipe(gulp.dest('public/css'));
});
