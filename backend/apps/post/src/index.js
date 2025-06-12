const express=require("express");
const dotenv=require("dotenv");
const mongoose=require('mongoose');
const applyMiddlewares = require("./middlewares/post.middlewares");
dotenv.config();
const app=express();
const port = process.env.PORT||3000; 
const MONGO_URI = process.env.MONGO_URI;




//renseigner au seveur la connexion à la BDD MongoDB

//connexion avec la BDD mongoD via la bibliothèque Mongoose




//fonction asynchrone pour recup info vers le serveur distant
const connectDB = async () => {
  try {
    await mongoose.connect(MONGO_URI, {
     
    });

    console.log(' MongoDB connecté avec succès');
  } catch (err) {
    console.error(' Erreur de connexion MongoDB :', err.message);
    process.exit(1); 
  }
};

connectDB();

// Application des middlewares
applyMiddlewares(app);



//spécification des routes à aller récupérer
app.use("/post",require("./routes/post.routes"));



//lancement du serveur
app.listen(port,()=>console.log(`Serveur lancé sur port ${port}`));

