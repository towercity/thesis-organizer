module.exports = function(grunt) {
	grunt.initConfig({
		sass: {
			options: {
				sourceMap: true
			},
			dist: {
				files: {
					'public/main.css': 'stlyes/main.scss'
				}
			}
		}
	});

	grunt.loadNpmTasks('grunt-sass');

	grunt.registerTask('myTask', 'foos around', function() {
		grunt.log.writeln('Currently running the "default" task.');
	});

	grunt.registerTask('default', ['myTask']);
}