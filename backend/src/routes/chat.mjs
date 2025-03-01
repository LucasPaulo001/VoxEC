import { Router } from "express"
const chat = Router()


chat.get('/chat', (req, res) =>{
    const dataUser = req.user
    res.render('pages/chat', {dataUser})
})


export default chat