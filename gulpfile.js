'use strict';

/**
 * Module dependencies.
 */
var _ = require('lodash'),
	fs = require('fs'),
	defaultAssets = require('./config/assets/default'),
	testAssets = require('./config/assets/test'),
	glob = require('glob'),
	gulp = require('gulp'),
	gulpLoadPlugins = require('gulp-load-plugins'),
	runSequence = require('run-sequence'),
	plugins = gulpLoadPlugins({
		rename: {
			'gulp-angular-templatecache': 'templateCache',
		},
	}),
	wiredep = require('wiredep').stream,
	path = require('path'),
	isparta = require('isparta'),
	istanbul = require('gulp-istanbul');
var del = require('del');
const topics = require('./seeds/topics');

// Local settings
var changedTestFiles = [];

// Set NODE_ENV to 'test'
gulp.task('env:test', function() {
	process.env.NODE_ENV = 'test';
});

// Nodemon task
gulp.task('nodemon', function() {
	return plugins.nodemon({
		script: 'server.js',
	});
});

// Nodemon task without verbosity or debugging
gulp.task('nodemon-nodebug', function() {
	return plugins.nodemon({
		script: 'server.js',
		ext: 'js,html',
		watch: _.union(
			defaultAssets.server.views,
			defaultAssets.server.allJS,
			defaultAssets.server.config
		),
	});
});

// Watch Files For Changes
gulp.task('watch', function() {
	// Start livereload
	plugins.refresh.listen();

	// Add watch rules
	gulp.watch(defaultAssets.server.views).on('change', plugins.refresh.changed);
	gulp.watch(defaultAssets.server.allJS, ['eslint']).on('change', plugins.refresh.changed);

	if (process.env.NODE_ENV === 'production') {
		gulp.watch(defaultAssets.server.gulpConfig, ['templatecache', 'eslint']);
	} else {
		gulp.watch(defaultAssets.server.gulpConfig, ['eslint']);
	}
});

// Watch server test files
gulp.task('watch:server:run-tests', function() {
	// Start livereload
	plugins.refresh.listen();

	// Add Server Test file rules
	gulp.watch([testAssets.tests.server, defaultAssets.server.allJS], ['test:server']).on(
		'change',
		function(file) {
			changedTestFiles = [];

			// iterate through server test glob patterns
			_.forEach(testAssets.tests.server, function(pattern) {
				// determine if the changed (watched) file is a server test
				_.forEach(glob.sync(pattern), function(f) {
					var filePath = path.resolve(f);

					if (filePath === path.resolve(file.path)) {
						changedTestFiles.push(f);
						plugins.refresh.changed(f);
					}
				});
			});
		}
	);
});

// ESLint JS linting task
gulp.task('eslint', function() {
	var assets = _.union(
		defaultAssets.server.gulpConfig,
		defaultAssets.server.allJS,
		testAssets.tests.server,
		testAssets.tests.e2e
	);

	return gulp
		.src(assets)
		.pipe(
			plugins.eslint({
				useEslintrc: true,
			})
		)
		.pipe(plugins.eslint.format());
});

// wiredep task to default
gulp.task('wiredep', function() {
	return gulp
		.src('config/assets/default.js')
		.pipe(
			wiredep({
				ignorePath: '../../',
			})
		)
		.pipe(gulp.dest('config/assets/'));
});

// Copy local development environment config example
gulp.task('copyLocalEnvConfig', function() {
	var src = [];
	var renameTo = 'local-development.js';

	// only add the copy source if our destination file doesn't already exist
	if (!fs.existsSync('config/env/' + renameTo)) {
		src.push('config/env/local.example.js');
	}

	return gulp
		.src(src)
		.pipe(plugins.rename(renameTo))
		.pipe(gulp.dest('config/env'));
});

// Mocha tests task
gulp.task('mocha', function(done) {
	var mongooseService = require('./config/lib/mongoose');
	var testSuites = changedTestFiles.length ? changedTestFiles : testAssets.tests.server;
	var error;

	// Connect mongoose
	mongooseService.connect(function(db) {
		// Load mongoose models
		mongooseService.loadModels();

		gulp.src(testSuites)
			.pipe(
				plugins.mocha({
					reporter: 'spec',
					timeout: 10000,
				})
			)
			.on('error', function(err) {
				// If an error occurs, save it
				error = err;
				console.log(err);
			})
			.on('end', function() {
				db.dropDatabase(function(err) {
					if (err) {
						console.log('Error in dropping database.');
						console.log(err);
					} else {
						console.log('Database dropped successfully.');
					}
					process.exit();
				});
			});
	});
});

// Prepare istanbul coverage test
gulp.task('pre-test', function() {
	// Display coverage for all server JavaScript files
	return (
		gulp
			.src(defaultAssets.server.allJS)
			.pipe(
				istanbul({
					instrumenter: isparta.Instrumenter,
					includeUntested: true,
				})
			)
			// Force `require` to return covered files
			.pipe(istanbul.hookRequire())
	);
});

gulp.task('clean-coverage', function(cb) {
	del(['coverage'], cb);
});

// Run istanbul test and write report
gulp.task('mocha:coverage', ['pre-test', 'mocha'], function() {
	var testSuites = changedTestFiles.length ? changedTestFiles : testAssets.tests.server;

	return gulp
		.src(testSuites)
		.pipe(
			istanbul({
				instrumenter: isparta.Instrumenter,
				includeUntested: true,
			})
		)
		.pipe(istanbul.hookRequire()) // Force `require` to return covered files
		.pipe(
			istanbul.writeReports({
				reportOpts: {
					dir: './coverage/server',
				},
			})
		);
});

// Drops the MongoDB database, used in e2e testing
gulp.task('dbsetup', async function(done) {
	// Use mongoose configuration
	var mongooseService = require('./config/lib/mongoose');

	await mongooseService.connect(async function(db) {
		await db.dropDatabase(function(err) {
			if (err) {
				console.log(err);
			} else {
				console.log('Successfully dropped db: ', db.databaseName);
			}
		});

		await db.createCollection('topics', {
			validator: {
				$jsonSchema: {
					bsonType: 'object',
					required: ['slug'],
					properties: {
						slug: {
							bsonType: 'string',
						},
						title: {
							bsonType: 'string',
						},
						description: {
							bsonType: 'string',
						},
						profileImageURL: {
							bsonType: 'string',
						},
						coverImage: {
							bsonType: 'string',
						},
						status: {
							bsonType: 'bool',
						},
						relevant: {
							bsonType: 'array',
						},
					},
				},
			},
		});
		let data = db.collection('topics');
		await data.insert(topics.data);
	});
});

// Seed Mongo database based on configuration
gulp.task('mongo-seed', function(done) {
	var db = require('./config/lib/mongoose');
	var seed = require('./config/lib/mongo-seed');

	// Open mongoose database connection
	db.connect(function() {
		db.loadModels();

		seed.start({
			options: {
				logResults: true,
			},
		})
			.then(function() {
				// Disconnect and finish task
				db.disconnect(done);
			})
			.catch(function(err) {
				db.disconnect(function(disconnectError) {
					if (disconnectError) {
						console.log(
							'Error disconnecting from the database, but was preceded by a Mongo Seed error.'
						);
					}

					// Finish task with error
					done(err);
				});
			});
	});
});

// Lint CSS and JavaScript files.
gulp.task('lint', function(done) {
	runSequence(['eslint'], done);
});

// Run the project tests
gulp.task('test', function(done) {
	runSequence('env:test', 'test:server', 'nodemon', done);
});

gulp.task('test:server', function(done) {
	runSequence('env:test', ['copyLocalEnvConfig', 'dbsetup'], 'lint', 'mocha', done);
});

// Watch all server files for changes & run server tests (test:server) task on changes
gulp.task('test:server:watch', function(done) {
	runSequence('test:server', 'watch:server:run-tests', done);
});

gulp.task('test:e2e', function(done) {
	runSequence('env:test', 'lint', 'dbsetup', 'nodemon', done);
});

gulp.task('test:coverage', function(done) {
	runSequence('env:test', ['copyLocalEnvConfig', 'dbsetup'], 'lint', 'mocha:coverage', done);
});

// Run the project in development mode with node debugger enabled
gulp.task('default', function(done) {
	runSequence('env:dev', ['copyLocalEnvConfig'], 'lint', ['nodemon', 'watch'], done);
});

// Run Mongo Seed with default environment config
gulp.task('seed', function(done) {
	runSequence('env:dev', 'mongo-seed', done);
});

// Run Mongo Seed with production environment config
gulp.task('seed:prod', function(done) {
	runSequence('env:prod', 'mongo-seed', done);
});

gulp.task('seed:test', function(done) {
	runSequence('env:test', 'mongo-seed', done);
});
