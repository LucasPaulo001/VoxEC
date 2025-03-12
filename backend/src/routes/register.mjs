import { Router } from "express"
import User from "../models/User.mjs"
import bcrypt from "bcryptjs"
import nodemailer from "nodemailer"
import crypto from "crypto"
const register = Router()
import dotenv from "dotenv"
dotenv.config()

//Rota que renderiza a viw de registro
register.get('/register', (req, res) => {
    res.render('pages/register')
})

//Rota para se registrar
register.post('/register', (req, res) => {
    //Pegando dados do formulário
    const { username, email, password, passwordRep, birth } = req.body

    //Validações
    if(password != passwordRep){
        req.flash('error_msg', 'As senhas não coincidem!')
        return res.redirect(req.headers.referer)
    }
    if(password.length < 6){
        req.flash('error_msg', 'A senha tem que ter no mínimo seis caracteres!')
        return res.redirect(req.headers.referer)
    }

    //Gerando tokken de verificação
    const token = crypto.randomBytes(32).toString('hex')

    //Criptografia de senha
    const saultRounds = 10
    bcrypt
    .hash(password, saultRounds)
    .then((hash) => {
        //Criando usuário no banco de dados
        const newUser = new User({
            username: username,
            email: email,
            password: hash,
            birth: birth,
            tokenVerificacao: token,
            emailVerificado: false
        })

        //Salvando usuário no banco de dados
        newUser.save()
        .then((newUser) => {
            const transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: {
                    user: process.env.EMAIL_USER,
                    pass: process.env.PASS_USER
                }
            })

            //Gerando link de verificação
            const link = `https://voxec.onrender.com/user/verifyEmail/${token}`

            //Conteúdo do email
            const mailOption = {
                from: process.env.EMAIL_USER,
                to: newUser.email,
                subject: 'Confirmação de E-mail',
                text: `Olá, ${newUser.username}, seja bem vido à VoxEC\n\nPara validar seu E-mail clique no link logo abaixo, é rápido! 😀\n\n${link}\n\nApós validar você já pode fazer o seu login, nos vemos por lá!`
            }

            //Enviando email
            return transporter.sendMail(mailOption)
        })
        .then(() => {
            req.flash('success_msg', 'Cadastro realizado com sucesso, verifique seu E-mail para validar sua conta!')
            return res.redirect('/')
        })
        .catch((error) =>{
            req.flash('error_msg', 'Erro ao tentar se cadastrar, tente novamente!')
            console.log(error)
            res.redirect(req.headers.referer)
        })
    })
    .catch((error) =>{
        console.log(`Erro ao tentar criptografar senha: ${error}`)
    })
})

//Rota para validação de tokken
register.get('/verifyEmail/:token', (req, res) => {
    //Pegando token da url
    const {token} = req.params

    //Buscando usuário pelo token
    User.findOne({tokenVerificacao: token})
    .then((usuario) => {
        if(!usuario){
            return res.status(400).send('Link de validação inválido ou expirado!')
        }
        usuario.emailVerificado = true
        usuario.tokenVerificacao = null

        return usuario.save()
    })
    .then(() => {
        res.send('email validado com sucesso!')
    }).catch((error) => {
        console.log(`erro: ${error}`)
        if(!res.hasHeader){
            res.status(500).send(`Erro ao validar e-mail ERRO: ${error}`)
        }  
    })
})

export default register