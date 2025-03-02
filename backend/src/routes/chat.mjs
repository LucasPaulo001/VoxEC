import { Router } from "express"
import Group from "../models/Group.mjs"
const chat = Router()
import isAuthenticated from "../configs/auth.mjs"

//Rota para página inicial da aplicação
chat.get('/chat', isAuthenticated, (req, res) =>{
    const dataUser = req.user
    Group.find()
    .populate('author', 'username')
    .then((dataGroups) => {
        res.render('pages/chat', {
            dataUser,
            dataGroups
        })
    })
})

//Rota para criação de grupos
chat.post('/createGroup', (req, res) => {
    const { groupName, groupDescription } = req.body
    const newGroup = new Group({
        groupName,
        groupDescription,
        author: req.user._id
    })
    newGroup.save()
    .then(() => {
        req.flash('success_msg', 'Grupo criado com sucesso!')
        res.redirect('/user/chat')
    })
    .catch((error) => {
        req.flash('error_msg', 'Erro ao tentar criar grupo, tente novamente!')
        res.redirect('/user/chat')
        console.log('[debug]: ', error)
    })
})

//Rota para chat do grupo
chat.get('/group/:id', (req, res) => {
    const { id } = req.params
    Group.findById(id)
    .then((groupData) => {
        res.render('pages/group', {groupData})
    })
})


export default chat