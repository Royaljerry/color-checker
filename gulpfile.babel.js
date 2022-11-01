// ****************************************************************
// IMPORTS
// ****************************************************************

import gulp from 'gulp';
import rimraf from "rimraf";
import browser from 'browser-sync';
import sass from 'gulp-dart-sass';
import fs from 'fs';
import siphon from "siphon-media-query";
import lazypipe from "lazypipe";
import plugins from "gulp-load-plugins";
import inlinesource from 'gulp-inline-source';
import del from 'del';
import yargs from 'yargs';
import jsonminify from 'gulp-jsonminify';
import ts from 'gulp-typescript';
import fileinclude from 'gulp-file-include';
import replace from 'gulp-replace';

// ****************************************************************
// CONFIGURATION
// ****************************************************************

// ================================================
// Constants
// ================================================

const $ = plugins();

const CONF = {
	'sourceDir': 'src',
	'buildDirDev': 'build/dev',
	'buildDirProd': 'build/prod',
	'nameTemplate': 'index',
	'nameSignature': 'signature',
	'nameScript': 'app',
	'nameStyle': 'style',
	'nameData': 'data'
}

const WATCH_PROD = !!(yargs.argv.watch);

// ================================================
// Variables
// ================================================

let buildDir;

// ****************************************************************
// TASKS
// ****************************************************************

// ================================================
// Single
// ================================================

// --------------------------------
// Common
// --------------------------------

function setBuildDirToDev(cb) {
	buildDir = CONF['buildDirDev'];
	cb();
}

function setBuildDirToProd(cb) {
	buildDir = CONF['buildDirProd'];
	cb();
}

function clean(done) {
	rimraf(buildDir, done);
}

function templates() {
	return gulp.src([`${CONF['sourceDir']}/*.html`])
		.pipe(gulp.dest(buildDir));
}

function script() {
	return gulp.src([`${CONF['sourceDir']}/${CONF['nameScript']}.ts`])
		.pipe(ts({
			noImplicitAny: true,
			outDir: CONF['sourceDir'],
			outFile: `${CONF['nameScript']}.js`,
			removeComments: true
		}))
		.pipe(gulp.dest(buildDir));
}

function style() {
	return gulp.src(`${CONF["sourceDir"]}/${CONF['nameStyle']}.scss`)
		.pipe(sass().on('error', sass.logError))
		.pipe(gulp.dest(buildDir));
}

function data() {
	return gulp.src([`${CONF['sourceDir']}/${CONF['nameData']}.json`])
		.pipe(gulp.dest(buildDir));
}

function serve(done) {
	browser.init({
		server: buildDir
	});
	done();
}

// --------------------------------
// Specific
// --------------------------------

function includeFile() {
	return gulp.src([`${buildDir}/${CONF['nameTemplate']}.html`])
		.pipe(fileinclude())
		.pipe(gulp.dest(`${buildDir}`));
}

function minifyJs() {
	return gulp.src([`${buildDir}/${CONF['nameTemplate']}.html`])
		.pipe(inlinesource())
		.pipe(gulp.dest(`${buildDir}`));
}

function minifyCss() {
	return gulp.src([`${buildDir}/${CONF['nameSignature']}.html`])
		.pipe(inliner())
		.pipe(gulp.dest(buildDir));
}

function minifyJson() {
	return gulp.src([`${buildDir}/${CONF['nameData']}.json`])
		.pipe(jsonminify())
		.pipe(gulp.dest(buildDir));
}

function watchDev() {
	gulp.watch(`${CONF['sourceDir']}/*.(html|scss|ts|json)`).on('all', gulp.series(
		'build',
		// cleanSignatureDev,
		includeFile,
		cleanDev,
		browser.reload
	));
}

function watchProd() {
	gulp.watch(`${CONF['sourceDir']}/*.*`).on('all', gulp.series(
		'build',
		minifyJs,
		minifyCss,
		minifyJson,
		includeFile,
		cleanProd,
		browser.reload
	));
}

function cleanDev() {
	return(
		del([
			`${buildDir}/${CONF['nameSignature']}.html`
		])
	);
}

// FixMe:
function cleanSignatureDev() {
	return gulp.src([`${buildDir}/${CONF['nameSignature']}.html`])
		.pipe(replace, /<link rel="stylesheet"[^>]*>/, '')
		.pipe(gulp.dest(buildDir));
}

function cleanProd() {
	return(
		del([
			`${buildDir}/${CONF['nameScript']}.js`,
			`${buildDir}/${CONF['nameSignature']}.html`
		])
	);
}

// --------------------------------
// Helper
// --------------------------------

function inliner() {
	const pipe = lazypipe()
		.pipe($.inlineCss, {
			applyStyleTags: false,
			removeStyleTags: true,
			preserveMediaQueries: false,
			removeLinkTags: false,
			removeHtmlSelectors: false
		})
		.pipe($.replace, /<link rel="stylesheet"[^>]*>/, '')
		.pipe($.htmlmin, {
			collapseWhitespace: true,
			minifyCSS: true
		});
	return pipe();
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
	setBuildDirToDev,
	clean,
	'build',
	// cleanSignatureDev,
	includeFile,
	cleanDev,
	serve,
	watchDev
));

if(WATCH_PROD) {
	gulp.task('prod', gulp.series(
		setBuildDirToProd,
		clean,
		'build',
		minifyJs,
		minifyCss,
		minifyJson,
		includeFile,
		cleanProd,
		serve,
		watchProd
	));
} else {
	gulp.task('prod', gulp.series(
		setBuildDirToProd,
		clean,
		'build',
		minifyJs,
		minifyCss,
		minifyJson,
		includeFile,
		cleanProd
	));
}
