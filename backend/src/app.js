//Importando módulos
import { Socket } from 'dgram'
import express from 'express'
import { createServer } from 'http'
import { Server } from 'socket.io'
import path from 'path'
import { create } from 'express-handlebars'
import dotenv from 'dotenv'
import session from 'express-session'
import flash from 'connect-flash'
dotenv.config()

//Configurações do servidor e do socket
    const app = express()
    const server = createServer(app)
    const io = new Server(server, {
        cors: {
            origin: "*",
        }
    })

//Conexão ao socket.io
const onlineUsers = new Map()
io.on("connection", (socket) => {
    const userId = socket.handshake.query.userId

    if(userId){
        onlineUsers.set(userId, socket.id)
        io.emit("userStatusChange", { userId, isOnline: true })

        console.log(`Usuário ${userId} conectado:`, socket.id)
    }

    socket.on("sendMessage", (data) => {
        console.log("Mensagem recebida:", data)
        io.emit("receiveMessage", {
            groupId: data.groupId,
            message: data.message,
            userId: data.userId,
            username: data.username
        })
    })
    socket.on("disconnect", () => {
        if(userId){
            onlineUsers.delete(userId)
            io.emit("userStatusChange", { userId, isOnline: false })
            console.log(`Usuário ${userId} desconectado:`, socket.id);
        }
    })
})

//Configuração de parse json e dados de formulário
app.use(express.json())
app.use(express.urlencoded({extended: true}))

//Configuração do hbs
const hbs = create({
    extname: 'hbs',
    defaultLayout: 'main',
    layoutsDir: path.join(process.cwd(), 'src', 'views', 'layout'),
    runtimeOptions: {
        allowProtoPropertiesByDefault: true,
        allowProtoMethodsByDefault: true
    },
    helpers: {
        eq: function (a, b){
            return a === b
        },
        isMember: function (members, userId, options){
            if (members.includes(userId.toString())) {
                return options.fn(this); // Renderiza o conteúdo dentro do #if
            } else {
                return options.inverse(this); // Renderiza o conteúdo dentro do #else
            }
        }
    },
})

//Configuração a engine
app.engine("hbs", hbs.engine)
app.set('view engine', 'hbs')
app.set('views', path.join(process.cwd(), 'src', 'views'))

//Arquivos estáticos
app.use(express.static('public'))

//Configuração da sessão
app.use(
    session({
        secret: 'E=VT<IO$}hq]qtX4',
        resave: false,
        saveUninitialized: true
    })
)

//Configuração do passport
import { passportConfig } from './configs/auth.mjs'
passportConfig(passport)
app.use(passport.initialize())
app.use(passport.session())

//Configuração das mensagens flash
app.use(flash())

//Configuração de mensagens flash globalmente
app.use((req, res, next) => {
    res.locals.success_msg = req.flash('success_msg')
    res.locals.error_msg = req.flash('error_msg')
    res.locals.user = req.user

    next()
})

//Conexão ao mongoDB
import mongoDBConnect from './configs/db.mjs'
mongoDBConnect(app)

//Importando rotas
import login from './routes/login.mjs'
import register from './routes/register.mjs'
import chat from './routes/chat.mjs'
import passport from 'passport'
import avatarRoute from './routes/avatar.mjs'

//Configurando rotas
app.use('/', login)
app.use('/user', register)
app.use('/user', chat)
app.use('/user', avatarRoute)

//Conectando ao servidor
server.listen(process.env.PORT, () => {
    console.log("Servidor conectado na porta => ", process.env.PORT)
})