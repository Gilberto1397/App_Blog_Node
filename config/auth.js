// dentro desse arquivo será estruturado o sistema de autenticação

const localStrategy = require("passport-local").Strategy
const mongoose = require("mongoose")
const bcrypt = require("bcryptjs")
const passport = require("passport")

//model de usuário
require("../models/Usuario")
const Usuario = mongoose.model("usuarios")


module.exports = function(passaporte){
    passport.use(new localStrategy({usernameField: 'email', passwordField:"senha"}, (email, senha, done) => {
        Usuario.findOne({email: email}).then((Usuario) => {
            if (!Usuario) {
                return done(null, false, {message: "Esta conta não existe"})
            }

            bcrypt.compare(senha, Usuario.senha, (erro, batem) => {
                if (batem) {
                    return done(null, Usuario)
                }else{
                    return done(null, false, {message: "Senha incorreta"})
                }
            })
        })
    }))

    //Salvar dados do usuario na sessao
    passport.serializeUser((Usuario, done) => {
        done(null, Usuario.id)
    })

    passport.deserializeUser((id, done) => {
        Usuario.findById(id, (err, Usuario) => {
            done(err, Usuario)
        })
    })

}

