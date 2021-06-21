const cors = require('cors');
const express = require('express');
const fs = require('fs').promises;
const path = require('path');
const nunjucks = require('nunjucks');
const FileMap = require('./file.map').fileMap;
const canStart = require('./startup').checkArgs;

require('dotenv-defaults').config();

const { exec } = require('child-process-async');
const execWrap = require('./exec-wrap').execWrap;
const userblock = require('./middleware/userblock');
const logger = require('./logger').logger;

const assetPath = path.resolve(__dirname, '../assets');
console.log(__dirname);

const startObject = canStart();

const port = startObject.port;
const baseDir = startObject.dir;

const app = express();

let nunEnv = nunjucks.configure(__dirname + '/views', {
  autoescape: true,
  express: app
});

app.use(cors());

// Images can be retrieved with http://url/biotec/image/:imagename
require('./rsc-routes')(app);


// Pages

// Default browser behaviour fix

const homeDict = {
  'darwin': '/Users',
  'linux': '/home'
};

nunEnv.addGlobal(`BASE_URL`, process.env.NUNJUCKS_BASE_URL);

const homePath = homeDict[process.platform];

app.get('/:user', async (req, res, next) => {
  let totalPath = `${baseDir}/${req.params.user}`;
  console.log(totalPath);

  try {
    results = await fs.readdir(totalPath);
  } catch (e) {
    return res.json({success: false});
  }

  let files = [];
  let dirs = [];

  for (let file of results) {
    const stat = await fs.lstat(`${baseDir}/${req.params.user.replace(/\/$/, '')}/${file}`);

    if (stat.isFile()) {
      const splitName = file.split('.');

      const newFile = {
        name: file,
        icon: FileMap.get(splitName[splitName.length - 1].toLowerCase()) || 'fa-file-alt'
      }
      files.push(newFile);
    } else if (stat.isDirectory()) {
      const newDirectory = {
        name: file,
        link: file.trim().replace(' ', '%20')
      }
      dirs.push(newDirectory);
    } else {
      console.log('Error');
    }
  }

  const payload = {
    id: req.params.filepath,
    path: req.params,
    user: req.params.user,
    dirs: dirs,
    files: files,
    currentRoute: req.originalUrl.replace(/\/$/, ''),
    backDir: 'disabled',
    prevRoute: ''
  }

  logger.info(`User successfully accessed path '${totalPath}'`);

  res.render(__dirname + '/views/pages/main.njk', payload);

});

app.get('/:user/:filepath*', userblock, async (req, res, next) => {

  let totalPath = `${homePath}/${req.params.user}/.html/${req.params.filepath}/${req.params[0]}`;

  if (req.params.user == 'rkaundal' || req.params.user == 'roussie') {
    totalPath = `${homePath}/${req.params.user}/.psc6150/${req.params.filepath}/${req.params[0]}`;
  }

  if (totalPath.includes(' ')) {
    totalPath = `'${totalPath}'`;
  }

  const fileCheck = await execWrap(`file ${totalPath}`);

  if (fileCheck === null || fileCheck.stdout.includes('No such file or directory')) {
    logger.error(`User tried to access path '${totalPath}' and it failed.`);
    return res.render(__dirname + '/views/pages/dir-not-found.njk');
  }

  const isFile = fileCheck.stdout.split(':')[1].trim().toLowerCase() == 'directory' ? false : true;

  if (isFile) {
    return res.download(totalPath.substring(0, totalPath.length - 1));
  }

  const { stdout, stderr } = await exec(`ls ${totalPath}`);

  let contents = stdout.trim().split(/\r?\n/);
  contents = contents.filter((item) => {
    return item.length > 0;
  });

  const directories = [];
  const files = [];

  for (const item of contents) {
    let file = '';
    if (item.includes(' ')) {
      file = `'${path.join(totalPath, item)}'`;
    } else {
      file = path.join(totalPath, item);
    }

    const output = await exec(`file ${file}`);
    const isDirectory = output.stdout.split(':')[1].trim().toLowerCase();
    if (isDirectory == 'directory') {
      const newDirectory = {
        name: item,
        link: item.trim().replace(' ', '%20')
      }
      console.log(newDirectory.link);
      directories.push(newDirectory);
    } else {
      const splitName = item.split('.');

      const newFile = {
        name: item,
        icon: FileMap.get(splitName[splitName.length - 1]) || 'fa-file-alt'
      }
      files.push(newFile);
    }
  }

  const origUrl = req.originalUrl.replace(/\/$/, '');
  const splitRoute = origUrl.split('/');
  const routeEndLength = 0 - splitRoute[splitRoute.length - 1].length;
  const prevRoute = origUrl.slice(0, routeEndLength).replace(/\/$/, '');

  const payload = {
    id: req.params.filepath,
    path: req.params,
    user: req.params.user,
    dirs: directories,
    files: files,
    currentRoute: req.originalUrl.replace(/\/$/, ''),
    backDir: '',
    prevRoute
  }

  // res.header("Content-Type",'application/json');
  // res.send(JSON.stringify(payload, null, 4));

  logger.info(`User successfully accessed path '${totalPath}'`);

  res.render(__dirname + '/views/pages/main.njk', payload);
});

app.listen(port, () => {
  console.log('Backend started on port ' + port);
});
