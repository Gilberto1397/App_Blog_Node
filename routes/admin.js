const express = require("express")
const router = express.Router()
const mongoose = require("mongoose")
require("../models/Categoria")
const Categoria = mongoose.model("categorias")
require("../models/Postagem")
const Postagem = mongoose.model("postagens")
const {eAdmin} = require("../helpers/eAdmin")

//rota princpal painel adm
router.get('/', (req, res) => {
    //res.send("Página principal do painel ADM")
    res.render("admin/index")
})

router.get('/posts', (req, res) => {
    res.send("Página de posts")
}) 

//Rota que vai receber o formulário de adicionar categorias
router.get('/categorias/add', (req,res) => {
    res.render("admin/addcategorias")
})

router.get('/categorias', eAdmin, (req,res) => {

    Categoria.find().sort({date:'desc'}).lean().then((categorias) => {

        res.render('admin/categorias.handlebars',{categorias:categorias});
        console.log(categorias);

    }).catch((err) => {
        req.flash('error_msg',"Houve um erro ao listar as categorias"+err);
        res.redirect('http://localhost:8080/admin');

    });
});

//Guardando o nome e a slug dentro da variavel novaCategoria
router.post("/categorias/nova", (req, res) => {

    //Validação das informações colocadas no form
        var erros = []
        
        if (!req.body.nome || typeof req.body.nome == undefined || req.body.nome == null) {
            erros.push({texto: "Nome inválido"})
        }

        if (!req.body.slug || typeof req.body.slug == undefined || req.body.nome == null) {
            erros.push({texto: "Slug inválido"})
        }

        if (req.body.nome.length < 2) {
            erros.push({texto: "Nome de categoria muito pequeno"})
        }

        if (erros.length > 0) {
            res.render("admin/addcategorias", {erros: erros})
        }else{
            const novaCategoria = {
                nome: req.body.nome,
                slug: req.body.slug
            }
    
            //Slug é o link da categoria
            new Categoria(novaCategoria).save().then(() => {
                //console.log("Categoria salva com sucesso");
                req.flash("success_msg", "Categoria criada com sucesso")
                res.redirect("/admin/categorias")
            }).catch((err) => {
                req.flash("error_msg", "Erro ao salvar categoria")
                //console.log("Erro ao salvar categoria"+ err);
                res.redirect("/admin")
            })     
        }
          
})
        //EDIÇÃO
        router.get("/categorias/edit/:id", (req, res) => {
            Categoria.findOne({_id:req.params.id}).then((categoria) => {
                res.render("admin/editcategorias", {categoria: categoria})
            }).catch((err) => {
                req.flash("error_msg", "Categoria inexistente")
                res.redirect("/admin/categorias")
            })
        })

        //DELETANDO
        router.post("/categorias/deletar", (req, res) => {
            Categoria.remove({_id: req.body.id}).then(() => {
                req.flash("success_msg", "Categoria deletada")
                res.redirect("/admin/categorias")
            })
        })

        router.get("/postagens", (req, res) => {
            Postagem.find().populate("categoria").sort({data:"desc"}).lean().then((postagens) => {
                res.render("admin/postagens", {postagens: postagens})
            }).catch((err) => {
                req.flash("error_msg", "Houve um erro ao listar as postagens")
                res.redirect("/admin")
            })
        })

        router.get("/postagens/add", (req, res) => {
            Categoria.find().sort({date:'desc'}).lean().then((categorias) => {

                res.render("admin/addpostagem",{categorias:categorias});
                console.log(categorias);
        
            }).catch((err) => {
                req.flash("error_msg", "Houve um erro ao carregar formulário")
                res.redirect("/admin")
            })
        })

        router.post("/postagens/nova", (req, res) => {
            var erros = []

            if(req.body.categoria == "0"){
                erros.push({texto: "Categoria inválida, resgistre uma categoria!"})
            }
            if (erros.length > 0) {
                res.render("admin/addpostagem", {erros: erros})
            }else{
                const novaPostagem = {
                    titulo: req.body.titulo,
                    descricao: req.body.descricao,
                    conteudo: req.body.conteudo,
                    categoria: req.body.categoria,
                    slug: req.body.slug
                }
                new Postagem(novaPostagem).save().then(() => {
                    req.flash("success_msg", "Postagem criada com sucesso!")
                    res.redirect("/admin/postagens")
                }).catch((err) => {
                    req.flash("error_msg", "Houve um erro durante o salvamento da postagem" + err)
                    res.redirect("/admin/postagens")
                })
            }
        })

                //Edição de postagem
                router.get("/postagens/edit/:id", (req, res) => {

                    Postagem.findOne({_id: req.params.id}).lean().then((postagem) => {

                        Categoria.find().lean().then((categorias) => {
                            res.render("admin/editpostagens", {categorias: categorias, postagem: postagem})

                        }).catch((err) => {
                            req.flash("error_msg", "Erro ao listar categorias")
                            req.redirect("/admin/postagens")
                        })

                    }).catch((err) => {
                        req.flash("error_msg", "Erro ao carregar edição")
                        res.redirect("/admin/postagens")
                    })

                })

                router.get("/postagens/deletar/:id", (req, res) => {
                    Postagem.remove({_id: req.params.id}).then(() => {
                        req.flash("success_msg", "Postagem deletada!")
                        res.redirect("/admin/postagens")
                    }).catch((err) => {
                        req.flash("error_msg", "Houve um erro ao tentar deletar")
                        res.redirect("/admin/postagens")
                    })
                })

                router.post("/postagem/edit", (req, res) => {

                    Postagem.findOne({_id: req.body.id}).then((postagem) => {
                        
                        postagem.titulo = req.body.titulo
                        postagem.slug = req.body.slug
                        postagem.descricao = req.body.descricao
                        postagem.conteudo = req.body.conteudo
                        postagem.categoria = req.body.categoria

                        postagem.save().then(() => {
                            req.flash("success_msg", "Postagem editada com sucesso!")
                            res.redirect("/admin/postagens")
                        }).catch((err) => {
                            req.flash("error_msg", "Erro interno")
                            res.redirect("/admin/postagens")
                        })
                    })
                })

module.exports = router