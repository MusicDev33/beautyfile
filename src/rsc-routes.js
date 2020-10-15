const express = require('express');
const router = express.Router();
const path = require('path');
const baseUrl = process.env.BASE_URL;
const assetsBaseUrl = baseUrl + 'assets/'

const baseFilePath = path.join(__dirname, '/../assets/');

console.log(`Assets Path: ${assetsBaseUrl}`);
console.log(`Base File Path: ${baseFilePath}`);

module.exports = (app) => {
  app.use(assetsBaseUrl + 'fa/', express.static(baseFilePath + 'fa'));
  app.use(assetsBaseUrl + 'css/', express.static(baseFilePath + 'css'));
  app.use(assetsBaseUrl + 'kbl-css/', express.static(baseFilePath + 'kbl-css'));

  // app.use(baseUrl + 'public/css', express.static(path.join(__dirname, '/../public/css')));
}
