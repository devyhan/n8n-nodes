const { src, dest } = require('gulp');

// 아이콘 빌드 태스크
function buildIcons() {
  return src('*.svg')
    .pipe(dest('dist/'));
}

exports['build:icons'] = buildIcons;
