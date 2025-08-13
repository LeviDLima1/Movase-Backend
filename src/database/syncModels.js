import connection from "./connection.js";

const syncModels = async () => {
    try {
        await connection.sync({ alter: true })

        console.log('Tabelas sincronizadas')
    } catch (error) {
        console.error('Erro ao sincronizar as tabelas', error)
    }
}

export default syncModels;