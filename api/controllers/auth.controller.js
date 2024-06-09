import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import prisma from "../lib/prisma.js";
export const register = async (req, res) => {
    const { username, email, password } = req.body;
    try {
        
    
// HASH THE PASSWORD
const hashedPassword = bcrypt.hashSync(password, 10);
// CREATE A NEW USER AND SAVE TO DB
const newUser =await prisma.user.create({
    data : {
        username,
        email,
        password: hashedPassword
    }
})
res.status(201).json({message : "User created successfully", user : newUser});
} catch (error) {
        res.status(500).json({message : "Failed to create user", error : error.message});
}
}

export const login = async (req, res) => {
const { username, password } = req.body;
try {
    

// CHECK IF THE USER EXISTS IN THE DB
const user = await prisma.user.findUnique({
    where : {
        username
    }
})
if(!user) {
    return res.status(401).json({message : "Invalid credentials"});
}
// CHECK IF THE PASSWORD IS CORRECT
const isPasswordValid = bcrypt.compareSync(password, user.password);
if(!isPasswordValid) {
    return res.status(401).json({message : "Invalid credentials"});
}


// GENERATE A COOKIE TOKEN AND SEND TO THE USER
const age =1000 * 60 * 60 * 24 * 7;
const token = jwt.sign({id : user.id}, process.env.JWT_SECRET_KEY, {expiresIn : age});
res.cookie("token", token, {
    httpOnly : true,
    maxAge: age,
    // secure:true, //https
}).status(200).json({message : "Logged in successfully", user});
} catch (error) {
    res.status(500).json({message : "Failed to login", error : error.message});
}
}
 
export const logout = (req, res) => {
    res.clearCookie("token").status(200).json({message : "Logged out successfully"});
}