import type { NextApiRequest, NextApiResponse } from "next";
import { NextResponse } from "next/server";
import  {validarTokenJWT} from '../../middlewares/validarTokenJWT'
import { conectarMongoDB } from "../../middlewares/conectarMongoDB";
import type { RespostaPadraoMsg } from "../../types/respostaPadrao";
import { UsuarioModel } from "../../models/UsuarioModel";


const usuarioEndPoint = async (req: NextApiRequest, res: NextApiResponse < RespostaPadraoMsg | any >)=>{
    const {userId} = req?.query;

//buscar todos os dados do usuario
try{
    const usuario = await UsuarioModel.findById(userId);
    usuario.senha = null;
    return res.status(200).json(usuario)
    return res.status(200).json({msg:'Usuario autenticado com sucesso'})

}catch(e){
    console.log(e);
}
    res.status(400).json({erro :"Não foi possivel obter o Usuario"})

    
}

export default validarTokenJWT(conectarMongoDB(usuarioEndPoint));