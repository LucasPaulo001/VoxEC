import { Router } from "express"
import Group from "../models/Group.mjs"
const chat = Router()
import isAuthenticated from "../configs/auth.mjs"
import User from "../models/User.mjs"
import bcrypt from "bcryptjs"

//Rota para página inicial da aplicação
chat.get('/chat', isAuthenticated, (req, res) =>{
    //Pegando dados do usuário logado
    const dataUser = req.user
    //Buscando apenas grupos em que o usuário participa
    Group.find({members: req.user._id})
    //Populando os dados do author do grupo
    .populate('author', 'username')
    .then((dataGroups) => {
        //Buscando Dados do usuário logado no bd
        User.findById(req.user._id)
        //Populando os dados do usuário logado (amigos e solicitações de amizade)
        .populate('friendRequests', 'username email avatar')
        .populate('friends', 'username email avatar')
        .then((user) => {
            //Buscando apenas usuários que não são amigos do usuário logado para sugerir amizade
            User.find({_id: {$nin: [...user.friends, user._id]}})
            .select('username email avatar')
            .then((users) => {
                //Renderizando a view e passando os dados filtrados
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
    //Pegando dados do formulário
    const { groupName, groupDescription, privacity } = req.body
    //Criando novo grupo no banco de dados
    const newGroup = new Group({
        groupName,
        groupDescription,
        privacity,
        author: req.user._id,
        members: [req.user._id],
        admin: [req.user._id]
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
    //Pegando id do grupo do parâmetro da url
    const { id } = req.params
    //Buscando grupos a partir da id da url
    Group.findById(id)
    //Populando os membros, nome, id e avatar
    .populate('members', 'username _id')
    .populate('admin', 'username _id avatar')
    .then((groupData) => {
        //Buscando usuário logado a partir do id
        User.findById(req.user._id)
        //Populando dados dos amigos, para serem inseridos no grupo caso adicionados
        .populate('friends', 'avatar username')
        .then((user) => {
            if(!groupData){
                req.flash('error_msg', 'Grupo não encontrado!')
                return res.redirect('/user/chat')
            }
            //Protejendo grupo por meio de privacidade (funcionalidade parada no momento)
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
    //Pegando dados do usuário que receberá a solicitação
    const { idUser } = req.params
    //Pegando dados do usuário que mandará a solicitação
    const myId = req.user._id

    //Buscando usuário que recebe a solicitação e adicionando o user que mandou a solic. como pendente no bd
    User.findByIdAndUpdate(idUser, {
        $addToSet: {friendRequests: myId}
    }, { new: true })
    .then(() => {

        //Configurando socket para tratar da notificação de solicitação
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
    //Pegando id do usuário que mandou a solicitação
    const { idUser } = req.params
    //Pegando dados do usuário que vai aceitar a solicitação
    const myId = req.user._id

    //Buscando usuário que aceitou a solicitação e atualizando a situação no banco de dados
    User.findByIdAndUpdate(myId, {
        $pull: {friendRequests: idUser},
        $addToSet: {friends: idUser}
    } , {new: true})
    .then(() => {
        //Adicionando a amizade ao usuário que aceitou a solicitação
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
    //Pegando dados do usuário que mandou a solicitação
    const { idUser } = req.params
    //Pegando dados do usuário que recebeu a solicitação
    const myId = req.user._id

    //Atualizando situação no banco de dados, rejeitando o usuário de situação pendente
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
    //Pegando dados do usuário que será adicionado ao grupo a partir da url
    const { userId } = req.params
    //Pegando id do grupo do input do formulário
    const { idGroup } = req.body

    //Atualizando dados do grupo adicionando aos membros o novo usuário
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

//Rota para mudança de senha
chat.post('/modifyPass/:idUser', (req, res) => {
    const { idUser } = req.params
    const { password, passwordReap } = req.body

    //Autenticação das senhas
    if(password !== passwordReap){
        req.flash('error_msg', 'As senhas não coincidem!')
        console.log('Senhas não coincidem!')
        return res.redirect(req.headers.referer)
    }
    
    //Configuração de hash e salvamento de nova senha
    const roundSalts = 10
    bcrypt
    .hash(password, roundSalts)
    .then((newPass) => {
        //Atualizando dado de senha do usuário solicitante
        User.findByIdAndUpdate(idUser, {
            password: newPass
        }, { new: true })
        .then(() => {
            req.flash('success_msg', 'Senha alterada com sucesso!')
            return res.redirect(req.headers.referer)
        })
        .catch((error) => {
            console.log('[debug]: Erro: ', error)
            req.flash('error_msg', 'Erro ao tentar modificar a senha!')
            return res.redirect(req.headers.referer)
        })
    })
})

//Rota para mudança de nome de usuário
chat.post('/modifyName/:idUser', isAuthenticated, (req, res) => {
    const { idUser } = req.params
    const { newUsername } = req.body

    //Buscando usuário pela id
    User.findById(idUser)
    .then((user) => {
        //Verificando se o usuário consta no banco de dados
        if(!user){
            req.flash('error_msg', 'Usuário não encontrado!')
            return res.redirect(req.headers.referer)
        }

        //Buscando usuário pelo nome passado para autenticar se o nome já existe
        User.findOne({username: newUsername})
        .then((existName) => {
            if(existName){
                req.flash('error_msg', 'Nome de usuário já existe!')
                console.log('Nome existente!')
                return res.redirect(req.headers.referer)
            }

            //Atualizando dados do nome do usuário
            User.findByIdAndUpdate(user._id, {
                username: newUsername
            }, { new: true })
            .then(() => {
                req.flash('success_msg', 'Nome de usuário alterado com sucesso!')
                return res.redirect(req.headers.referer)
            })
            .catch((error) => {
                console.log('[debug] Erro: ', error)
                req.flash('error_msg', 'Erro ao tentar alterar nome de usuário!')
                return res.redirect(req.headers.referer)
            })
        })
        .catch((error) => {
            req.flash('error_msg', 'Erro ao buscar usuário!')
            console.log('[debug] Erro: ', error)
            return res.redirect(req.headers.referer)
        })
    })
})


export default chat