import { Router } from "express"
import User from "../models/User.mjs"
import bcrypt from "bcryptjs"
const register = Router()

register.get('/register', (req, res) => {
    res.render('pages/register')
})

register.post('/register', (req, res) => {
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
            birth: birth
        })

        //Salvando usuário no banco de dados
        newUser.save()
        .then(() => {
            req.flash('success_msg', 'Cadastro realizado com sucesso!')
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

export default register