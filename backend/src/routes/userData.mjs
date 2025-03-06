import { Router } from 'express'
import isAuthenticated from '../configs/auth.mjs'
import User from '../models/User.mjs'
const data = Router()

//Rota para dados do perfil do usuário
data.get('/profile/:idUser', isAuthenticated, (req, res) => {
    //Pegando id da url
    const { idUser } = req.params

    //Buscando dados do usuário no banco de dados
    User.findById(idUser)
    .populate('friends', 'username email avatar')
    .then((user) => {
        if(!user){
            req.flash('error_msg', 'Usuário não encontrado!')
            return res.redirect('/user/chat')
        }
        res.render('pages/userData', {
            user: user
        })
    })
    .catch((error) => {
        console.log('[debug] Erro: ', error)
        req.flash('error_msg', 'Erro ao buscar usuário!')
        return res.redirect('/user/chat')
    })
})


export default data