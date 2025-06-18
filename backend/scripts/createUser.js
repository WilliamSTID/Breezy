const mongoose = require("mongoose");
const User = require("../apps/userAccount/src/models/user.js");
const { faker } = require('@faker-js/faker');

const  NOMBRE_COMPTE_A_CREER = 50

// Connexion à MongoDB
mongoose
    .connect(process.env.MONGO_URI || 'mongodb://localhost:27017/breezy')
    .then(() => {
        console.log("Connecté à MongoDB !");
        genererComptes(NOMBRE_COMPTE_A_CREER); // Exemple : Génère 10 comptes
    })
    .catch(err => console.error(err));

// Fonction pour générer X comptes
async function genererComptes(nombre) {
  for (let i = 0; i < nombre; i++) {
    const user = new User({
      username: faker.internet.username(),
      email:    faker.internet.email(),
      password: faker.internet.password(8)   // min-length 8
      // bio:      faker.lorem.sentence(),
      // avatar:   faker.image.avatar()
    });

    try {
      await user.save();
      console.log(`Utilisateur ${user.username} créé !`);
    } catch (err) {
      console.error(`Erreur pour ${user.username}: ${err.message}`);
    }
  }

  console.log("Génération terminée !");
  mongoose.connection.close();
}
