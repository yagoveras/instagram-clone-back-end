import type { NextApiRequest, NextApiResponse } from "next";
import { conectarMongoDB } from "../../middlewares/conectarMongoDB";
import { politicaCORS } from "../../middlewares/politicaCORS";
import { validarTokenJWT } from "../../middlewares/validarTokenJWT";
import { PublicacaoModel } from "../../models/PublicacaoModel";
import { UsuarioModel } from "../../models/UsuarioModel";
import type { RespostaPadraoMsg } from "../../types/respostaPadrao";

const likeEndPoint = async(req: NextApiRequest, res: NextApiResponse <RespostaPadraoMsg>)=>{

    try {
        if(req.method === 'PUT'){
            //id da publicação - checked
            const {id} = req?.query;
            const publicacao = await PublicacaoModel.findById(id);
            if(!publicacao){
                res.status(400).json({erro: 'Publicação não encontrada'})
            }
            //id do usuario que está curtindo
            const {userId} = req?.query;
            const usuario = await UsuarioModel.findById(userId)
            if(!usuario){
                return res.status(400).json({erro: 'Usuario não encontrado'});
            }
            //se o index for -1 sinal q ele não curte a foto
            
            const indexDoUsuarioNoLine= publicacao.likes.find((e: any)=> e.toString() === usuario._id.toString())
            if(indexDoUsuarioNoLine != -1){
                publicacao.likes.splice(indexDoUsuarioNoLine, 1);
                await PublicacaoModel.findByIdAndUpdate({_id : publicacao._id}, publicacao)
                return res.status(200).json({msg: 'Publicação descurtida com sucesso'})
            }else{
                //se o index for  > -1 sinal que ele ja curte a foto
                publicacao.likes.push(usuario.id);
                await PublicacaoModel.findByIdAndUpdate({_id : publicacao._id}, publicacao);
                return res.status(200).json({msg: 'Publicação curtida com sucesso'})
            }
        }

          
            

        return res.status(400).json({erro: 'Ocorreu um erro na requisição'})
    } catch (e) {
        console.log(e)
        return res.status(500).json({erro: 'Ocorreu um erro ao curtir ou descutir uma publicação!'})
    }
}

export default politicaCORS( validarTokenJWT(conectarMongoDB(likeEndPoint)))