import { Sequelize } from "sequelize";
import dotenv from 'dotenv'
dotenv.config()

const DB_DATABASE = process.env.DB_DATABASE
const DB_HOST = process.env.DB_HOST
const DB_USER = process.env.DB_USER
const DB_PORT = process.env.DB_PORT

const connection = new Sequelize(DB_DATABASE, DB_USER, '', {
    host: DB_HOST,
    dialect: 'postgres',
    port: DB_PORT,
    logging: false
})

const testConnection = async () => {
    try {
        await connection.authenticate()
        console.log('Banco conectado com sucesso')
    } catch (error) {
        console.log('Erro ao conectar ao Banco de Dados | ', error)
    }
}

testConnection()

export default connection