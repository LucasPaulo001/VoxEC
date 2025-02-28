//Importando módulos
import { Socket } from 'dgram'
import express from 'express'
import { createServer } from 'http'
import { Server } from 'socket.io'
import path from 'path'
import { create } from 'express-handlebars'
import dotenv from 'dotenv'
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
io.on("connection", (socket) => {
    console.log("Usuário conectado", socket.id)

    socket.on("message", (data) => {
        console.log("Mensagem recebida:", data)
        io.emit("message", data)
    })
    socket.on("disconnect", () => {
        console.log("Usuário desconectado:", socket.id)
    })
})

//Configuração do hbs
const hbs = create({
    extname: 'hbs',
    defaultLayout: 'main',
    layoutsDir: path.join(process.cwd(), 'src', 'views', 'layout'),
    runtimeOptions: {
        allowProtoPropertiesByDefault: true,
        allowProtoMethodsByDefault: true
    }
})

//Configuração a engine
app.engine("hbs", hbs.engine)
app.set('view engine', 'hbs')
app.set('views', path.join(process.cwd(), 'src', 'views'))

//Arquivos estáticos
app.use(express.static('public'))

//Importando rotas
import login from './routes/login.mjs'
import register from './routes/register.mjs'

//Configurando rotas
app.use('/', login)
app.use('/user', register)

//Conectando ao servidor
server.listen(process.env.PORT, () => {
    console.log("Servidor conectado na porta => ", process.env.PORT)
})