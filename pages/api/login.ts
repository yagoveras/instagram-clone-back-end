import type { NextApiRequest, NextApiResponse  } from 'next'
import { conectarMongoDB } from '../../middlewares/conectarMongodb'
import type { RespostaPadraoMsg } from '../../types/respostaPadrao'
const endPointLogin = (
    req: NextApiRequest,
    res: NextApiResponse< RespostaPadraoMsg >
)=>{
    if(req.method === 'POST'){
        const {login, senha} = req.body
        if(login === 'admin@admin.com' &&
            senha === 'Admin@123'){
                return res.status(200).json({msg: 'Usuario autenticado com sucesso'})
            }
            return res.status(400).json({erro: 'Usuario ou senha não encontrado'})
    }

    return res.status(405).json({
        erro: 'Metodo Informado não é valido'
    })
}

export default conectarMongoDB(endPointLogin)