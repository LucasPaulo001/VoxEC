import { Router } from "express"
import passport from "passport"
import User from "../models/User.mjs"
const login = Router()

login.get('/', (req, res) => {
        res.render('pages/login')
})

login.post('/', (req, res, next) => {
    passport.authenticate("local", {
        successRedirect: '/user/chat',
        failureRedirect: '/',
        failureFlash: true
    })(req, res, next)
})

export default login