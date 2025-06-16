const mongoose=require('mongoose');
//Création d'un shema

const postSchema=mongoose.Schema(
    {
        message:{
            type:String,
            required:true,
            maxlength:280, //Limite de caractères pour le message
            trim:true,
        },
        author:{ 
            type:String,
          //  ref:"User", //Référence à l'utilisateur qui a créé le post
            required:true,
        },
        likers:{
      type: [mongoose.Schema.Types.ObjectId],
     // ref: "User",
      default: [],
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
   updatedAt: {
      type: Date,
    },
  },
  { timestamps: true }
);
module.exports=mongoose.model('post',postSchema); 