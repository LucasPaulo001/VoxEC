import { Router } from 'express'
import isAuthenticated from '../configs/auth.mjs'
import User from '../models/User.mjs'
const avatarRoute = Router()

avatarRoute.post('/avatar', isAuthenticated, (req, res) => {
    const { avatarUrl } = req.body
    const userId = req.user._id
    
    if(!avatarUrl){
        return res.status(400).json({ error: "Selecione um avatar!" })
    }

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