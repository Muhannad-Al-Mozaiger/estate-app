import prisma from "../lib/prisma.js";
export const addMessage = async (req, res) => {
    const text = req.body.text;
    const chatId = req.params.chatId;
    const tokenUserId = req.userId;
    try {
        const chat = await prisma.chat.findUnique({
            where: {
                id: chatId,
                userIDs: { hasSome: [tokenUserId] }
            },
            include: {
                messages: true
            }
        });

        if (!chat) {
            return res.status(404).json({ message: "Chat not found" });
        }
        const newMessage = await prisma.message.create({
            data: {
                chatId,
                userId: tokenUserId,
                text
            }
        });
        await prisma.chat.update({
            where: {
                id: chatId
            },
            data: {
                seenBy: [tokenUserId],
                lastMessage: text

            }
        });

        res.status(201).json(newMessage);
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: "Failed to add message" });
    }
}