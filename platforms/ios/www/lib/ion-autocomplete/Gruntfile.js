'use strict';

module.exports = function (grunt) {

    // load grunt tasks automatically
    require('load-grunt-tasks')(grunt);

    // add time used for tasks statistics
    require('time-grunt')(grunt);

    grunt.initConfig({
        pkg: grunt.file.readJSON("package.json"),
        "bower-install-simple": {
            options: {
                color: true
            },
            dev: {
                options: {
                    production: false
                }
            }
        },
        concat: {
            js: {
                options: {
                    banner: "/*\n * <%= pkg.name %> <%= pkg.version %>\n * Copyright <%= grunt.template.today('yyyy') %> Danny Povolotski \n * Copyright modifications <%= grunt.template.today('yyyy') %> Guy Brand \n * https://github.com/guylabs/ion-autocomplete\n */\n(function() {\n\n'use strict';\n\n",
                    footer: '\n})();',
                    separator: '\n',
                    process: true
                },
                src: 'src/ion-autocomplete.js',
                dest: 'dist/<%= pkg.name %>.js'

            },
            css: {
                src: 'src/ion-autocomplete.css',
                dest: 'dist/<%= pkg.name %>.css'
            }
        },
        uglify: {
            options: {
                banner: "/*\n * <%= pkg.name %> <%= pkg.version %>\n * Copyright <%= grunt.template.today('yyyy') %> Danny Povolotski \n * Copyright modifications <%= grunt.template.today('yyyy') %> Guy Brand \n * https://github.com/guylabs/ion-autocomplete\n */\n"
            },
            dist: {
                files: {
                    'dist/<%= pkg.name %>.min.js': ['<%= concat.js.dest %>']
                }
            }
        },
        cssmin: {
            target: {
                files: [{
                    expand: true,
                    cwd: 'src',
                    src: ['ion-autocomplete.css'],
                    dest: 'dist',
                    ext: '.min.css'
                }]
            }
        },
        karma: {
            unit: {
                configFile: 'karma.conf.js'
            },
            continuous: {
                configFile: 'karma.conf.js',
                singleRun: true
            }
        },
        'http-server': {
            dev: {
                runInBackground: true
            },
            debug: {
                runInBackground: false
            }
        },
        protractor: {
            options: {
                configFile: "protractor-conf.js"
            },
            run: {}
        },
        coveralls: {
            options: {
                src: 'coverage-results/lcov.info',
                force: true
            },
            your_target: {
                src: 'coverage-results/extra-results-*.info'
            }
        }
    });

    grunt.registerTask('build', ['bower-install-simple:dev', 'test', 'concat', 'uglify', 'cssmin']);
    grunt.registerTask('test', ['karma:continuous', 'http-server:dev', 'protractor:run']);
    grunt.registerTask('default', ['build']);

    // cannot use sauce labs with a pull requests
    if (parseInt(process.env.TRAVIS_PULL_REQUEST, 10) > 0) {
        grunt.registerTask('test', ['karma:continuous']);
    }

};
