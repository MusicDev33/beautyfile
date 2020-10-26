const cors = require('cors');
const express = require('express');
const fs = require('fs');
const https = require('https');
const path = require('path');
const nunjucks = require('nunjucks');
const sass = require('node-sass-middleware');
const SetAsyncExtension = require('nunjucks-setasync');
const rateLimit = require('express-rate-limit');
const FileMap = require('./file.map').fileMap;
const winston = require('winston');

require('dotenv-defaults').config();

const { exec } = require('child-process-async');
const execWrap = require('./exec-wrap').execWrap;
const userblock = require('./middleware/userblock');
const logger = require('./logger').logger;

const assetPath = path.resolve(__dirname, '../assets');
console.log(__dirname);

// Prevent DDoS
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100
});

const baseUrl = '/';
const port = 4020;

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

app.get('/:user', userblock, async (req, res, next) => {

  const totalPath = `${homePath}/${req.params.user}/.html`;

  const fileCheck = await execWrap(`file ${totalPath}`);

  if (fileCheck === null || fileCheck.stdout.includes('No such file or directory')) {
    logger.error(`User tried to access path '${totalPath}' and it failed.`);
    return res.render(__dirname + '/views/pages/dir-not-found.njk');
  }

  const { stdout, stderr } = await exec(`ls ${totalPath}`);

  if (stderr) {
    return res.render(__dirname + '/views/pages/dir-not-found.njk');
  }

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
      directories.push(item);
    } else {
      const splitName = item.split('.');

      const newFile = {
        name: item,
        icon: FileMap.get(splitName[splitName.length - 1].toLowerCase()) || 'fa-file-alt'
      }
      files.push(newFile);
    }
  }

  console.log(req.originalUrl);

  const payload = {
    id: req.params.filepath,
    path: req.params,
    user: req.params.user,
    dirs: directories,
    files: files,
    currentRoute: req.originalUrl.replace(/\/$/, ''),
    backDir: 'disabled',
    prevRoute: ''
  }

  // res.header("Content-Type",'application/json');
  // res.send(JSON.stringify(payload, null, 4));

  logger.info(`User successfully accessed path '${totalPath}'`);

  res.render(__dirname + '/views/pages/main.njk', payload);
});

app.get('/:user/:filepath*', userblock, async (req, res, next) => {

  const totalPath = `${homePath}/${req.params.user}/.html/${req.params.filepath}/${req.params[0]}`;

  const fileCheck = await execWrap(`file ${totalPath}`);

  if (fileCheck === null || fileCheck.stdout.includes('No such file or directory')) {
    logger.error(`User tried to access path '${totalPath}' and it failed.`);
    return res.render(__dirname + '/views/pages/dir-not-found.njk');
  }

  const isFile = fileCheck.stdout.split(':')[1].trim().toLowerCase() == 'directory' ? false : true;

  if (isFile) {
    return res.download(totalPath);
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
      directories.push(item);
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
