import { Router } from 'express'
import isAuthenticated from '../configs/auth.mjs'
import User from '../models/User.mjs'
import Studies from '../models/Studies.mjs'
const { StudyTopic, StudyTask } = Studies
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

//Rota para área de estudos
data.get('/studies/:idUser', isAuthenticated, (req, res) => {
    const { idUser } = req.params
    StudyTopic.find({UserId: idUser})
    .then((dataCard) => {
        const topicIds = dataCard.map(dataId => dataId._id)
        StudyTask.find({topicId: {$in: topicIds }})
        .then((tasks) => {
            const topicsWithTasks = dataCard.map(topic => ({
                ...topic.toObject(),
                tasks: tasks.filter(task => task.topicId.toString() === topic._id.toString())
            }))
            res.render('pages/studies', {
                dataCard: topicsWithTasks
            })
        })
        .catch((error) => {
            console.log('[debug]: Erro: ', error)
            return res.redirect(req.headers.referer)
        })
    })
    .catch((error) => {
        console.log('[debug]: Erro: ', error)
    })
})

//Rota para criação de card de estudos
data.post('/studies/createTopic', (req, res) => {
    const { title, description, UserId } = req.body

    const newTopic = new StudyTopic({
        title: title,
        description: description,
        UserId: UserId
    })

    newTopic.save()
    .then(() => {
        req.flash('success_msg', 'Card salvo com sucesso!')
        return res.redirect(req.headers.referer)
    })
    .catch((error) => {
        console.log('[debug] Erro: ', error)
        req.flash('error_msg', 'Erro ao salvar card!')
        return res.redirect(req.headers.referer)
    })
})

//Rota para deletar card
data.post('/studies/delete/:idCard', (req, res) => {
    //Pegando id do card a ser excluído 
    const { idCard } = req.params
    //Buscando e excluindo card
    StudyTask.deleteMany({topicId: idCard})
    .then(() => {
        return StudyTopic.findByIdAndDelete(idCard)
    })
    .then(() => {
        req.flash('success_msg', 'Card deletado com sucesso!')
        return res.redirect(req.headers.referer)
    })
    .catch((error) => {
        console.log('[debug] Erro: ', error)
        req.flash('error_msg', 'Erro ao tentar deletar Card!')
        return res.redirect(req.headers.referer)
    })
})

//Rota para criar tasks
data.post('/studies/createTask', isAuthenticated, (req, res) => {
    const { title, topicId, status } = req.body

    const newTask = new StudyTask({
        title: title,
        topicId: topicId,
        status: status
    })
    newTask.save()
    .then(() => {
        req.flash('success_msg', 'Task adicionada com sucesso!')
        return res.redirect(req.headers.referer)
    })
    .catch((error) => {
        req.flash('erro_msg', 'Erro ao adicionar Task!')
        console.log('[debug] Erro: ', error)
        return res.redirect(req.headers.referer)
    })
})

//Rota para modificação de estado das tasks
data.put('/studies/updateTask', (req, res) => {
    const { taskId, status } = req.body

    if (!taskId || !status) {
        return res.status(400).json({ error: "Dados inválidos." });
    }

    StudyTask.findByIdAndUpdate(taskId, {status}, { new: true })
    .then(() => res.json({ message: "Task atualizada com sucesso!" }))
    .catch(error => {
        console.error("Erro ao atualizar task:", error)
        res.status(500).json({ error: "Erro no servidor." })
    })
})



export default data