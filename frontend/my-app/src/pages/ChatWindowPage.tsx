import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useUser } from '../lib/store';
import { db } from '../lib/firebase';
import {
  collection,
  addDoc,
  serverTimestamp,
  doc,
  getDoc,
  updateDoc,
  increment,
  onSnapshot,
  query,
  orderBy,
} from 'firebase/firestore';

interface Message {
  id: string;
  text: string;
  senderId: string;
  senderName: string;
  timestamp: any;
  read: boolean;
  mediaUrl?: string;
  mediaType?: 'image' | 'video';
  sender: 'user' | 'other';
}

interface ChatPartner {
  name: string;
  avatar: string;
  id: string;
}

export function ChatWindowPage() {
  const { chatId } = useParams<{ chatId: string }>();
  const navigate = useNavigate();
  const user = useUser();

  const [chatPartner, setChatPartner] = useState<ChatPartner | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [uploadingMedia, setUploadingMedia] = useState(false);
  const [hasScrolledToUnread, setHasScrolledToUnread] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!user || !chatId) {
      setLoading(false);
      return;
    }

    const fetchChatPartner = async () => {
      try {
        const chatRef = doc(db, 'users', user.uid, 'chats', chatId);
        const chatDoc = await getDoc(chatRef);

        if (chatDoc.exists()) {
          const chatData = chatDoc.data();
          const participantIds = chatData.participants;
          const otherParticipantId = participantIds.find((id: string) => id !== user.uid);

          if (otherParticipantId) {
            const otherUserDoc = await getDoc(doc(db, 'users', otherParticipantId));
            if (otherUserDoc.exists()) {
              const otherUserData = otherUserDoc.data();
              setChatPartner({
                name: otherUserData.displayName || otherUserData.email || 'Unknown User',
                avatar: otherUserData.photoURL || '',
                id: otherUserDoc.id,
              });
            } else {
              setChatPartner({ name: 'Unknown User', avatar: '', id: '' });
            }
          } else {
            setChatPartner({ name: 'Single User Chat', avatar: '', id: '' });
          }
        } else {
          setError('Chat not found.');
          setLoading(false);
          return;
        }
      } catch (err) {
        console.error('Error fetching chat partner:', err);
        setError('Failed to load chat partner info.');
        setLoading(false);
        return;
      }
      setLoading(false);
    };

    const messagesRef = query(
      collection(db, 'users', user.uid, 'chats', chatId, 'messages'), 
      orderBy('timestamp', 'asc')
    );
    
    const unsubscribe = onSnapshot(messagesRef,
      snapshot => {
        const messagesData = snapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            ...data,
            sender: data.senderId === user.uid ? 'user' as const : 'other' as const,
          } as Message;
        });
        setMessages(messagesData);
      },
      err => {
        console.error('Error fetching messages:', err);
        setError('Failed to load messages.');
      }
    );

    fetchChatPartner();
    return () => unsubscribe();
  }, [chatId, user]);

  useEffect(() => {
    if (messages.length === 0 || loading) return;

    const scrollToTarget = () => {
      if (!messagesContainerRef.current) return;

      if (!hasScrolledToUnread) {
        const firstUnreadIndex = messages.findIndex(msg => 
          msg.sender === 'other' && !msg.read
        );

        if (firstUnreadIndex !== -1) {
          const messageElements = messagesContainerRef.current.querySelectorAll('[data-message-id]');
          if (messageElements[firstUnreadIndex]) {
            messageElements[firstUnreadIndex].scrollIntoView({ 
              behavior: 'smooth',
              block: 'start'
            });
            setHasScrolledToUnread(true);
            return;
          }
        }
        
        scrollToBottom('smooth');
        setHasScrolledToUnread(true);
      } else {
        scrollToBottom('smooth');
      }
    };

    requestAnimationFrame(() => {
      setTimeout(scrollToTarget, 50);
    });
  }, [messages, loading, hasScrolledToUnread]);

  const scrollToBottom = (behavior: ScrollBehavior = 'smooth') => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior });
    }
  };

  useEffect(() => {
    if (!user || !chatId) return;

    const resetUnreadCount = async () => {
      try {
        const currentUserChatRef = doc(db, 'users', user.uid, 'chats', chatId);
        await updateDoc(currentUserChatRef, {
          unreadCount: 0
        });

        const messagesRef = collection(db, 'users', user.uid, 'chats', chatId, 'messages');
        const unreadMessages = messages.filter(msg => msg.sender === 'other' && !msg.read);
        
        const updatePromises = unreadMessages.map(msg => 
          updateDoc(doc(messagesRef, msg.id), { read: true })
        );
        
        await Promise.all(updatePromises);
      } catch (err) {
        console.error('Error resetting unread count:', err);
      }
    };

    resetUnreadCount();
  }, [user, chatId, messages]);

  const handleSendMessage = async () => {
    if (inputMessage.trim() === '' || !user || !chatId || !chatPartner) return;
  
    try {
      const messageText = inputMessage.trim();
      const messageTimestamp = serverTimestamp();
  
      const newMessage = {
        text: messageText,
        senderId: user.uid,
        senderName: user.displayName || 'Anonymous',
        timestamp: messageTimestamp,
        read: false,
      };
  
      await Promise.all([
        addDoc(collection(db, 'users', user.uid, 'chats', chatId, 'messages'), newMessage),
        addDoc(collection(db, 'users', chatPartner.id, 'chats', chatId, 'messages'), newMessage)
      ]);
  
      const currentUserChatRef = doc(db, 'users', user.uid, 'chats', chatId);
      await updateDoc(currentUserChatRef, {
        lastMessage: { text: messageText, senderId: user.uid },
        timestamp: messageTimestamp,
      });
  
      const otherUserChatRef = doc(db, 'users', chatPartner.id, 'chats', chatId);
      await updateDoc(otherUserChatRef, {
        lastMessage: { text: messageText, senderId: user.uid },
        timestamp: messageTimestamp,
        unreadCount: increment(1)
      });
  
      setInputMessage('');
    } catch (err) {
      console.error('Error sending message:', err);
    }
  };

  const handleBackClick = () => navigate(-1);
  
  const handleProfileClick = () => {
    if (chatPartner?.id) {
      navigate(`/profile/${chatPartner.id}`);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-secondary-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-2 text-secondary-600">Loading chat...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-secondary-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-secondary-50 flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-secondary-200 p-4 flex items-center space-x-3">
        <button
          onClick={handleBackClick}
          className="p-2 hover:bg-secondary-100 rounded-lg transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <div
          onClick={handleProfileClick}
          className="flex items-center space-x-3 flex-1 cursor-pointer"
        >
          <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
            {chatPartner?.avatar ? (
              <img src={chatPartner.avatar} alt={chatPartner.name} className="w-10 h-10 rounded-full" />
            ) : (
              <span className="text-primary-600 font-semibold">
                {chatPartner?.name.charAt(0) || 'U'}
              </span>
            )}
          </div>
          <div>
            <h2 className="font-semibold text-secondary-900">{chatPartner?.name || 'Loading...'}</h2>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div
        ref={messagesContainerRef}
        className="flex-1 p-4 overflow-y-auto space-y-4"
      >
        {messages.map((message) => (
          <div
            key={message.id}
            data-message-id={message.id}
            className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                message.sender === 'user'
                  ? 'bg-primary-600 text-white'
                  : 'bg-white border border-secondary-200 text-secondary-900'
              }`}
            >
              {message.mediaUrl && (
                <div className="mb-2">
                  {message.mediaType === 'image' ? (
                    <img 
                      src={message.mediaUrl} 
                      alt="Shared media" 
                      className="max-w-full rounded-lg"
                      loading="lazy"
                    />
                  ) : (
                    <video 
                      src={message.mediaUrl} 
                      controls 
                      className="max-w-full rounded-lg"
                      preload="metadata"
                    />
                  )}
                </div>
              )}
              <p className="whitespace-pre-wrap break-words">{message.text}</p>
              <p className={`text-xs mt-1 ${
                message.sender === 'user' ? 'text-primary-100' : 'text-secondary-500'
              }`}>
                {message.timestamp?.toDate().toLocaleTimeString([], { 
                  hour: '2-digit', 
                  minute: '2-digit' 
                }) || ''}
              </p>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="bg-white border-t border-secondary-200 p-4">
        <div className="flex items-center space-x-2">
          <input
            type="text"
            placeholder="Type a message..."
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            className="flex-1 px-4 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
          <button
            onClick={handleSendMessage}
            disabled={inputMessage.trim() === ''}
            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
} 