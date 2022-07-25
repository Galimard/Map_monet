"use strict";

import src from 'gulp';
import dest from 'gulp';
import gulp from 'gulp';
import autoprefixer from 'gulp-autoprefixer';
import cssbeautify from 'gulp-cssbeautify';
import removeComments from 'gulp-strip-css-comments';
import rename from 'gulp-rename';
import sass from 'gulp-sass';
import cssnano from 'gulp-cssnano';
import uglify from 'gulp-uglify';
import plumber from 'gulp-plumber';
import panini from 'panini';
import imagemin from 'gulp-imagemin';
import del from 'del';
import notify from 'gulp-notify';
import webpack from 'webpack';
import webpackStream from 'webpack-stream';
import flatten from 'gulp-flatten';
import concat from 'gulp-concat-css';
import replace from 'gulp-replace';
import { create as bsCreate } from 'browser-sync';
import header from 'gulp-header';
import footer from 'gulp-footer';
const browserSync = bsCreate();

/* Paths */
const srcPath = 'src/';
const distPath = 'dist/';

const path = {
    build: {
        php: distPath + "php/", /* Если не хотим чтобы проект лежал в папке public - убираем */
        html: distPath + "public/", /* Если не хотим чтобы проект лежал в папке public - убираем */
        js: distPath + "assets/js/",
        vendor: distPath + "assets/js/vendor/",
        dist: distPath + "assets/js/dist/",
        css: distPath + "assets/css/",
        images: distPath + "assets/images/",
        fonts: distPath + "assets/fonts/"
    },
    src: {
        html: srcPath + "public/**/*.html",
        js: srcPath + "assets/js/*.js",
        vendor: srcPath + "assets/js/vendor/*.js",
        dist: srcPath + "assets/js/dist/*.js",
        css: srcPath + "assets/scss/*.scss",
        images: srcPath + "assets/images/**/*.{jpg,png,svg,gif,ico,webp,webmanifest,xml,json}",
        fonts: srcPath + "assets/fonts/**/*.{eot,woff,woff2,ttf,svg}"
    },
    watch: {
        html: srcPath + "public/**/*.html",
        js: srcPath + "assets/js/**/*.js",
        vendor: srcPath + "assets/js/vendor/*.js",
        dist: srcPath + "assets/js/dist/*.js",
        css: srcPath + "assets/scss/**/*.scss",
        images: srcPath + "assets/images/**/*.{jpg,png,svg,gif,ico,webp,webmanifest,xml,json}",
        fonts: srcPath + "assets/fonts/**/*.{eot,woff,woff2,ttf,svg}"
    },
    clean: [
        "./" + distPath,
    ]
}



/* Tasks */

const serve = () => {
    browserSync.init({
        server: {
            baseDir: "./" + distPath
        }
    });
}

const scripts = () => {
    return gulp
        .src(srcPath + 'partials/scripts.html', { base: srcPath })
        .pipe(plumber())
        .pipe(flatten({ 
            subPath: [1],
        }))
        .pipe(rename({
            // dirname: "main/text/ciao",
            // prefix: "__footer",
            // suffix: "-hola",
            basename: "__footer_scripts",
            extname: ".php"
        }))
        .pipe(header('<?php\nuse Bitrix\\Main\\Page\\Asset;\n\n'))
        .pipe(replace(
            /<script src=("|')http(.+)("|')(><\/script>)/g, 
            'Asset::getInstance()->addJs("http$2");'))
        .pipe(replace(
            /<script src=("|')\/assets\/(.+)("|')(><\/script>)/g, 
            'Asset::getInstance()->addJs(SITE_TEMPLATE_PATH . "/assets/$2");'))
        .pipe(footer('\n?>'))
        .pipe(gulp.dest(distPath))
}

export const _php = (cb) => {
    panini.refresh();
    return gulp
        .src(path.src.html, { base: srcPath })
        .pipe(plumber())
        .pipe(panini({
            root: srcPath + 'public/',
            layouts: srcPath + 'php/layouts/',
            partials: srcPath + 'php/partials/',
            helpers: srcPath + 'helpers/',
            data: srcPath + 'data/'
        }))
        .pipe(flatten({ subPath: [1] }))
        .pipe(rename({
            // dirname: "main/text/ciao",
            // basename: "aloha",
            // prefix: "bonjour-",
            // suffix: "-hola",
            extname: ".php"
        }))
        .pipe(replace(/((\.{2})?(\/))+assets/g, '<?= SITE_TEMPLATE_PATH ?>/assets'))
        .pipe(replace(/(href=)("|')(.+)(\.html)("|')/g, "$1$2$3.php$5"))
        // .pipe(replace(/(background:)(.+)(\/assets)/g, '$1$2<?= SITE_TEMPLATE_PATH ?>/assets'))
        .pipe(gulp.dest(path.build.php))
        .pipe(browserSync.reload({ stream: true }));

    cb();
}

const index = () => {
    return gulp
        .src(srcPath + 'index.html', { base: srcPath })
        .pipe(gulp.dest(distPath))
}

export const html = (cb) => {
    panini.refresh();
    return gulp
        .src(path.src.html, { base: srcPath })
        .pipe(plumber())
        .pipe(panini({
            root: srcPath + 'public/',
            layouts: srcPath + 'layouts/',
            partials: srcPath + 'partials/',
            helpers: srcPath + 'helpers/',
            data: srcPath + 'data/'
        }))
        .pipe(flatten({ subPath: [1] }))
        .pipe(gulp.dest(path.build.html))
        .pipe(browserSync.reload({ stream: true }));

    cb();
}

export const css = (cb) => {
    return gulp.src(path.src.css, { base: srcPath + "assets/scss/" })
        .pipe(plumber({
            errorHandler: function (err) {
                notify.onError({
                    title: "SCSS Error",
                    message: "Error: <%= error.message %>"
                })(err);
                this.emit('end');
            }
        }))
        .pipe(sass({
            includePaths: './node_modules/'
        }))
        .pipe(autoprefixer({
            cascade: true
        }))
        .pipe(cssbeautify())
        .pipe(gulp.dest(path.build.css))
        .pipe(cssnano({
            zindex: false,
            discardComments: {
                removeAll: true
            }
        }))
        .pipe(removeComments())
        .pipe(rename({
            suffix: ".min",
            extname: ".css"
        }))
        .pipe(gulp.dest(path.build.css))
        .pipe(browserSync.reload({ stream: true }));

    cb();
}

export const cssWatch = (cb) => {
    return gulp.src(path.src.css, { base: srcPath + "assets/scss/" })
        .pipe(plumber({
            errorHandler: function (err) {
                notify.onError({
                    title: "SCSS Error",
                    message: "Error: <%= error.message %>"
                })(err);
                this.emit('end');
            }
        }))
        .pipe(sass({
            includePaths: './node_modules/'
        }))
        .pipe(rename({
            suffix: ".min",
            extname: ".css"
        }))
        .pipe(gulp.dest(path.build.css))
        .pipe(browserSync.reload({ stream: true }));

    cb();
}

export const cssReplaceAbsolute = (cb) => {
    return gulp.src(['./dist/assets/css/**/*.css'])
        .pipe(replace("../", "/assets/"))
        .pipe(gulp.dest(path.build.css));
}

export const js = (cb) => {
    return gulp.src(path.src.js, { base: srcPath + 'assets/js/' })
        .pipe(plumber({
            errorHandler: function (err) {
                notify.onError({
                    title: "JS Error",
                    message: "Error: <%= error.message %>"
                })(err);
                this.emit('end');
            }
        }))
        .pipe(webpackStream({
            mode: "production",
            output: {
                filename: 'app.js',
            },
            module: {
                rules: [
                    {
                        test: /\.(js)$/,
                        exclude: /(node_modules)/,
                        loader: 'babel-loader',
                        query: {
                            presets: ['@babel/preset-env']
                        }
                    }
                ]
            }
        }))
        // .pipe(replace(/((\.{2})?(\/))+assets/g, '<?= SITE_TEMPLATE_PATH ?>/assets'))
        .pipe(gulp.dest(path.build.js))
        .pipe(browserSync.reload({ stream: true }));

    cb();
}

const jsWatch = (cb) => {
    return gulp.src(path.src.js, { base: srcPath + 'assets/js/' })
        .pipe(plumber({
            errorHandler: function (err) {
                notify.onError({
                    title: "JS Error",
                    message: "Error: <%= error.message %>"
                })(err);
                this.emit('end');
            }
        }))
        .pipe(webpackStream({
            mode: "development",
            output: {
                filename: 'app.js',
            },
            module: {
                rules: [
                    {
                        test: /\.(js)$/,
                        exclude: /(node_modules)/,
                        loader: 'babel-loader',
                        query: {
                            presets: ['@babel/preset-env']
                        }
                    }
                ]
            }
        }))
        .pipe(gulp.dest(path.build.js))
        .pipe(browserSync.reload({ stream: true }));

    cb();
}

const jsVendor = () => {
    return gulp.src(path.src.vendor, { base: srcPath + 'assets/js/vendor' })
        .pipe(gulp.src('vendor/*.js'))
        .pipe(gulp.dest(path.build.vendor))

        // .pipe(uglify())
        // .pipe(gulp.dest(path.build.vendor));
}

const jsDist = () => {
    return gulp.src(path.src.dist, { base: srcPath + 'assets/js/dist' })
        .pipe(gulp.src('dist/*.js'))
        .pipe(gulp.dest(path.build.dist));
}

const audio = () => {
    return gulp
        .src(srcPath + "assets/audio/*.mp3", { base: srcPath + 'assets/audio' })
        .pipe(gulp.dest(distPath + "assets/audio/"));
}

export const images = (cb) => {
    return gulp.src(path.src.images)
        .pipe(imagemin([
            imagemin.gifsicle({ interlaced: true }),
            // imagemin.mozjpeg({ quality: 95, progressive: true }),
            // imagemin.optipng({ optimizationLevel: 5 }),
            imagemin.svgo({
                plugins: [
                    { removeViewBox: true },
                    { cleanupIDs: false }
                ]
            })
        ]))
        .pipe(gulp.dest(path.build.images))
        .pipe(browserSync.reload({ stream: true }));

    cb();
}

export const fonts = (cb) => {
    return gulp.src(path.src.fonts)
        .pipe(gulp.dest(path.build.fonts))
        .pipe(browserSync.reload({ stream: true }));

    cb();
}

export const clean = (cb) => {
    return del(path.clean);

    cb();
}

const watchFiles = () => {
    gulp.watch([srcPath + 'index.html'], index);
    gulp.watch([srcPath + 'assets/audio/'], audio);
    gulp.watch([path.watch.html], html);
    gulp.watch([path.watch.css], cssWatch);
    gulp.watch([path.watch.js], jsWatch);
    gulp.watch([path.watch.vendor], jsVendor);
    gulp.watch([path.watch.dist], jsDist);
    gulp.watch([path.watch.images], images);
    gulp.watch([path.watch.fonts], fonts);
}

/* Собирает файлы для 1С Битрикс*/
export const build = gulp.series(clean, gulp.parallel(html, index, audio, css, js, jsVendor, jsDist, images, fonts));
export const php = gulp.series(gulp.parallel(scripts, _php));

/* Собирает файлы для Разработки и запускает watcher*/
export const dev = gulp.series(clean, gulp.parallel(html, css, js, images, fonts), cssReplaceAbsolute);
export const watch = gulp.parallel(build, watchFiles, serve);
export default watch;
