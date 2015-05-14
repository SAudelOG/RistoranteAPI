module.exports = function (grunt){

	//Load plugins
	[
		'grunt-cafe-mocha',
		'grunt-contrib-jshint',

	].forEach(function (task){
		grunt.loadNpmTasks(task);
	});

	//configure plugins
	grunt.initConfig({
		cafemocha:{
			all: {src: 'test/*.js', options:{ui: 'tdd'},}
		},
		jshint: {
			app: ['app.js', 'util/*.js', 'router/*.js', 'model/*.js', 'config/*.js'],
			qa: ['Gruntfile.js', 'test/*.js']
		},
	});

	//register tasks
	grunt.registerTask('default', ['cafemocha', 'jshint']);
};