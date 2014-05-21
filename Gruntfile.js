// Обязательная обёртка
module.exports = function(grunt) {

    // Задачи
    grunt.initConfig({
        // Склеиваем
        concat: {
            js: {
                src: [
                    'js/app.js',
                    'js/**/*.js'  // Все JS-файлы в папке
                ],
                dest: 'build/scripts.js'
            },
			css: {
                src: [
                    //'js/libs/jquery.js',
                    'css/**/*.css'  // Все JS-файлы в папке
                ],
                dest: 'build/styles.css'
            }
        },
        // Сжимаем
        uglify: {
            main: {
                files: {
                    // Результат задачи concat
                    'build/scripts.min.js': 'build/scripts.ngmin.js'
                }
            }
        },
		ngmin: {
			main: {
                files: {
                    // Результат задачи concat
                    'build/scripts.ngmin.js': '<%= concat.js.dest %>'
                }
			}
		},
		cssmin: {
			combine: {
				files: {
				  'build/style.min.css': 'css/**/*.css'
				}
			}
		},
		watch: {
			concat: {
				files: ['<%= concat.js.src %>', '<%= concat.css.src %>'],
				tasks: ['concat']  // Можно несколько: ['lint', 'concat']
			}
		}
    });

    // Загрузка плагинов, установленных с помощью npm install
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.loadNpmTasks('grunt-contrib-cssmin');
	grunt.loadNpmTasks('grunt-ngmin');

    // Задача по умолчанию
    grunt.registerTask('default', ['concat', 'ngmin', 'uglify']);
};