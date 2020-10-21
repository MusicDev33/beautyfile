// Maps file extensions to their respective file images.
// Obviously the actual file type can be different from the extension,
// but I feel this is a good enough implementation.

let fileMap = new Map();

fileMap.set('pdf', 'fa-file-pdf');

const videoFormats = ['mp4', 'mov', 'wmv', 'flv', 'avi'];
const imageFormats = ['png', 'jpg', 'jpeg', 'bmp', 'gif', 'svg'];
const audioFormats = ['wav', 'mp3', 'flac', 'm4a', 'ogg'];
const codeFormats = [
  'py', 'pyc', 'cpp', 'c', 'h', 'java', 'class', 'js', 'ts', 'bash', 'php', 'r', 'html', 'css', 'scss'
];
const archiveFormats = ['zip', 'gz', 'iso', 'tar', '7z', 'rar'];

videoFormats.forEach((format) => {
  fileMap.set(format, 'fa-file-video');
});

imageFormats.forEach((format) => {
  fileMap.set(format, 'fa-file-image');
});

audioFormats.forEach((format) => {
  fileMap.set(format, 'fa-file-audio');
});

codeFormats.forEach((format) => {
  fileMap.set(format, 'fa-file-code');
});

archiveFormats.forEach((format) => {
  fileMap.set(format, 'fa-file-archive');
});

module.exports.fileMap = fileMap
