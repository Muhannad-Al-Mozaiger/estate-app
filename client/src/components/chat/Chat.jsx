import { useContext, useState } from "react";
import "./chat.scss";
import { AuthContext } from "../../context/AuthContext";
import apiRequest from "../../lib/apiRequest";
import {format} from 'timeago.js';
function Chat({ chats }) {
  const [chat, setChat] = useState(false);
  const { currentUser } = useContext(AuthContext);

  const handleOpenChat = async (id, receiver) => {
    try {
      const res = await apiRequest(`/chats/${id}`);
      setChat({ ...res.data, receiver });
    } catch (error) {

    }
  }
  const handleSubmit = async (e) => {
    e.preventDefault();
    const message = e.target[0].value;
    const formData = new FormData(e.target);
    const text = formData.get("text");
    if(!text) return;
    try {
      const res = await apiRequest.post(`/messages/${chat.id}`, { text });
      setChat({ ...chat, messages: [...chat.messages, res.data] });
      e.target.reset() ;
    } catch (error) {
      console.log(error);
    }
  }
  return (
    <div className="chat">
      <div className="messages">
        <h1>Messages</h1>
        {chats && chats.map((chat) =>
          <div className="message" key={chat.id} style={{ backgroundColor: chat.seenBy.includes(currentUser.id) ? "white" : "#fecd514e" }} onClick={() => handleOpenChat(chat.id, chat.receiver)}>
            <img
              src={chat.receiver.avatar || "/noavatar.png"}
              alt=""
            />
            <span>{chat.receiver.username}</span>
            <p>{chat.lastMessage}</p>
          </div>
        )}

      </div>
      {chat && (
        <div className="chatBox">
          <div className="top">
            <div className="user">
              <img
                src={chat.receiver.avatar || "/noavatar.png"}
                alt=""
              />
              {chat.receiver.username}
            </div>
            <span className="close" onClick={() => setChat(null)}>X</span>
          </div>
          <div className="center">
            {chat.messages.map((message) => (
              <div className="chatMessage" style={{alignSelf: message.userId === currentUser.id ? "flex-end" : "flex-start",textAlign: message.userId === currentUser.id ? "right" : "left"}} key={message.id}>
                <p>{message.text}</p>
                <span>{format(message.createdAt)}</span>
              </div>
            ))}

          </div>
          <form onSubmit={handleSubmit} className="bottom">
            <textarea name="text"></textarea>
            <button>Send</button>
          </form>
        </div>
      )}
    </div>
  );
}

export default Chat;
