//Middleware: traitement de données de la requête
const express = require("express");

const applyMiddlewares = (app) => {
  app.use(express.json());
  app.use(express.urlencoded({ extended: false }));
};

module.exports = applyMiddlewares;