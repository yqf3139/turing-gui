module.exports = function (grunt) {

    // Project configuration.
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        uglify: {
            options: {
                sourceMap: true,
                sourceMapIncludeSources: true,
            },
            build: {
                src: 'build/bundle.js',
                dest: 'public/bundle.min.js'
            }
        },
        browserify: {
            'build/bundle.js': ['src/app.js']
        },
        copy: {
            files: {
                src: 'build/bundle.js',
                dest: 'public/bundle.min.js'
            }
        },
        watch: {
            files: ["src/*.js"],
            tasks: ['browserify', 'uglify']
        },
    });

    // Load the plugin that provides the "uglify" task.
    grunt.loadNpmTasks('grunt-contrib-uglify');

    grunt.loadNpmTasks('grunt-browserify');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-watch');

    // Default task(s).
    grunt.registerTask('default', ['browserify', 'uglify']);

};