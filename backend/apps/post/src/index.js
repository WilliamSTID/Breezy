const express=require("express");
const dotenv=require("dotenv");
const mongoose=require('mongoose');
const applyMiddlewares = require("./middlewares/post.middlewares");
dotenv.config();
const app=express();
const PORT = process.env.PORT||4006;


// Application des middlewares
applyMiddlewares(app);

//spécification des routes à aller récupérer
app.use("/posts", require("./routes/post.routes"));

//connexion avec la BDD mongoD via la bibliothèque Mongoose
mongoose
    .connect( process.env.MONGO_URI || 'mongodb://localhost:27017/breezy')
    .then(() => {
      app.listen(PORT, () => {
        console.log(`post service running on port ${PORT}`);
      });
    })
    .catch((err) => {
      console.error('Erreur lors de la connexion à MongoDB :', err);
    });