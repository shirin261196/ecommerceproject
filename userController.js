import userModel from "../models/userModel.js";
import validator from "validator";
import jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt'

const createToken =(id)=>{
    return jwt.sign({id},process.env.JWT_SECRET)
}

// route for user login
const loginUser = async (req,res)=>{
try {
    const {email,password} =req.body;
    const user=await userModel.findOne({email});
    if(!user){
        return res.json({success:false,message:"User doesn't exists"})
    }

    const isMatch = await bcrypt.compare(password,user.password);
    if(isMatch){
        const token = createToken(user._id)
        res.json({success:true,token})
    }
    else{
        res.json({success:false,message:"Invalid credential"})
    }
    
} catch (error) {
    console.log(error);
    res.json({success:false,message:error.message})
}

}

// route for user registration
const registerUser = async (req, res) => {
   try {
    const {name,email,password} =req.body;
    // checking user already exists or not
    const exists = await userModel.findOne({email})
    if(exists){
        return res.json({success:false,message:"User already exists"})
    }

    // validating email and password
    if(!validator.isEmail(email)){
        return res.json({success:false,message:"Please enter a valid email"})

    }
    if(password.length <8){
        return res.json({success:false,message:"Please enter a strong password"})

    }

    // hashing user password
    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(password,salt)

    const newUser = new userModel({
        name,
        email,password: hashedPassword
    })

    const user = await newUser.save()

    const token = createToken(user._id)
    res.json({success:true,token})

   } catch (error) {
    console.log(error);
    res.json({success:false,message:error.message})
   }
  };

const adminLogin = async (req, res) => {
    const { email, password } = req.body;

    console.log('Request Body:', req.body);
    console.log('Loaded Admin Email:', process.env.ADMIN_EMAIL);
    console.log('Loaded Admin Password:', process.env.ADMIN_PASSWORD);

    if (email !== process.env.ADMIN_EMAIL) {
        return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Compare plain-text password directly (if not hashed)
    if (password !== process.env.ADMIN_PASSWORD) {
        return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Generate JWT token
    const token = jwt.sign(
        { userId: process.env.ADMIN_EMAIL, role: 'admin' },
        process.env.JWT_SECRET,
        { expiresIn: '1h' }
    );

    res.json({ token });
};

;
  


export {loginUser,registerUser,adminLogin}