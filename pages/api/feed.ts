import type { NextApiRequest, NextApiResponse } from "next";
import { NextResponse } from "next/server";
import  {validarTokenJWT} from '../../middlewares/validarTokenJWT'
import { conectarMongoDB } from "../../middlewares/conectarMongoDB";
import type { RespostaPadraoMsg } from "../../types/respostaPadrao";
import { UsuarioModel } from "../../models/UsuarioModel";
import { PublicacaoModel } from "../../models/PublicacaoModel";
import usuario from "./usuario";
import { seguidorModel } from "../../models/seguidorModel";
import { politicaCORS } from "../../middlewares/politicaCORS";

const feedEndpoint = async (req: NextApiRequest, res: NextApiResponse <RespostaPadraoMsg> | any)=>{
    try {
        if(req.method === 'GET'){
            if(req?.query?.id){
                const usuario = await UsuarioModel.findById(req?.query?.id);
                if(!usuario){
                    return res.status(400).json({erro: 'Usuario não encontrado'})
                }
                

                const publicacoes = await PublicacaoModel
                .find({IdUsuario: usuario._id})
                .sort({data: -1})

                return res.status(200).json(publicacoes)
                
            }
           
           
        }else{
            const {userId} = req.query;
            const usuarioLogado = await UsuarioModel.findById(userId);
            if(!usuarioLogado){
                return res.status(400).json({erro: "Usuario não encontrado!"})
            }

            const seguidores = await seguidorModel.find({usuarioId : userId})
            const seguidoresIds = seguidores.map(s =>s.usuarioSeguidoId)
            const publicacoes  = await PublicacaoModel.find({
                $or :[
                    {idUsuario  : usuarioLogado._id,},
                    {idUsuario : seguidoresIds}
                ]
            })
            .sort({data: -1})
            const result = [];
            for(const publicacao of publicacoes){
                const usuarioDaPublicacao = await UsuarioModel.findById(publicacao.idUsuario);
                if(usuarioDaPublicacao){
                    const final = {...publicacao._doc, usuario:{
                        nome: usuarioDaPublicacao.nome,
                        avatar: usuarioDaPublicacao.avatar
                    }}
                    result.push(final)
                }
            }
            return res.status(200).json(publicacoes)
        }
        
    return res.status(405).json({erro: 'Metodo Informado não é valido'})
    } catch (e) {
        console.log(e)
    }
    return res.status(400).json({erro: 'Não foi possivel obter o feed'})
}

export default politicaCORS( validarTokenJWT(conectarMongoDB(feedEndpoint)))