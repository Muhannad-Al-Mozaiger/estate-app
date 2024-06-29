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
        const { password: userPassword, ...userInfo } = updatedUser;
        res.status(200).json(userInfo);
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: "Failed to update user!", error: err });
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

export const savePost = async (req, res) => {
    const postId = req.body.postId;
    const tokenUserId = req.userId;

    try {

        const savedPost = await prisma.savedPost.findUnique({
            where: {
                postId,
                userId: tokenUserId
                // postId_userId: {
                //     postId,
                //     userId: tokenUserId
                // }
            }
        });
        if (savedPost) {
            await prisma.savedPost.delete({
                where: {
                    id: savedPost.id
                }
            });
            res.status(200).json({ message: "Post removed from saved posts" });
        }
        else {
            await prisma.savedPost.create({
                data: {
                    postId,
                    userId: tokenUserId
                }
            });
            res.status(200).json({ message: "Post added to saved posts" });
        }
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: "Failed to delete user" });
    }
}

export const profilePosts = async (req, res) => {
    const tokenUserId = req.userId;
    try {
        const userPosts = await prisma.post.findMany({
            where: {
                userId: tokenUserId
            }
        });
        const saved = await prisma.savedPost.findMany({
            where: {
                userId: tokenUserId
            }
            ,
            include: {
                post: true
            }
        })
        const savedPosts = saved.map((savedPost) => savedPost.post);
        res.status(200).json({ userPosts, savedPosts });
    } catch (err) {
        res.status(500).json({ message: "Failed to get profile posts" });
    }
}

export const getNotificationNumber = async (req, res) => {
    const tokenUserId = req.userId;
    try {
        const number = await prisma.chat.count({
            where: {
                userIDs: { hasSome: [tokenUserId] },
                NOT: {
                    seenBy: {
                        hasSome: [tokenUserId]
                    }
                }
            }
        });
        console.log(number);
        res.status(200).json(number);
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: "Failed to get notification number" });
    }
}