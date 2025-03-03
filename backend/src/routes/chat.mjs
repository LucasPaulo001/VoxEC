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
    const { groupName, groupDescription, privacity, } = req.body
    const newGroup = new Group({
        groupName,
        groupDescription,
        privacity,
        author: req.user._id,
        members: [req.user._id]
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
chat.get('/group/:id', isAuthenticated, (req, res) => {
    const { id } = req.params
    Group.findById(id)
    .populate('members')
    .then((groupData) => {
        if(!groupData){
            req.flash('error_msg', 'Grupo não encontrado!')
            return res.redirect('/user/chat')
        }

        if(groupData.privacity === 'private' && !groupData.members.some(member => member._id.toString() === req.user._id.toString())){
            req.flash('error_msg', 'Este grupo é privado e você não faz parte dele!')
            return res.redirect('/user/chat')
        }
        res.render('pages/group', {groupData})
    })
    .catch((error) => {
        console.log('[debug]: ', error)
        req.flash('error_msg', 'Erro ao encotrar grupo.')
        res.redirect('/user/chat')
    })
})


export default chat