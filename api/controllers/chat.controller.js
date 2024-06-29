import prisma from "../lib/prisma.js";
export const getChats = async (req, res) => {
    const tokenUserId = req.userId;

    try {
        const chats = await prisma.chat.findMany({
            where: {
                userIDs: { hasSome: [tokenUserId] }
            }
        });
        for (const chat of chats) {
            const receiverId = chat.userIDs.find((id) => id !== tokenUserId);
            const receiver = await prisma.user.findUnique({
                where: {
                    id: receiverId
                },
                select: {
                    id: true,
                    avatar: true,
                    username: true
                }
            });
            chat.receiver = receiver;
        }
        res.status(200).json(chats);
    } catch (err) {
        res.status(500).json({ message: "Failed to get chats" });
    }
}

export const getChat = async (req, res) => {
    const tokenUserId = req.userId;
    try {
        const chat = await prisma.chat.findUnique({
            where: {
                id: req.params.id,
                userIDs: { hasSome: [tokenUserId] }
            },
            include: {
                messages: {
                    orderBy: {
                        createdAt: "asc"
                    }
                }
            }
        });
        await prisma.chat.update({
            where: {
                id: req.params.id
            },
            data: {
                seenBy: {
                    push: [tokenUserId]
                }
            }
        });

        res.status(200).json(chat);
    } catch (err) {
        res.status(500).json({ message: "Failed to get chat" });
    }
}

export const addChat = async (req, res) => {
    const tokenUserId = req.userId;
    try {
        const newChat = await prisma.chat.create({
            data: {
                userIDs: [tokenUserId, req.body.receiverId],
            }
        });
        res.status(201).json(newChat);
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: "Failed to add chat" });
    }
}

export const updateChat = async (req, res) => {
    const inputs = req.body;
    try {
        const updatedChat = await prisma.chat.update({
            where: {
                id: req.params.id
            },
            data: {
                ...inputs
            }
        });
        res.status(200).json(updatedChat);
    } catch (err) {
        res.status(500).json({ message: "Failed to update chat" });
    }
}

export const deleteChat = async (req, res) => {
    const id = req.params.id;
    try {
        const deletedChat = await prisma.chat.delete({
            where: {
                id
            }
        });
        res.status(200).json(deletedChat);
    } catch (err) {
        res.status(500).json({ message: "Failed to delete chat" });
    }
}

export const readChat = async (req, res) => {
    const tokenUserId = req.userId;
    const id = req.params.id;
    try {
        const chat = await prisma.chat.update({
            where: {
                id,
                userIDs: { hasSome: [tokenUserId] }
            },
            data: {
                seenBy: {
                    push: [tokenUserId]
                }
            }
        });
        res.status(200).json(chat);
    } catch (err) {
        res.status(500).json({ message: "Failed to read chat" });
    }
}

