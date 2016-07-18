var gulp =          require('gulp'),
    less =          require('gulp-less'),
    connect =       require('gulp-connect'),
    processhtml =   require('gulp-processhtml'),
    rename =        require("gulp-rename"),
    concat =        require('gulp-concat'),
    gutil =         require('gulp-util'),
    del =           require('del'),
    path =          require('path'),
    jshint =        require('gulp-jshint'),
    changed =       require('gulp-changed'),
    runSequence =   require('run-sequence'),
    livereload =    require('gulp-livereload'),
    postcss =       require('gulp-postcss'),
    sourcemaps =    require('gulp-sourcemaps'),
    autoprefixer =  require('autoprefixer');

var data = {
    paths : {
        dist: 'dist',
        html: '.',
        assets: 'assets',
        shop_assets: '../assets'
    },

    vendors : {
        concat_js : [
            'bower_components/jquery/dist/*.min.js',
            'bower_components/bootstrap/dist/js/bootstrap.min.js'
        ],

        js : [
            'bower_components/jquery/dist/*.min.map',
        ],

        css : [
            'bower_components/bootstrap/dist/css/bootstrap.min.css',
        ],

        img : [
        ],

        fonts : [
            'bower_components/bootstrap/dist/fonts/*',
        ]
    },
};

var targets = {
    dev : {
        environment: 'dev',
        data: {
            assets: data.paths.assets + '/',
            shop_assets: data.paths.shop_assets + '/',
            header_class: 'header-full',
            navbar_class: 'navbar navbar-default navbar-header-full navbar-dark',
            navbar_brand_class: 'navbar-brand hidden-lg hidden-md hidden-sm',
            navbar_nav_class: 'nav navbar-nav'
        },
    },
};

var path_js = path.join(data.paths.dist, data.paths.assets, 'js'),
    path_css = path.join(data.paths.dist, data.paths.assets, 'css'),
    path_img = path.join(data.paths.dist, data.paths.assets, 'img'),
    path_fonts = path.join(data.paths.dist, data.paths.assets, 'fonts'),
    path_html = path.join(data.paths.dist, data.paths.html);

gulp.task('vendor', function() {
    gulp.src(data.vendors.concat_js)
        .pipe(concat("vendors.js"))
        .pipe(gulp.dest(path_js));

    gulp.src(data.vendors.js)
        .pipe(gulp.dest(path_js));

    gulp.src(data.vendors.css)
        .pipe(concat("vendors.css"))
        .pipe(gulp.dest(path_css));

    gulp.src(data.vendors.img)
        .pipe(gulp.dest(path_img));

    gulp.src(data.vendors.fonts)
        .pipe(gulp.dest(path_fonts));
});

gulp.task('less', function() {
    for (var color in data.colors) {
        gulp.src(['src/less/colors/' + data.colors[color] + '.less', 'src/less/reason.less'])
        .pipe(concat('style-' + data.colors[color] + '.less'))
        .pipe(less({
            paths: [path.join(__dirname, 'src', 'less')],
        }))
        .pipe(gulp.dest(path_css));
    }
});

gulp.task('less:dev', function() {
    gulp.src(['src/less/colors/blue.less', 'src/less/reason.less'])
        .pipe(changed(path.join(path_css)))
        .pipe(concat('style-blue.less'))
        .pipe(less({
            paths: [path.join(__dirname, 'src', 'less')],
            plugins: []

        }))
        .pipe(connect.reload())
        .pipe(gulp.dest(path_css));
});

gulp.task('autoprefixer', function () {
    return gulp.src(['dist/assets/css/**/*.css', '!dist/assets/css/vendors.css'])
        .pipe(sourcemaps.init())
        .pipe(postcss([ autoprefixer({ browsers: ['last 2 versions'] }) ]))
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest('dist/assets/css/'));
});

gulp.task('js', function() {
    return gulp.src('src/js/**/*.js')
        .pipe(changed(path.join(path_js)))
        .pipe(jshint())
        .pipe(jshint.reporter('default'))
        .pipe(gulp.dest(path_js));
});

gulp.task('html', function() {
    for (var target in targets) {
        if (target == 'dev')
            continue;
        gulp.src('src/html/*.html')
            .pipe(changed(path.join(path_html, targets[target].environment)))
            .pipe(processhtml({
                recursive: true,
                process: true,
                strip: true,
                environment: targets[target].environment,
                data: targets[target].data,
            }))
            .pipe(gulp.dest(path.join(path_html, targets[target].environment)));
    }
});

gulp.task('html:dev', function() {
    gulp.src(['src/html/**/*.html', '!src/html/layout/**/*'])
        .pipe(processhtml({
            recursive: true,
            process: true,
            strip: true,
            environment: targets.dev.environment,
            data: targets.dev.data,
        }))
        .pipe(gulp.dest(path.join(path_html)));
});

gulp.task('img', function() {
    gulp.src('src/img/**/*')
        .pipe(gulp.dest(path_img));
});

gulp.task('css', function() {
    gulp.src('src/css/**/*')
        .pipe(gulp.dest(path_css));
});

gulp.task('clean', function() {
    del.sync([
        path.join('.', data.paths.dist),
        path.join('.', 'tmp'),
    ]);
});

gulp.task('watch', function() {
    gulp.watch(['src/less/**/*.less'], ['less:dev']);
    gulp.watch(['src/js/**/*.js'], ['js']);
    gulp.watch(['src/html/**/*.html'], ['html:dev']);
    gulp.watch(['src/css/*.css'], ['css']);
    gulp.watch(['src/img/**/*(.jpg|.png|.gif|.jpeg)'], ['img']);
});

gulp.task('connect', function() {
    connect.server({
        root: 'dist',
        port: '8080',
        livereload: true,
    });
});



gulp.task('work', function() {
    runSequence(
        'dev',
        ['connect', 'watch']
    );
});

gulp.task('dev', function() {
    runSequence(
        'clean',
        ['vendor', 'less:dev', 'css', 'img', 'js', 'html:dev']
    );
});

gulp.task('default', function() {
    runSequence(
        'clean',
        ['vendor', 'less', 'css', 'img', 'js', 'html'],
        'autoprefixer'
    );
});