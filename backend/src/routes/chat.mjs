import { Router } from "express"
import Group from "../models/Group.mjs"
const chat = Router()
import isAuthenticated from "../configs/auth.mjs"
import User from "../models/User.mjs"

//Rota para página inicial da aplicação
chat.get('/chat', isAuthenticated, (req, res) =>{
    const dataUser = req.user
    Group.find()
    .populate('author', 'username')
    .then((dataGroups) => {
        User.findById(req.user._id)
        .populate('friendRequests', 'username email avatar')
        .then((user) => {
            User.find()
            .then((users) => {
                res.render('pages/chat', {
                    dataUser,
                    dataGroups,
                    user,
                    users
                })
            })
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
    .populate('members', 'username')
    .then((groupData) => {
        User.findById(req.user._id)
        .populate('friends', 'avatar username')
        .then((user) => {
            if(!groupData){
                req.flash('error_msg', 'Grupo não encontrado!')
                return res.redirect('/user/chat')
            }
    
            if(groupData.privacity === 'private' && !groupData.members.some(member => member._id.toString() === req.user._id.toString())){
                req.flash('error_msg', 'Este grupo é privado e você não faz parte dele!')
                return res.redirect('/user/chat')
            }

            // Filtra os amigos que ainda não estão no grupo
            const friendsNotInGroup = user.friends.filter(friend => 
                !groupData.members.some(member => member._id.equals(friend._id))
            )
            res.render('pages/group', {
                groupData,
                user,
                friendsNotInGroup
            })
        })
    })
    .catch((error) => {
        console.log('[debug]: ', error)
        req.flash('error_msg', 'Erro ao encotrar grupo.')
        res.redirect('/user/chat')
    })
})

//Rota para envio de solicitação de amizade
chat.post('/addFriend/:idUser', isAuthenticated, (req, res) => {
    const { idUser } = req.params
    const myId = req.user._id

    User.findByIdAndUpdate(idUser, {
        $addToSet: {friendRequests: myId}
    }, { new: true })
    .then(() => {

        const io = req.app.get('socketio')
        io.to(idUser.toString()).emit('friendRequest', { from: myId })

        req.flash('success_msg', 'Solicitação de amizade enviada com sucesso!')
        return res.redirect(req.headers.referer)
    })
    .catch((error) => {
        console.log('[debug]: Erro: ', error)
        req.flash('error_msg', 'Erro ao enviar solicitação de amizade')
        return res.redirect(req.headers.referer)
    })
})

//Rota para aceitar a amizade
chat.post('/acceptFriend/:idUser', isAuthenticated, (req, res) => {
    const { idUser } = req.params
    const myId = req.user._id

    User.findByIdAndUpdate(myId, {
        $pull: {friendRequests: idUser},
        $addToSet: {friends: idUser}
    } , {new: true})
    .then(() => {
        return User.findByIdAndUpdate(idUser, {
            $addToSet: {friends: myId}
        }, { new: true })
    })
    .then(() => {
        req.flash('success_msg', 'Agora vocês são amigos!')
        return res.redirect(req.headers.referer)
    })
    .catch((error) => {
        console.log('[debug]: Erro, ', error)
        req.flash('error_msg', 'Erro ao tentar aceitar solicitação!')
        return res.redirect(req.headers.referer)
    })
})

//Rota para recusar amizade
chat.post('/rejectFriend/:idUser', isAuthenticated, (req, res) => {
    const { idUser } = req.params
    const myId = req.user._id

    User.findByIdAndUpdate(myId, {
        $pull: { friendRequests: idUser }
    })
    .then(() => {
        req.flash('success_msg', 'Solicitação recusada')
        res.redirect(req.headers.referer)
    })
    .catch((error) => {
        req.flash('error_msg', 'Erro ao recusar solicitação!')
        res.redirect(req.headers.referer)
        console.log('[debug]: Error, ', error)
    })
})

//Rota para adicionar membro a um grupo
chat.post('/addMember/:userId', isAuthenticated, (req, res) => {
    const { userId } = req.params
    const { idGroup } = req.body

    Group.findByIdAndUpdate(idGroup, {
        $addToSet: { members: userId }
    }, { new: true })
    .then(() => {
        req.flash('success_msg', 'Membro adicionado com sucesso!')
        return res.redirect(req.headers.referer)
    })
    .catch((error) => {
        console.log('[debug]: Erro, ', error)
        req.flash('error_msg', 'Erro ao tentar adicionar membro!')
        return res.redirect(req.headers.referer)
    })
})


export default chat