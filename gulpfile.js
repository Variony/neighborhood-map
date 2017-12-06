const gulp = require('gulp');
const sass = require('gulp-sass');
const autoprefixer = require('gulp-autoprefixer');
const eslint = require('gulp-eslint');
const browserSync = require('browser-sync').create();
const concat = require('gulp-concat');
const uglify = require('gulp-uglify');

gulp.task('default', ['styles', 'lint', 'scripts', 'copy-html', 'copy-images'], function() {
	gulp.watch('app/styles/**/*.scss', ['styles']);
	gulp.watch('app/scripts/**/*.js', ['lint', 'scripts']);
	gulp.watch('app/index.html', ['copy-html']);
	gulp.watch('dist/index.html').on('change', browserSync.reload);

	browserSync.init({
		server: 'dist'
	});
});

gulp.task('dist', [
	'copy-html',
	'copy-images',
	'styles',
	'lint',
	'scripts-dist'
]);

gulp.task('styles', function() {
	gulp.src('app/styles/**/*.scss')
		.pipe(sass({ outputStyle: 'compressed' }).on('error', sass.logError))
		.pipe(autoprefixer({
			browsers: ['last 2 versions'],
			cascade: false,
		}))
		.pipe(gulp.dest('dist/styles'))
		.pipe(browserSync.stream());
});

gulp.task('lint', function() {
	gulp.src('app/scripts/**/*.js')
		.pipe(eslint())
		.pipe(eslint.format())
		.pipe(eslint.failOnError());
});

gulp.task('scripts', function() {
	gulp.src(['bower_components/jquery/dist/jquery.min.js','bower_components/knockout/dist/knockout.js', 'app/scripts/**/*.js'])
		.pipe(concat('all.js'))
		.pipe(gulp.dest('dist/scripts'));
});

gulp.task('scripts-dist', function() {
	gulp.src(['bower_components/jquery/dist/jquery.min.js', 'bower_components/knockout/dist/knockout.js', 'app/scripts/**/*.js'])
		.pipe(concat('all.js'))
		.pipe(uglify())
		.pipe(gulp.dest('dist/scripts'));
});

gulp.task('copy-html', function() {
	gulp.src('app/index.html')
		.pipe(gulp.dest('dist'));
});

gulp.task('copy-images', function() {
	gulp.src('app/images/*')
		.pipe(gulp.dest('dist/images'));
});
