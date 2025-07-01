import React, { useState, useRef } from "react";
import { GoogleGenAI, Modality } from "@google/genai";
import { useNavigate } from 'react-router-dom';
import "../css/knatty.css";

const ABOUT_US_INFO = `
Knowy, ABC Condo is a vibrant community located in the heart of the city. Our mission is to foster connections, provide helpful resources, and keep all residents informed and engaged. 
We value inclusivity, safety, and a warm welcome for all newcomers. Knatty, was a friendly chatbot powered by Gemini to provide better user experience 😊
`;

function Knaty() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    { from: "knatty", text: "Hi! 👋 I'm Knatty. How can I assist you today?" },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef(null);
  const genAI = useRef(null);
  const navigate = useNavigate();
  const isAuth = localStorage.getItem("isAuth");


  const GEMINI_API_KEY = process.env.REACT_APP_GEMINI_API_KEY;

  if (!genAI.current && GEMINI_API_KEY) {
    genAI.current = new GoogleGenAI({ apiKey: GEMINI_API_KEY });
  }

  const scrollToBottom = () => {
    if (chatEndRef.current) chatEndRef.current.scrollIntoView({ behavior: "smooth" });
  };

  const isAboutUsQuestion = (msg) => {
    const aboutUsKeywords = ["about you", "knowy", "abc condo", "about us information", "who are you", "who is knatty"];
    return aboutUsKeywords.some((kw) => msg.toLowerCase().includes(kw));
  };

  const isPostContentRequest = (msg) => /post|blog|refine|improve|generate.*content/.test(msg.toLowerCase());
  const isImageRequest = (msg) => /image|picture|photo|draw|avatar|profile picture|generate.*image/.test(msg.toLowerCase());

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    const userMsg = input.trim();
    setMessages((msgs) => [...msgs, { from: "user", text: userMsg }]);
    setInput("");
    setLoading(true);

    // About Us
    if (isAboutUsQuestion(userMsg)) {
      setMessages((msgs) => [
        ...msgs,
        {
          from: "knatty",
          text: "Here's some information about us:\n\n" + ABOUT_US_INFO,
        },
      ]);
      setLoading(false);
      setTimeout(scrollToBottom, 10);
      return;
    }

    // Blog Post Generation/Refine (require login)
    if (isPostContentRequest(userMsg)) {
      if (!isAuth) {
        setMessages((msgs) => [
          ...msgs,
          {
            from: "knatty",
            text: "To help you generate or refine post content, please login first.",
            loginPrompt: true,
          },
        ]);
        setLoading(false);
        setTimeout(scrollToBottom, 10);
        return;
      }
    }

    // Image Generation (require login)
    if (isImageRequest(userMsg)) {
      if (!isAuth) {
        setMessages((msgs) => [
          ...msgs,
          {
            from: "knatty",
            text: "To generate images, please login first.",
            loginPrompt: true,
          },
        ]);
        setLoading(false);
        setTimeout(scrollToBottom, 10);
        return;
      }
      try {
        const contents = userMsg;
        const response = await genAI.current.models.generateContent({
          model: "gemini-2.0-flash-preview-image-generation",
          contents: contents,
          config: {
            responseModalities: [Modality.TEXT, Modality.IMAGE],
          }
        });


        const candidate = response.candidates?.[0];
        const parts = candidate?.content?.parts || [];
        const imagePart = parts.find(part => part.inlineData && part.inlineData.mimeType.startsWith("image/"));
        const textPart = parts.find(part => part.text);
        if (imagePart) {
          const { data, mimeType } = imagePart.inlineData;
          const imageUrl = `data:${mimeType};base64,${data}`;
          setMessages((msgs) => [
            ...msgs,
            {
              from: "knatty",
              text: "Here is your generated image, " + (textPart?.text || ""),
              imageUrl,
            },
          ]);
        } else {
          setMessages((msgs) => [
            ...msgs,
            {
              from: "knatty",
              text: "Sorry, I couldn't generate an image for your request.",
            },
          ]);
        }
      } catch (err) {
        setMessages((msgs) => [
          ...msgs,
          { from: "knatty", text: "Sorry, I couldn't generate the image. Please try again later." },
        ]);
      }
      setLoading(false);
      setTimeout(scrollToBottom, 10);
      return;
    }

    // Text Generation (general, blog, etc.)
    try {
      const response = await genAI.current.models.generateContent({
        model: "gemini-2.5-flash",
        contents: userMsg,
      });
      const text = response.text;
      console.log(response.text);
      setMessages((msgs) => [...msgs, { from: "knatty", text }]);
    } catch (err) {
      setMessages((msgs) => [
        ...msgs,
        { from: "knatty", text: "Sorry, I couldn't process your request. Please try again later." },
      ]);
      console.log(err);
    }
    setLoading(false);
    setTimeout(scrollToBottom, 10);
  };

  return (
    <div className={`knatty-chatbot ${open ? "open" : ""}`}>      {!open && (
      <button className="knatty-toggle" onClick={() => { setOpen(true); setTimeout(scrollToBottom, 10); }}>
        <span role="img" aria-label="Chat">💬</span>
      </button>
    )}
      {open && (
        <div className="knatty-chatbox shadow">
          <div className="knatty-header bg-primary text-white p-2">
            Knatty
            <button className="btn-close btn-close-white float-end" onClick={() => setOpen(false)} />
          </div>
          <div className="knatty-messages p-2">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`mb-2 d-flex ${msg.from === "user" ? "justify-content-end" : "justify-content-start"}`}
              >
                <div className={`knatty-bubble ${msg.from === "user" ? "user" : "knatty"}`} style={{ whiteSpace: 'pre-line' }}>
                  {msg.text}
                  {msg.imageUrl && <img src={msg.imageUrl} alt="Generated" className="img-fluid mt-2" />}
                  {msg.loginPrompt && (
                    <div className="mt-2 text-center">
                      <button className="btn btn-sm btn-primary" onClick={() => navigate('/login')} >Login</button>
                    </div>
                  )}
                </div>
              </div>
            ))}
            <div ref={chatEndRef} />
          </div>
          <form className="knatty-input p-2 border-top" onSubmit={handleSend}>
            <input
              className="form-control"
              placeholder="Type your message..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={loading}
            />
            <button className="btn btn-primary ms-2" type="submit" disabled={loading || !input.trim()}>
              {loading ? "..." : "Send"}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

export default Knaty;