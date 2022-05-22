import type { NextApiRequest, NextApiResponse } from "next";
import type{RespostaPadraoMsg} from '../../types/respostaPadrao';
import {validarTokenJWT} from '../../middlewares/validarTokenJWT';
import {conectarMongoDB} from '../../middlewares/conectarMongoDB';
import {UsuarioModel} from '../../models/UsuarioModel';
import {PublicacaoModel} from '../../models/PublicacaoModel';

const comentarioEndPoint = async (req: NextApiRequest, res: NextApiResponse)=>{
    try {
        if(req.method === 'PUT'){
            const {userId, id} = req.query
            const usuarioLogado = await UsuarioModel.findById(userId)
            if(!usuarioLogado){
                return res.status(400).json({erro: 'Usuario não encontrado'});
            }
            const publicacao = await PublicacaoModel.findById(id);
            if (!publicacao) {
                return res.status(400).json({erro: 'Publicação não encontrada'})
            }
            if(!req.body || !req.body.comentario
                || req.body.comentario.length < 2){
                    return res.status(400).json({erro: 'comentario não é valido'});
                }

            const comentario = {
                usuarioId : usuarioLogado._id,
                nome: usuarioLogado.nome,
                comentario : req.body.comentario
            }

            publicacao.comentarios.push(comentario)
            await PublicacaoModel.findByIdAndUpdate({_id: publicacao})
            return res.status(200).json({msg: "Comentário publicado com sucesso"})
        }

        return res.status(405).json({erro: "Método informado não é valido"})
    } catch (e) {
        console.log(e)
        return res.status(500).json({erro: "Ocorreu erro ao adcionar um comentario"})
    }
}

export default validarTokenJWT(conectarMongoDB(comentarioEndPoint));