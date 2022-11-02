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

function templates() {
	return gulp.src([`${CONF['sourceDir']}/*.html`])
		.pipe(gulp.dest(`${CONF["buildDir"]}`));
}

function assets() {
	
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

function includeFile() {
	return gulp.src([`${CONF["buildDir"]}/${CONF['nameTemplate']}.html`])
		.pipe(fileinclude())
		.pipe(gulp.dest(`${CONF["buildDir"]}`));
}

function watchDev() {
	gulp.watch(`${CONF['sourceDir']}/*.(html|scss|ts|json)`).on('all', gulp.series(
		'build',
		includeFile,
		browser.reload
	));
}

// ================================================
// Compound
// ================================================

gulp.task('build', gulp.series(
	templates,
	script,
	style,
	data
));

// ================================================
// Main
// ================================================

gulp.task('default', gulp.series(
	clean,
	'build',
	includeFile,
	serve,
	watchDev
));
