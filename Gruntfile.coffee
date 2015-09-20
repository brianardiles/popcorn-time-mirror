os        = require 'os'

platform  = os.platform()
{ normalize } = require 'path'

if platform == 'darwin'
  platform = 'osx'

if platform == 'linux' or platform == 'osx'
  platform = platform + os.arch().replace('x', '')

module.exports = (grunt) ->

  grunt.initConfig

    config:
      platform: platform
      env: 'dev'
      pkg: grunt.file.readJSON 'package.json'
      
      path:
        build: normalize "#{__dirname}/build"
        dist: 'dist'
        cache: 'cache'
        icons: 'src/icons'
        
    clean:
      build: src: [ '<%= config.path.build %>' ]
      dist: src: [ '<%= config.path.dist %>' ]

    coffee:
      app: 
        options: 
          bare: true
          join: true
        files: 'build/js/app.js': ['src/coffee/*.coffee', 'src/coffee/**/**.coffee']
      server:
        expand: true
        flatten: true
        cwd: 'src/server'
        src: [ '*.coffee' ]
        dest: 'build/server/'
        ext: '.js'
      main:
        files: 'build/server.js': ['src/server.coffee']

    watch: 
      coffee: 
        files: ['src/coffee/*.coffee', 'src/coffee/**/*.coffee'], tasks: ['coffee', 'ngtemplates', 'ngAnnotate']
      stylus: 
        files: ['src/**/*.styl'], tasks: ['stylus']

    # https://www.npmjs.com/package/grunt-angular-templates
    ngtemplates:
      ng: 
        cwd: 'src/coffee'
        src: ['**/*.html']
        dest: 'build/js/templates.js'

    # https://www.npmjs.com/package/grunt-ng-annotate
    ngAnnotate:
      build: 
        files: 'build/js/app.js': ['build/js/app.js']
  
    concat:
      js:
        src: [
          'src/vendor/js/**/*.js'
          'src/vendor/js/**'
        ]
        dest: 'build/js/vendor.js'
      
      css:
        src: [
          'src/vendor/css/**/*.css'
          'src/vendor/css/**'
        ]
        dest: 'build/css/vendor.css'

    preprocess: 
      build:
        src: [ '<%= config.path.build %>/**/*.html' ]
        options:
          inline: true
          context: NODE_ENV: '<%= config.env %>'

    stylus:
      build:
        options:
          'resolve url': true
          use: [ 'nib' ]
          compress: false
          paths: [ '/styl' ]
        
        expand: true
        join: true
        files: 'build/css/app.css': ['src/**/*.styl', 'src/**/**.styl']

    copy: 
      build:
        src: ['package.json']
        dest: '<%= config.path.build %>/'
        expand: true

      main: 
        files: [
          { expand: true, cwd: 'src/assets/', src: ['**'], dest: 'build' }
        ]

      node_modules: 
        files: [
          { expand: true, cwd: 'node_modules/', src: ['**'], dest: 'build/node_modules' }
        ]

      server: 
        src: ['src/server/package.json']
        dest: '<%= config.path.build %>/server/package.json'

  # load the tasks
  require('load-grunt-tasks') grunt
  
  grunt.registerTask 'copyDeps', ->
    grunt.task.run 'copy:build'
    grunt.task.run 'copy:main'
    grunt.task.run 'copy:server'

  # define the tasks
  grunt.registerTask 'build', (env) ->
    env = env or 'dev'

    grunt.config.set 'config.env', env

    grunt.task.run 'clean:build'
    grunt.task.run 'coffee'
    grunt.task.run 'ngtemplates:ng'
    grunt.task.run 'ngAnnotate:build'
    grunt.task.run 'stylus:build'
    grunt.task.run 'concat'
    grunt.task.run 'copyDeps'
    
    grunt.task.run 'preprocess:build'

  grunt.registerTask 'buildAngular', (env) ->
    env = env or 'dev'

    grunt.config.set 'config.env', env

    grunt.task.run 'coffee'
    grunt.task.run 'ngtemplates:ng'
    grunt.task.run 'ngAnnotate:build'
    grunt.task.run 'concat'
    grunt.task.run 'copyDeps'
    grunt.task.run 'preprocess:build'

  grunt.registerTask 'buildAngularWatch', (env) ->
    env = env or 'dev'

    grunt.config.set 'config.env', env

    grunt.task.run 'buildAngular'
    grunt.task.run 'watch'

  grunt.registerTask 'start', (env) ->
    env = env or 'dev'

    grunt.config.set 'config.env', env

    grunt.task.run 'build'
    grunt.task.run 'watch'

  grunt.event.on 'watch', (action, filepath, target) ->
    grunt.log.writeln target + ': ' + filepath + ' has ' + action
    return

  grunt.registerTask 'app', (env) ->
    env = env or 'dev'

    grunt.config.set 'config.env', env

  grunt.task.registerTask 'dist', (env) ->
    env = env or 'dev'

    grunt.config.set 'config.env', env

    grunt.task.run 'build:' + env
    grunt.task.run 'copy:node_modules'
