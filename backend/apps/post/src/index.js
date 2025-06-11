const express=require("express");

const dotenv=require("dotenv");
const applyMiddlewares = require("./middlewares/post.middlewares");
dotenv.config();
const connectDB = require("../../../post.db.js");
const app=express();
const port=3000;



//renseigner au seveur la connexion à la BDD MongoDB
connectDB();

// Application des middlewares
applyMiddlewares(app);



//spécification des routes à aller récupérer
app.use("/post",require("./routes/post.routes"));



//lancement du serveur
app.listen(port,()=>console.log(`Serveur lancé sur port ${port}`));

