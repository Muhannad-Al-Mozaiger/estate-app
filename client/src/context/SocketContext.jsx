import { useEffect, createContext, useState, useContext } from "react";
import { io } from "socket.io-client";
import { AuthContext } from "./AuthContext";

export const SocketContext = createContext()

export const SocketContextProvider = ({ children }) => {
    const { currentUser } = useContext(AuthContext);
    const [socket, setSocket] = useState(null);
    
    useEffect(() => {
        setSocket(io("http://localhost:4000"));
    }, []);
    useEffect(() => {
        if (currentUser) {
            socket?.emit("newUser", currentUser.id);
        }
    }, [currentUser, socket]);

    return (<SocketContext.Provider value={{ socket }}>
        {children}
    </SocketContext.Provider>);
}