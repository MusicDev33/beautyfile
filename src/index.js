const cors = require('cors');
const express = require('express');
const fs = require('fs');
const https = require('https');
const path = require('path');
const nunjucks = require('nunjucks');
const sass = require('node-sass-middleware');
const SetAsyncExtension = require('nunjucks-setasync');
const rateLimit = require('express-rate-limit');

const { exec } = require('child-process-async');

const assetPath = path.resolve(__dirname, '../assets');
console.log(__dirname);

// Prevent DDoS
// This should be done on every application at KAABiL regardless of how much traffic we get
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100
});

const baseUrl = '/';
const port = 3000;

const app = express();
/*
let nunEnv = nunjucks.configure(__dirname + '/views', {
  autoescape: true,
  express: app
});
*/
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
// require('./rsc-routes')(app);


// Pages

// Default browser behaviour fix

app.get('/psc6150/:user/:filepath*', async (req, res, next) => {

  const totalPath = `/home/${req.params.user}/${req.params.filepath}/${req.params[0]}`;

  const { stdout, stderr } = await exec(`ls --group-directories-first ${totalPath}`);

  const contents = stdout.trim().split(/\r?\n/);

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

  const payload = {
    id: req.params.filepath,
    path: req.params,
    user: req.params.user,
    dirs: directories,
    files: files
  }

  res.header("Content-Type",'application/json');
  res.send(JSON.stringify(payload, null, 4));
});

app.listen(port, () => {
  console.log('Backend started on port ' + port);
});
