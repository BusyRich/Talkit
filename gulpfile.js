var gulp = require('gulp'),
    concat = require('gulp-concat'),
    rename = require('gulp-rename'),  
    uglify = require('gulp-uglify');

gulp.task('default', function() {
  return gulp.src(['public/js/ditree.nodes.js','public/js/ditree.app.js'])
    .pipe(concat('ditree.js'))
    .pipe(gulp.dest('public/js'))
    .pipe(rename('ditree.min.js'))
    .pipe(uglify())
    .pipe(gulp.dest('public/js'));
});
