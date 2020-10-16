const cors = require('cors');
const express = require('express');
const fs = require('fs');
const https = require('https');
const path = require('path');
const nunjucks = require('nunjucks');
const sass = require('node-sass-middleware');
const SetAsyncExtension = require('nunjucks-setasync');
const rateLimit = require('express-rate-limit');

require('dotenv-defaults').config();

const { exec } = require('child-process-async');
const userblock = require('./middleware/userblock');

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

/*
app.use(baseUrl + 'scss', sass({
    src: path.join(__dirname, 'scss'),
    includePaths: ['scss', 'views'],
    dest: path.join(__dirname, '/../public/css'),
    debug: true,
    outputStyle: 'compressed',
    prefix:  '/css'  // Where prefix is at <link rel="stylesheets" href="prefix/style.css"/>
}));
*/

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
      files.push(item);
    }
  }

  console.log(req.originalUrl);

  const payload = {
    id: req.params.filepath,
    path: req.params,
    user: req.params.user,
    dirs: directories,
    files: files,
    currentRoute: req.originalUrl
  }

  // res.header("Content-Type",'application/json');
  // res.send(JSON.stringify(payload, null, 4));

  res.render(__dirname + '/views/pages/main.njk', payload);
});

app.get('/:user/:filepath*', userblock, async (req, res, next) => {

  const totalPath = `${homePath}/${req.params.user}/.html/${req.params.filepath}/${req.params[0]}`;

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
      files.push(item);
    }
  }

  console.log(req.originalUrl);

  const payload = {
    id: req.params.filepath,
    path: req.params,
    user: req.params.user,
    dirs: directories,
    files: files,
    currentRoute: req.originalUrl
  }

  // res.header("Content-Type",'application/json');
  // res.send(JSON.stringify(payload, null, 4));

  res.render(__dirname + '/views/pages/main.njk', payload);
});

app.listen(port, () => {
  console.log('Backend started on port ' + port);
});
