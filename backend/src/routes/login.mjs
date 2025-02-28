import { Router } from "express"
const login = Router()

login.get('/', (req, res) => {
    res.render('pages/login')
})

export default login