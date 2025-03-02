//Módulos para configuração de autenticação
import { Strategy as localStrategy } from 'passport-local'
import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'

//Model de usuário
import User from '../models/User.mjs'

//Configuração do passport
export function passportConfig(passport){
    passport.use(new localStrategy(
        {usernameField: 'email', passwordField: 'password'},
        (email, password, done) => {
        User.findOne({email})
        .then((usuario) => {
            if(!usuario){
                return done(null, false, {message: 'Esta conta não existe!'})
            }
            // Verifica se o e-mail foi verificado
            if (!usuario.emailVerificado) {
                return done(null, false, { message: 'Você está sem acesso no momento!😞' })
            }
            bcrypt.compare(password, usuario.password, (error, isMatch) => {
                if(isMatch){
                    return done(null, usuario)
                }
                else{
                    return done(null, false, {message: 'Senha incorreta!'})
                }
            })
        }).catch((error) => error)
    }))

    passport.serializeUser((usuario, done) => {
        done(null, usuario.id)
    })

    passport.deserializeUser((id, done) => {
        User.findById(id)
        .then((usuario) => {
            done(null, usuario)
        }).catch((error) => {
            done(error, null)
        })
    })
}

//Função que verifica se o usuário está autenticado
export default function isAuthenticated(req, res, next){
    if(req.isAuthenticated()){
        return next()
    }
    else{
        req.flash('error_msg', 'Você precisa está logado para acessar esta página')
        res.redirect('/')
    }
}
