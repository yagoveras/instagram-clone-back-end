import type {NextApiRequest, NextApiResponse} from 'next';
import { conectarMongoDB } from '../../middlewares/conectarMongoDB';
import { validarTokenJWT } from '../../middlewares/validarTokenJWT';
import { UsuarioModel } from '../../models/UsuarioModel';
import { seguidorModel} from '../../models/seguidorModel'
import type { RespostaPadraoMsg } from '../../types/respostaPadrao';

const endpointSeguir = async (req: NextApiRequest, res: NextApiResponse<RespostaPadraoMsg>)=>{
    try {
        if(req.method === 'PUT'){

            const { userId, id} = req.query;
            const usuarioLogado = await UsuarioModel.findById(userId)
            if(!usuarioLogado){
                return res.status(400).json({erro: 'Usuario Logado não encontrado'})
            }
            const usuarioASerSeguido = await UsuarioModel.findById(id);
            if(!usuarioASerSeguido){
                return res.status(400).json({erro: 'Usuario a ser seguido não encontrado'})
            }
            //buscar se EU LOGADO sigo ou não esse usuario
            const euJaSigoEsseUsuario = await seguidorModel
                .find({usuarioId: usuarioLogado._id, usuarioSeguidoId: usuarioASerSeguido._id})
            if(euJaSigoEsseUsuario && euJaSigoEsseUsuario.length > 0){
                //sinal eu ja sigo
                euJaSigoEsseUsuario.forEach(async (e: any)=> await seguidorModel.findByIdAndDelete({_id: e._id}))
                usuarioLogado.seguindo--;
                await UsuarioModel.findByIdAndUpdate({_id: usuarioLogado._id}, usuarioLogado);
                usuarioASerSeguido.seguidores--;
                await UsuarioModel.findByIdAndUpdate({_id: usuarioASerSeguido._id}, usuarioASerSeguido)

                return res.status(200).json({msg : 'Deixou de sergir o usuario com sucesso'})

            }else{
                //sinal que eu não sigo
                const seguidor = {
                    usuarioId: usuarioLogado._id,
                    usuarioSeguidoId: usuarioASerSeguido._id,
                }
                await seguidorModel.create(seguidor)
                return res.status(200).json({msg: 'Usuario seguido com sucesso'})

                usuarioLogado.seguindo++;
                await UsuarioModel.findByIdAndUpdate({_id: usuarioLogado._id}, usuarioLogado);

                usuarioASerSeguido.seguidores++
                await UsuarioModel.findByIdAndUpdate({_id: usuarioASerSeguido._id}, usuarioASerSeguido)
            }
        }

        return res.status(405).json({erro: 'Metodo Informado não existe'})

        
    } catch (e) {
        console.log(e)
        return res.status(500).json({erro: 'Não foi possivel seguir/deseguir o usuario'});

    }
}

export default(validarTokenJWT(conectarMongoDB(endpointSeguir)))