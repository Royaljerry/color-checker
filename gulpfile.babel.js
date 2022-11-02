// ****************************************************************
// IMPORTS
// ****************************************************************

import gulp from 'gulp';
import rimraf from "rimraf";
import browser from 'browser-sync';
import sass from 'gulp-dart-sass';
import plugins from "gulp-load-plugins";
import ts from 'gulp-typescript';
import fileinclude from 'gulp-file-include';

// ****************************************************************
// CONFIGURATION
// ****************************************************************

// ================================================
// Constants
// ================================================

const $ = plugins();

const CONF = {
	'sourceDir': 'src',
	'buildDir': 'build',
	'nameTemplate': 'index',
	'nameScript': 'app',
	'nameStyle': 'style',
	'nameData': 'data'
}

// ****************************************************************
// TASKS
// ****************************************************************

// ================================================
// Single
// ================================================

// --------------------------------
// Common
// --------------------------------

function clean(done) {
	rimraf(`${CONF["buildDir"]}`, done);
}

function assets() {
	return gulp.src([`${CONF['sourceDir']}/*.+(svg|png|jpg)`])
		.pipe(gulp.dest(`${CONF["buildDir"]}`));
}

function templates() {
	return gulp.src([`${CONF['sourceDir']}/*.html`])
		.pipe(gulp.dest(`${CONF["buildDir"]}`));
}

function script() {
	return gulp.src([`${CONF['sourceDir']}/${CONF['nameScript']}.ts`])
		.pipe(ts({
			noImplicitAny: true,
			outDir: CONF['sourceDir'],
			outFile: `${CONF['nameScript']}.js`,
			removeComments: true
		}))
		.pipe(gulp.dest(`${CONF["buildDir"]}`));
}

function style() {
	return gulp.src(`${CONF["sourceDir"]}/${CONF['nameStyle']}.scss`)
		.pipe(sass().on('error', sass.logError))
		.pipe(gulp.dest(`${CONF["buildDir"]}`));
}

function data() {
	return gulp.src([`${CONF['sourceDir']}/${CONF['nameData']}.json`])
		.pipe(gulp.dest(`${CONF["buildDir"]}`));
}

function serve(done) {
	browser.init({
		server: `${CONF["buildDir"]}`
	});
	done();
}

// --------------------------------
// Specific
// --------------------------------

function include() {
	return gulp.src([`${CONF["buildDir"]}/${CONF['nameTemplate']}.html`])
		.pipe(fileinclude())
		.pipe(gulp.dest(`${CONF["buildDir"]}`));
}

function watch() {
	gulp.watch(`${CONF['sourceDir']}/*.(html|scss|ts|json|svg)`).on('all', gulp.series(
		'build',
		include,
		browser.reload
	));
}

// ================================================
// Compound
// ================================================

gulp.task('build', gulp.series(
	clean,
	assets,
	templates,
	script,
	style,
	data
));

// ================================================
// Main
// ================================================

gulp.task('default', gulp.series(
	'build',
	include,
	serve,
	watch
));
