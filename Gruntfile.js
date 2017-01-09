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
            'build/bundle.js': ['client/app.js']
        },
        copy: {
            files: {
                src: 'build/bundle.js',
                dest: 'public/bundle.min.js'
            }
        },
        watch: {
            files: ["client/*.js"],
            tasks: ['browserify', 'copy']
        },
    });

    // Load the plugin that provides the "uglify" task.
    grunt.loadNpmTasks('grunt-contrib-uglify');

    grunt.loadNpmTasks('grunt-browserify');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-watch');

    // Default task(s).
    grunt.registerTask('default', ['browserify', 'copy']);

};