import { Router } from "express"
const register = Router()

register.get('/register', (req, res) => {
    res.render('pages/register')
})

export default register