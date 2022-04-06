const mongoose = require("mongoose")
const schema = mongoose.Schema

const Usuario = new schema({
    nome: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    eAdmin: {
        type: Number,
        default: 0
        //QUANDO É 0 É USER NOMAL QUANDO FOR 1 É ADMIN
    },
    senha: {
        type: String,
        required: true
    }
})

mongoose.model("usuarios", Usuario)