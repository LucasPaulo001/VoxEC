import { Router } from 'express'
import isAuthenticated from '../configs/auth.mjs'
import User from '../models/User.mjs'
const avatarRoute = Router()

//Rota para adicionar avatar
avatarRoute.post('/avatar', isAuthenticated, (req, res) => {
    //Pegando dados (url) do avatar do frontend
    const { avatarUrl } = req.body
    //Pegando dados do usuário
    const userId = req.user._id
    
    if(!avatarUrl){
        return res.status(400).json({ error: "Selecione um avatar!" })
    }

    //Buscando usuário pelo id e atualizando o campo avatar com a url do avatar escolhido
    User.findByIdAndUpdate(userId, {avatar: avatarUrl}, { new: true })
    .then((user) => {
        if(!user){
            res.status(404).json({error: "Usuário não encontrado"})
        }
        res.json({ success: "Avatar atualizado com sucesso!", avatar: user.avatar })
    })
    .catch(error => {
        console.error("Erro ao atualizar avatar:", error)
        res.status(500).json({ error: "Erro no servidor" })
    })
    
})


export default avatarRoute