//Carregando módulos
const express = require('express')
const handlebars = require('express-handlebars')
const mongoose = require("mongoose")
const app = express()
const admin = require("./routes/admin")
const path = require("path")
var bodyParser = require("body-parser")
const session = require("express-session")
const flash = require("connect-flash") // tipo de sessão que só aparece uma vez
require("./models/Postagem")
const Postagem = mongoose.model("postagens")
require("./models/Categoria")
const Categoria = mongoose.model("categorias")
const usuarios = require("./routes/usuario")
require("./config/auth")("passaporte")
const passport = require("passport")

//Configurações
    //Sessoes - app.use = criação e configuração de middleware
    app.use(session({           //config da sessão
        secret: "cursodenode",
        resave: true,
        saveUninitialized: true
    }))

    //Definição do Passport - importante que seja entre a config de sessoes e do flash
    app.use(passport.initialize())
    app.use(passport.session())
    app.use(flash())
    
    //Config do flash
        app.use(flash())
    
    //Middleware
        app.use((req, res, next) => {
            res.locals.success_msg = req.flash("success_msg") // variavel global para usar em qualquer parte do sistema ( res.locals.nomequeuiser) 
            res.locals.error_msg = req.flash("error_msg")
            res.locals.error = req.flash("error")
            res.locals.user = req.user || null
            next()
        })        

    //Body-Parser Config -- ATRAVÉS DO PRÓPRIO EXPRESS SEM NECESSIDADE DE BODY PARSER
    app.use(bodyParser.json())
    app.use(bodyParser.urlencoded({ extended: true}))
    //Config do handlebars
    //Template Engine
    app.engine('handlebars', handlebars({defaultLayaout: 'main'}))
    app.set('view engine', 'handlebars')
    //Mongoose
    mongoose.Promise = global.Promise; // Sempre por esta linha
        mongoose.connect("mongodb://localhost/blogapp").then(() => {
            console.log("Conectado ao mongo")
        }).catch((err) => {
            console.log("Erro ao se conectar" + err)
        })

    //Public
    app.use(express.static(path.join(__dirname, "public")))        
        //Middleware - MUITO USADO NO SISTEMA DE AUTENTICAÇÃO
       /*  app.use((req, res, next) => {
            console.log("Olá, sou um Middleware");
            next()
        }) */

//Rotas - chamar abaixo das configurações
    app.use('/admin', admin)

    app.get('/', (req, res) => {
        Postagem.find().populate("categoria").sort({data: "desc"}).lean().then((postagens) => {
            res.render("index", {postagens:postagens})
        }).catch((err) => {
            req.flash("error_msg", "Houve um erro interno")
            res.redirect("/404")
        })
    })

    app.get("/404", (req, res) => {
        res.send('Erro 404!')
    })

    app.get("/postagem/:slug", (req, res) => {
        Postagem.findOne({slug: req.params.slug}).lean().then((postagem) => {
            if (postagem) {
                res.render("postagem/index", {postagem:postagem})
            }else{
                req.redirect("/")
                req.flash("error_msg", "Esta postagem não existe")
            }
        })
    })

    app.get("/categorias", (req, res) => {
        Categoria.find().lean().then((categorias) => {
            res.render("categorias/index", {categorias:categorias})
        }).catch((err) => {
            req.flash("error_msg", "Erro ao listar categorias")
            res.redirect("/")
        })
    })

    app.get("/categorias/:slug", (req, res) => {
        Categoria.findOne({slug: req.params.slug}).then((categoria) => {
            if (categoria) {
                Postagem.find({categoria: categoria._id}).lean().then((postagens) => {
                    res.render("categorias/postagens", {postagens: postagens, categoria: categoria})
                }).catch((err) => {
                    req.flash("error_msg", "Erro ao listar post")
                    res.redirect("/")
                })
            }else{
                req.flash("error_msg", "Esta categoria não existe")
                res.redirect("/")
            }
        }).catch((err) => {
            req.flash("error_msg", "Erro interno ao carregar a página desta categoria")
            res.redirect("/")
        })
    })

    app.use("/usuarios", usuarios)

//Outros
const PORT = 8081
app.listen(PORT,() => {
    console.log("Servidor rodando" );
})