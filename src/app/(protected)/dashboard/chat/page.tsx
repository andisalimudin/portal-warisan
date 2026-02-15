"use client";

import { useState, useRef, useEffect } from 'react';
import { Send, Search, MoreVertical, Phone, Video, Users, MapPin, Building, Flag, User, Image as ImageIcon, Smile } from 'lucide-react';
import { cn } from "@/lib/utils";

// Types
type ChatType = 'DIRECT' | 'GROUP' | 'AREA' | 'BRANCH' | 'COMMITTEE';

interface ChatRoom {
  id: string;
  name: string;
  type: ChatType;
  lastMessage: string;
  time: string;
  unread: number;
  avatar?: string;
}

interface Message {
  id: string;
  sender: string;
  content: string;
  time: string;
  isMe: boolean;
  read?: boolean;
}

// Mock Data
const MOCK_ROOMS: ChatRoom[] = [
  { id: '1', name: 'Kawasan N.52 Sungai Sibuga', type: 'AREA', lastMessage: 'Mesyuarat Ahad ini ditunda.', time: '10:30 AM', unread: 2 },
  { id: '2', name: 'Cawangan Kg. Tinusa 2', type: 'BRANCH', lastMessage: 'Borang keahlian baru sudah sampai.', time: 'Semalam', unread: 0 },
  { id: '3', name: 'Jawatankuasa Penerangan', type: 'COMMITTEE', lastMessage: 'Sila semak draf kenyataan media.', time: 'Semalam', unread: 5 },
  { id: '4', name: 'Ketua Bahagian', type: 'DIRECT', lastMessage: 'Terima kasih atas laporan tersebut.', time: '2 hari lepas', unread: 0 },
  { id: '5', name: 'Sekretariat Pusat', type: 'GROUP', lastMessage: 'Sila hantar laporan bulanan.', time: '1 minggu lepas', unread: 0 },
];

const MOCK_MESSAGES: Record<string, Message[]> = {
  '1': [
    { id: '1', sender: 'Ketua Kawasan', content: 'Salam semua, mesyuarat Ahad ini ditunda ke minggu depan.', time: '10:30 AM', isMe: false },
    { id: '2', sender: 'Anda', content: 'Baik Tuan, notis diterima.', time: '10:32 AM', isMe: true },
    { id: '3', sender: 'Setiausaha', content: 'Agenda baru akan diedarkan sebentar lagi.', time: '10:35 AM', isMe: false },
  ],
  '2': [
    { id: '1', sender: 'Ketua Cawangan', content: 'Salam, borang keahlian baru sudah sampai di pejabat.', time: 'Semalam', isMe: false },
  ],
  '3': [
    { id: '1', sender: 'Ketua Penerangan', content: 'Draf kenyataan media perlu disemak segera.', time: 'Semalam', isMe: false },
  ],
  '4': [
    { id: '1', sender: 'Anda', content: 'Datuk, laporan aktiviti minggu ini telah dihantar.', time: '2 hari lepas', isMe: true },
    { id: '2', sender: 'Datuk ADUN N.52', content: 'Terima kasih atas laporan tersebut. Kerja yang bagus.', time: '2 hari lepas', isMe: false },
  ],
};

export default function ChatPage() {
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);
  const [messageInput, setMessageInput] = useState('');
  const [rooms, setRooms] = useState(MOCK_ROOMS);
  const [messages, setMessages] = useState(MOCK_MESSAGES);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const selectedRoom = rooms.find(r => r.id === selectedRoomId);
  const currentMessages = selectedRoomId ? (messages[selectedRoomId] || []) : [];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [currentMessages, selectedRoomId]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageInput.trim() || !selectedRoomId) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      sender: 'Anda',
      content: messageInput,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isMe: true,
    };

    setMessages(prev => ({
      ...prev,
      [selectedRoomId]: [...(prev[selectedRoomId] || []), newMessage]
    }));

    // Update last message in room list
    setRooms(prev => prev.map(room => 
      room.id === selectedRoomId 
        ? { ...room, lastMessage: messageInput, time: 'Now', unread: 0 }
        : room
    ));

    setMessageInput('');
  };

  const getRoomIcon = (type: ChatType) => {
    switch (type) {
      case 'AREA': return <MapPin className="w-5 h-5 text-purple-600" />;
      case 'BRANCH': return <Building className="w-5 h-5 text-blue-600" />;
      case 'COMMITTEE': return <Flag className="w-5 h-5 text-orange-600" />;
      case 'GROUP': return <Users className="w-5 h-5 text-green-600" />;
      default: return <User className="w-5 h-5 text-gray-600" />;
    }
  };

  return (
    <div className="flex h-[calc(100vh-8rem)] bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      {/* Sidebar List */}
      <div className={cn(
        "w-full md:w-80 flex flex-col border-r border-gray-200 bg-gray-50/50",
        selectedRoomId ? "hidden md:flex" : "flex"
      )}>
        <div className="p-4 border-b border-gray-200 bg-white">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input 
              type="text" 
              placeholder="Cari perbualan..." 
              className="w-full pl-9 pr-4 py-2 text-sm bg-gray-100 border-none rounded-lg focus:ring-2 focus:ring-warisan-500"
            />
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto">
          {rooms.map((room) => (
            <div 
              key={room.id}
              onClick={() => setSelectedRoomId(room.id)}
              className={cn(
                "flex items-start gap-3 p-4 cursor-pointer transition-colors hover:bg-gray-100",
                selectedRoomId === room.id ? "bg-warisan-50 border-r-4 border-warisan-600" : ""
              )}
            >
              <div className="w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center shrink-0">
                {getRoomIcon(room.type)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-baseline mb-1">
                  <h3 className={cn(
                    "font-medium truncate text-sm",
                    room.unread > 0 ? "text-gray-900 font-bold" : "text-gray-700"
                  )}>
                    {room.name}
                  </h3>
                  <span className="text-xs text-gray-500 shrink-0">{room.time}</span>
                </div>
                <p className={cn(
                  "text-xs truncate",
                  room.unread > 0 ? "text-gray-900 font-medium" : "text-gray-500"
                )}>
                  {room.lastMessage}
                </p>
              </div>
              {room.unread > 0 && (
                <div className="w-5 h-5 rounded-full bg-warisan-600 text-white text-[10px] flex items-center justify-center font-bold shrink-0">
                  {room.unread}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Chat Window */}
      <div className={cn(
        "flex-1 flex flex-col bg-white",
        !selectedRoomId ? "hidden md:flex" : "flex"
      )}>
        {selectedRoomId ? (
          <>
            {/* Header */}
            <div className="h-16 border-b border-gray-200 flex items-center justify-between px-4 bg-white">
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => setSelectedRoomId(null)}
                  className="md:hidden p-2 -ml-2 text-gray-600"
                >
                  <Users className="w-5 h-5" /> {/* Back Icon replacement */}
                </button>
                <div className="w-10 h-10 rounded-full bg-warisan-100 flex items-center justify-center">
                  {getRoomIcon(selectedRoom!.type)}
                </div>
                <div>
                  <h2 className="font-bold text-gray-900">{selectedRoom?.name}</h2>
                  <p className="text-xs text-green-600 flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-green-500"></span> Online
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button className="p-2 text-gray-500 hover:bg-gray-100 rounded-full">
                  <Phone className="w-5 h-5" />
                </button>
                <button className="p-2 text-gray-500 hover:bg-gray-100 rounded-full">
                  <Video className="w-5 h-5" />
                </button>
                <button className="p-2 text-gray-500 hover:bg-gray-100 rounded-full">
                  <MoreVertical className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
              {currentMessages.map((msg) => (
                <div 
                  key={msg.id} 
                  className={cn(
                    "flex max-w-[80%]",
                    msg.isMe ? "ml-auto justify-end" : "mr-auto"
                  )}
                >
                  <div className={cn(
                    "rounded-2xl px-4 py-2 shadow-sm",
                    msg.isMe 
                      ? "bg-warisan-600 text-white rounded-br-none" 
                      : "bg-white text-gray-900 rounded-bl-none"
                  )}>
                    {!msg.isMe && (
                      <p className="text-xs font-bold text-warisan-700 mb-1">{msg.sender}</p>
                    )}
                    <p className="text-sm">{msg.content}</p>
                    <p className={cn(
                      "text-[10px] mt-1 text-right opacity-70",
                      msg.isMe ? "text-warisan-100" : "text-gray-400"
                    )}>
                      {msg.time}
                    </p>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-4 bg-white border-t border-gray-200">
              <form onSubmit={handleSendMessage} className="flex gap-2">
                <button type="button" className="p-2 text-gray-500 hover:bg-gray-100 rounded-full">
                  <ImageIcon className="w-5 h-5" />
                </button>
                <input
                  type="text"
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  placeholder="Tulis mesej..."
                  className="flex-1 px-4 py-2 bg-gray-100 border-none rounded-full focus:ring-2 focus:ring-warisan-500"
                />
                <button 
                  type="submit"
                  disabled={!messageInput.trim()}
                  className="p-2 bg-warisan-600 text-white rounded-full hover:bg-warisan-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <Send className="w-5 h-5" />
                </button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-gray-500 p-8 text-center">
            <div className="w-20 h-20 bg-warisan-50 rounded-full flex items-center justify-center mb-4">
              <Users className="w-10 h-10 text-warisan-300" />
            </div>
            <h3 className="text-lg font-bold text-gray-900">Sistem Komunikasi Warisan</h3>
            <p className="max-w-sm mt-2">
              Pilih perbualan untuk mula berinteraksi dengan ahli jawatankuasa, kawasan, atau cawangan.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
