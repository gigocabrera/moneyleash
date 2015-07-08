module.exports = function (config) {
    config.set({

        // base path, that will be used to resolve files and exclude
        basePath: '',

        // frameworks to use
        frameworks: ['jasmine'],

        // list of files / patterns to load in the browser
        files: [
            'bower_components/ionic/js/ionic.bundle.js',
            'bower_components/angular-mocks/angular-mocks.js',
            'src/ion-autocomplete.js',
            'test/ion-autocomplete.single-select.spec.js',
            'test/ion-autocomplete.multiple-select.spec.js',
            'test/templates/*.html'
        ],

        // list of files to exclude
        exclude: [],

        // test results reporter to use
        // possible values: 'dots', 'progress', 'junit', 'growl', 'coverage'
        reporters: ['progress', 'coverage'],

        // web server port
        port: 9876,

        // enable / disable colors in the output (reporters and logs)
        colors: true,

        // level of logging
        // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
        logLevel: config.LOG_INFO,

        // enable / disable watching file and executing tests whenever any file changes
        autoWatch: false,

        // Start these browsers, currently available:
        // - Chrome
        // - ChromeCanary
        // - Firefox
        // - Opera
        // - Safari (only Mac)
        // - PhantomJS
        // - IE (only Windows)
        browsers: ['PhantomJS', 'Chrome'],

        // If browser does not capture in given timeout [ms], kill it
        captureTimeout: 60000,

        // Continuous Integration mode
        // if true, it capture browsers, run tests and exit
        singleRun: false,

        customLaunchers: {
            Chrome_travis_ci: {
                base: 'Chrome',
                flags: ['--no-sandbox']
            }
        },

        // Test coverage configuration and template generation
        preprocessors: {
            'src/*.js': ['coverage'],
            'test/templates/*.html': 'ng-html2js'
        },
        coverageReporter: {
            type: 'lcov',
            dir: 'build/coverage/'
        }
    });

    if (process.env.TRAVIS) {
        config.browsers = ['Chrome_travis_ci'];
    }
};
