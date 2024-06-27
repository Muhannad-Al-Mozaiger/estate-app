import prisma from "../lib/prisma.js";

export const getPosts = async (req, res) => {
    try {
        const posts = await prisma.post.findMany();
        res.status(200).json(posts);
    } catch (err) {
        res.status(500).json({ message: "Failed to get posts" });
    }
}

export const getPost = async (req, res) => {    
    try {
        const post = await prisma.post.findUnique({
            where: {
                id: req.params.id
            },
            include: {
                postDetail: true,
                user:{
                    select:{
                        username: true  ,
                        avatar: true
                    }
                },
            }
        });
        res.status(200).json(post);
    } catch (err) {
        res.status(500).json({ message: "Failed to get post" });
    }
}

export const addPost = async (req, res) => {
    const body = req.body;
    const tokenUserId = req.userId;
    try {
        const newPost = await prisma.post.create({
            data: {
                ...body.postData,
                userId: tokenUserId,
                postDetail: {
                    create: body.postDetail
                }
            }
            // data: {
            //     title: req.body.title,
            //     content: req.body.content,
            //     author: {
            //         connect: {
            //             id: req.body.authorId
            //         }
            //     }
            // }
        });
        res.status(201).json(newPost);
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: "Failed to add post" });
    }
}

export const updatePost = async (req, res) => {
    try {
        const updatedPost = await prisma.post.update({
            where: {
                id: req.params.id
            },
            data: {
                title: req.body.title,
                content: req.body.content
            }
        });
        res.status(200).json(updatedPost);
    } catch (err) {
        res.status(500).json({ message: "Failed to update post" });
    }
}

export const deletePost = async (req, res) => {
    const id = req.params.id;
    const tokenUserId = req.userId;
    
    try {
        const post = await prisma.post.findUnique({
            where: {
                id
            }
        });

        if (post.userId !== tokenUserId) {
            return res.status(401).json({ message: "Unauthorized" });
        }
        await prisma.post.delete({
            where: {
                id
            }
        });
        res.status(200).json({ message: "Post deleted successfully" });
    } catch (err) {
        res.status(500).json({ message: "Failed to delete post" });
    }
}