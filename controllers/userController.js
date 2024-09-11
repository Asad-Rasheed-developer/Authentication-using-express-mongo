import UserModel from "../models/User.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import transporter from "../config/emailconfig.js";

class UserController {
  static userRegistration = async (req, res) => {
    const { name, email, password, password_confirmation, tc } = req.body;
    const user = await UserModel.findOne({ email: email });
    if (user) {
      return res.status(400).json({ message: "Email already exists" });
    } else {
      if (name && email && password && password_confirmation && tc) {
        if (password === password_confirmation) {
          try {
            const salt = await bcrypt.genSalt(12);
            const hashedPassword = await bcrypt.hash(password, salt);
            const doc = new UserModel({
              name: name,
              email: email,
              password: hashedPassword,
              tc: tc,
            });
            await doc.save();
            const saved_user = await UserModel.findOne({email:email});
            //generate JWT token
            const token = jwt.sign({userID:saved_user._id},
                 process.env.JWT_SECRET_KEY, { expiresIn: '6d' });
             res.status(201).json({ message: "User registered successfully","token":token });
          } catch (error) {
            res.status(400).json({ message: "user not registered!!!" });
          }
        } else {
          res.status(400).json({ message: "Passwords do not match" });
        }
      } else {
        res.status(400).json({ message: "ALL FILES ARE REQUIRED !!" });
      }
    }
  };

  static userLogin = async (req, res) => {
    try {
      const { email, password } = req.body;

      if (email && password) {
        const user = await UserModel.findOne({ email: email });

        if (user != null) {
          const isMatch = await bcrypt.compare(password, user.password);
        
        if (user.email === email && isMatch) {
          //generate JWT token
          const token = jwt.sign({userID:user._id},
                 process.env.JWT_SECRET_KEY, { expiresIn: '6d' });
             res.status(201).json({ message: "User Login successfully","token":token });

        } else {
          return res.status(400).json({ message: "Email or Password Invalid" });
        }
        }else{
            return res.status(400).json({ message: "User not found" });
        }
      } else {
        res.status(400).json({ message: "Email and password are required" });
      }
    } catch (error) {
      res.status(400).json({ message: "unable to login !!!" });
    }
  }

  static changeUserPassword = async (req,res) => {
    const {password,password_confirmation} = req.body;
    if(password && password_confirmation){
      if(password === password_confirmation){
        try{
          const salt = await bcrypt.genSalt(12);
          const newHashedPassword = await bcrypt.hash(password, salt);
         const user = await UserModel.findByIdAndUpdate(req.user._id, { password: newHashedPassword }, { new: true });
          
          res.status(201).json({ message: "Password changed successfully" });
        }catch(error){
          res.status(400).json({ message: "Error changing password" });
        }
      }else{
        res.status(400).json({ message: "Passwords do not match" });
      }
    }else{
      res.status(400).json({ message: "Password and Confirmation Password are required" });
    }
  }

  static loggedUser = async (req,res) => {
    res.send({"user":req.user})
  }

  static sendPassToEmail = async (req,res) => {
    const {email} = req.body
    if(email){
      const user = await UserModel.findOne({email:email})
      if(user){
        const secret = user._id + process.env.JWT_SECRET_KEY;
        const token = jwt.sign({userID:user._id},secret,{expiresIn:"15m"})
        const link =  `http://127.0.0.1:5000/api/user/reset/${user._id}/${token}`
        console.log(link);

        let info = await transporter.sendMail({
          from:process.env.EMAIL_FROM,
          to:user.email,
          subject: "Reset Password",
          html:`<a href=${link}>click here</a>to reset your password`
        })


        //send email to user with link
        res.status(201).json({ message: "Reset link sent to your email" });

        
      }else{
        res.status(400).json({ message: "User not found" });
      }
      
    }else{
      res.status(400).json({ message: "Email is required" });
    }
  }

  static userPasswordReset = async (req,res) => {
    const {password ,password_confirmation} = req.body
    const {id,token} = req.params
    const user = await UserModel.findById(id)
    const new_secret = user._id + process.env.JWT_SECRET_KEY;
    try {
      jwt.verify(token,new_secret)
      if(password && password_confirmation){
        if(password === password_confirmation){
          const salt = await bcrypt.genSalt(12);
          const newHashedPassword = await bcrypt.hash(password, salt);
          await UserModel.findByIdAndUpdate(user._id, { password: newHashedPassword }, { new: true });
          res.status(201).json({ message: "Password changed successfully" });
        }else{
          res.status(400).json({ message: "Passwords do not match" });
        }
      }else{
  res.send({"status":"error","message":"password and confirmation password require !!"})
      }
    } catch (error) {
      res.status(401).json({ message: "token is expired" });
    }



  }
}
export default UserController;
