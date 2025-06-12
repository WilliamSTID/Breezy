//connexion avec la BDD mongoD via la bibliothèque Mongoose
const mongoose=require('mongoose');
const MONGO_URI = process.env.MONGO_URI;


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

module.exports=connectDB;
