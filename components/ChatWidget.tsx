import React, { useState, useEffect, useRef, useCallback } from 'react';
import { createChatSession, sendMessage } from '../services/geminiService';
import type { Chat } from '@google/genai';
import type { Message } from '../types';
import { ChatIcon, CloseIcon, SendIcon } from './icons';

export const ChatWidget: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([
        { sender: 'bot', text: "Hello! Ask me anything." }
    ]);
    const [userInput, setUserInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const chatSession = useRef<Chat | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (isOpen && !chatSession.current) {
            chatSession.current = createChatSession();
        }
    }, [isOpen]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(scrollToBottom, [messages]);

    const handleSend = useCallback(async () => {
        if (userInput.trim() === '' || isLoading || !chatSession.current) return;

        const newUserMessage: Message = { sender: 'user', text: userInput };
        setMessages(prev => [...prev, newUserMessage]);
        setUserInput('');
        setIsLoading(true);

        const chat = chatSession.current;
        const responseText = await sendMessage(chat, userInput);
        
        const newBotMessage: Message = { sender: 'bot', text: responseText };
        setMessages(prev => [...prev, newBotMessage]);
        setIsLoading(false);
    }, [userInput, isLoading]);

    const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            handleSend();
        }
    };
    
    return (
        <>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="fixed bottom-6 right-6 bg-rose-500 text-white p-4 rounded-full shadow-lg hover:bg-rose-600 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:ring-opacity-50 transition-transform transform hover:scale-110"
                aria-label={isOpen ? "Close chat" : "Open chat"}
            >
                {isOpen ? <CloseIcon className="w-8 h-8"/> : <ChatIcon className="w-8 h-8"/>}
            </button>

            {isOpen && (
                <div className="fixed bottom-24 right-6 w-full max-w-sm h-3/4 max-h-[600px] bg-white rounded-2xl shadow-2xl flex flex-col transition-all duration-300 ease-in-out origin-bottom-right sm:w-96">
                    <div className="bg-rose-500 text-white p-4 rounded-t-2xl flex justify-between items-center">
                        <h3 className="text-lg font-bold">Chat Helper</h3>
                    </div>
                    <div className="flex-1 p-4 overflow-y-auto bg-gray-50">
                        {messages.map((msg, index) => (
                            <div key={index} className={`flex my-2 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`px-4 py-2 rounded-2xl max-w-xs lg:max-w-sm ${msg.sender === 'user' ? 'bg-blue-500 text-white rounded-br-none' : 'bg-gray-200 text-gray-800 rounded-bl-none'}`}>
                                    {msg.text}
                                </div>
                            </div>
                        ))}
                        {isLoading && (
                            <div className="flex justify-start my-2">
                                <div className="px-4 py-2 rounded-2xl bg-gray-200 text-gray-800 rounded-bl-none">
                                    <div className="flex items-center space-x-2">
                                        <div className="w-2 h-2 bg-gray-500 rounded-full animate-pulse"></div>
                                        <div className="w-2 h-2 bg-gray-500 rounded-full animate-pulse delay-75"></div>
                                        <div className="w-2 h-2 bg-gray-500 rounded-full animate-pulse delay-150"></div>
                                    </div>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>
                    <div className="p-4 border-t border-gray-200 bg-white rounded-b-2xl flex items-center">
                        <input
                            type="text"
                            value={userInput}
                            onChange={(e) => setUserInput(e.target.value)}
                            onKeyPress={handleKeyPress}
                            placeholder="Ask a question..."
                            className="flex-1 w-full px-4 py-2 bg-gray-800 text-white border border-gray-600 rounded-full focus:outline-none focus:ring-2 focus:ring-rose-400 placeholder:text-gray-400"
                            disabled={isLoading}
                        />
                        <button onClick={handleSend} disabled={isLoading} className="ml-3 p-3 bg-rose-500 text-white rounded-full hover:bg-rose-600 disabled:bg-gray-400 transition">
                            <SendIcon className="w-5 h-5"/>
                        </button>
                    </div>
                </div>
            )}
        </>
    );
};