import mongoose from 'mongoose'
import dotenv from 'dotenv'
dotenv.config()

const application = 'VoxEC'

const mongoDBConnect = (app) => {
    mongoose.connect(process.env.DB_URI)
    .then(() => {
        console.log(`Conectado ao mongoDB => APP: ${application}`)
    })
    .catch((error) => {
        console.log(`Erro ao se conectar ao mongoDB, Erro: ${error}`)
    })
}

export default mongoDBConnect