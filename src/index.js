const cors = require('cors');
const express = require('express');
const fs = require('fs').promises;
const path = require('path');
const nunjucks = require('nunjucks');
const FileMap = require('./file.map').fileMap;
const canStart = require('./startup').checkArgs;

require('dotenv-defaults').config();

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

nunEnv.addGlobal(`BASE_URL`, process.env.NUNJUCKS_BASE_URL);

// Yes, I copy/pasted this. I'm not sorry.
app.get('/psc/:user', userblock, async (req, res, next) => {
  let totalPath = `/home/${req.params.user}/.psc`;
  console.log(totalPath);

  try {
    results = await fs.readdir(totalPath);
  } catch (e) {
    return res.json({success: false});
  }

  let files = [];
  let dirs = [];

  for (let file of results) {
    const stat = await fs.lstat(`/home/${req.params.user.replace(/\/$/, '')}/.psc/${file}`);
    console.log(file)

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
        link: file.trim().replace(' ', '%20').replace('psc/', '')
      }
      dirs.push(newDirectory);
    } else {
      console.log('Error');
    }
  }

  let currentRoute = req.originalUrl;


  const payload = {
    id: req.params.filepath,
    path: req.params,
    user: req.params.user,
    dirs: dirs,
    files: files,
    currentRoute: req.originalUrl.replace(/\/$/, '').replace('psc/', ''),
    backDir: 'disabled',
    prevRoute: ''
  }

  console.log(payload);

  logger.info(`User successfully accessed path '${totalPath}'`);

  res.render(__dirname + '/views/pages/main.njk', payload);
});

app.get('/psc/:user/:filepath*', userblock, async (req, res, next) => {
  let totalPath = `/home/${req.params.user}/.psc/${req.params.filepath}/${req.params[0]}`.replace(/\/$/, '');

  const stat = await fs.lstat(totalPath);

  if (stat.isFile()) {
    return res.download(totalPath);
  }

  try {
    results = await fs.readdir(totalPath);
  } catch (e) {
    return res.json({success: false});
  }

  let files = [];
  let dirs = [];

  for (let file of results) {
    const stat = await fs.lstat(`${totalPath}/${file}`);

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

  const origUrl = req.originalUrl.replace(/\/$/, '');
  const splitRoute = origUrl.split('/');
  const routeEndLength = 0 - splitRoute[splitRoute.length - 1].length;
  const prevRoute = origUrl.slice(0, routeEndLength).replace(/\/$/, '');

  const payload = {
    id: req.params.filepath,
    path: req.params,
    user: req.params.user,
    dirs: dirs,
    files: files,
    currentRoute: req.originalUrl.replace(/\/$/, '').replace('psc/', ''),
    backDir: '',
    prevRoute
  }

  console.log(payload);

  logger.info(`User successfully accessed path '${totalPath}'`);

  res.render(__dirname + '/views/pages/main.njk', payload);
});

app.get('/:user', userblock, async (req, res, next) => {
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

// TODO: Rewrite this whole thing
app.get('/:user/:filepath*', userblock, async (req, res, next) => {
  let totalPath = `${baseDir}/${req.params.user}/${req.params.filepath}/${req.params[0]}`.replace(/\/$/, '');

  const stat = await fs.lstat(totalPath);

  if (stat.isFile()) {
    return res.download(totalPath);
  }

  try {
    results = await fs.readdir(totalPath);
  } catch (e) {
    return res.json({success: false});
  }

  let files = [];
  let dirs = [];

  for (let file of results) {
    const stat = await fs.lstat(`${totalPath}/${file}`);

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

  const origUrl = req.originalUrl.replace(/\/$/, '');
  const splitRoute = origUrl.split('/');
  const routeEndLength = 0 - splitRoute[splitRoute.length - 1].length;
  const prevRoute = origUrl.slice(0, routeEndLength).replace(/\/$/, '');

  const payload = {
    id: req.params.filepath,
    path: req.params,
    user: req.params.user,
    dirs: dirs,
    files: files,
    currentRoute: req.originalUrl.replace(/\/$/, ''),
    backDir: '',
    prevRoute
  }

  logger.info(`User successfully accessed path '${totalPath}'`);

  res.render(__dirname + '/views/pages/main.njk', payload);
});

app.listen(port, () => {
  console.log('Backend started on port ' + port);
});
