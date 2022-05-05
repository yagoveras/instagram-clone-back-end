import type { NextApiRequest, NextApiResponse } from "next";
import { NextResponse } from "next/server";
import  {validarTokenJWT} from '../../middlewares/validarTokenJWT'
import { conectarMongoDB } from "../../middlewares/conectarMongoDB";
import type { RespostaPadraoMsg } from "../../types/respostaPadrao";
import { UsuarioModel } from "../../models/UsuarioModel";
import { uploadImagemCosmic, upload } from "../../services/uploadImagemCosmic";
import nc from 'next-connect';

const handler = nc()
    .use(upload.single('file'))
    .put( async(req: any, res: NextApiResponse<RespostaPadraoMsg>)=>{
        try {
            // pegar o usuario no banco
            const {userId} = req?.query;
            const usuario = await UsuarioModel.findById(userId);
           //validar o usuario
           if(!usuario){
               return res.status(400).json({erro: 'Usuario não encontrado'})
           }

           const {nome} = req.body
           if(nome && nome.length < 2){
               usuario.nome = nome;
           }

           const {file} = req;
           if(file && file.originalname){
              const image = await uploadImagemCosmic(req)
              if(image && image.media && image.media.url){
                usuario.avatar = image.media.url;
              }

              //alterar os dados no DB
                await UsuarioModel.findByIdAndUpdate({_id: usuario._id}, usuario)

                return res.status(200).json({msg : 'Usuario alterado com Sucesso'})
              
           }

        } catch (e) {
            console.log(e)
            res.status(400).json({erro: 'Naão foi possivel atualizar o usuario'})
        }

        
    })
    .get(async (req: NextApiRequest, res: NextApiResponse < RespostaPadraoMsg | any >)=>{
        const {userId} = req?.query;

    //buscar todos os dados do usuario
    try{

        const usuario = await UsuarioModel.findById(userId);
        usuario.senha = null;
        return res.status(200).json(usuario)

    }catch(e){
        console.log(e);
    }
        res.status(400).json({erro :"Não foi possivel obter o Usuario"})

        
    });

    export const config = {
        api : {
            bodyParser : false
        }
    }

export default validarTokenJWT(conectarMongoDB(handler));