import prisma from "../lib/prisma.js";
import bcrypt from "bcrypt";
export const getUsers = async (req, res) => {
    try {
        const users = await prisma.user.findMany();
        res.status(200).json(users);
    } catch (err) {
        res.status(500).json({ message: "Failed to get users" });
    }
};

export const getUser = async (req, res) => {
    try {
        const user = await prisma.user.findUnique(
            {
                where: {
                    id: req.params.id
                }
            }
        );
        res.status(200).json(user);
    } catch (err) {
        res.status(500).json({ message: "Failed to get user" });
    }
};

export const updateUser = async (req, res) => {
    const { id } = req.params;
    const tokenUserId = req.userId;
    const { password, avatar, ...inputs } = req.body;
    if (id !== tokenUserId) {
        return res.status(401).json({ message: "Unauthorized" });
    }
    console.log('err');
    let updatedPassword = null;
    try {
        if (password) {
            updatedPassword = bcrypt.hashSync(password, 10);
        }
        
        const updatedUser = await prisma.user.update({
            where: {
                id
            },
            data: {
                ...inputs,
                ...(updatedPassword && { password: updatedPassword }),
                ...(avatar && { avatar })
            }
        });
        const { password:userPassword, ...userInfo } = updatedUser;
        res.status(200).json(userInfo);
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: "Failed to update user!" , error: err});
    }
};

export const deleteUser = async (req, res) => {
    const { id } = req.params;
    const tokenUserId = req.userId;
    if (id !== tokenUserId) {
        return res.status(401).json({ message: "Unauthorized" });
    }
    try {
        await prisma.user.delete({
            where: {
                id
            }
        });

        res.status(200).json({ message: "User deleted successfully" });
    } catch (err) {
        res.status(500).json({ message: "Failed to delete user" });
    }
}