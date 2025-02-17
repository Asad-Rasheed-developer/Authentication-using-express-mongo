import jwt from "jsonwebtoken"
import UserModel from "../models/User.js"


var checkUserAuth = async (req,res,next) => {
    let token 
    const {authorization }= req.headers;
    if (authorization && authorization.startsWith('Bearer')) {
        // verify token
      try {
        token = authorization.split(' ')[1]
      
        
              const {userID} = jwt.verify(token, process.env.JWT_SECRET_KEY);

              console.log(userID);
              
              //get user from token
              req.user = await UserModel.findById(userID).select('-password');
              
              next();
      } catch (error) {
        res
          .status(401)
          .send({ status: "failed", message: "Unauthorized User" });
      }
    } 
    if(!token){
        res
       .status(401)
       .send({
        status: "failed",
        message: "Token not provided"
       })
    }
}
export default checkUserAuth;