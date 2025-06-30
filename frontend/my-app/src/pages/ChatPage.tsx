import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../lib/store';
import { db } from '../lib/firebase';
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  doc,
  getDoc,
  where,
  getDocs,
  setDoc,
  deleteDoc,
  serverTimestamp,
} from 'firebase/firestore';

interface Chat {
  id: string;
  otherUserId: string;
  participants: string[];
  createdAt: any;
  timestamp: any;
  lastMessage: any;
  unreadCount: number;
  user: {
    name: string;
    avatar: string;
  };
}

interface User {
  id: string;
  displayName: string;
  email: string;
  photoURL: string;
  role: string;
}

export function ChatPage() {
  const navigate = useNavigate();
  const user = useUser();
  const [chats, setChats] = useState<Chat[]>([]);
  const [loadingChats, setLoadingChats] = useState(true);
  const [errorChats, setErrorChats] = useState<string | null>(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [loadingSearch, setLoadingSearch] = useState(false);
  const [errorSearch, setErrorSearch] = useState<string | null>(null);
  const [initiatingChat, setInitiatingChat] = useState(false);

  useEffect(() => {
    if (!user) {
      setLoadingChats(false);
      return;
    }

    const chatsCollectionRef = collection(db, 'users', user.uid, 'chats');
    const chatsQuery = query(chatsCollectionRef, orderBy('timestamp', 'desc'));

    const unsubscribe = onSnapshot(
      chatsQuery,
      async (snapshot) => {
        const chatsData = await Promise.all(snapshot.docs.map(async (chatDocSnap) => {
          const chat = { id: chatDocSnap.id, ...chatDocSnap.data() } as Chat;

          let otherUser = { name: 'Unknown User', avatar: '' };
          if (chat.otherUserId) {
            try {
              const userDocRef = doc(db, 'users', chat.otherUserId);
              const userDocSnap = await getDoc(userDocRef);
              if (userDocSnap.exists()) {
                const userData = userDocSnap.data();
                otherUser = {
                  name: userData.displayName || userData.email || 'Unknown User',
                  avatar: userData.photoURL || '',
                };
              }
            } catch (err) {
              console.error('Error fetching other user details:', err);
            }
          }

          return {
            ...chat,
            user: otherUser,
          };
        }));

        setChats(chatsData);
        setLoadingChats(false);
      },
      err => {
        console.error('Error fetching chats:', err);
        setErrorChats('Failed to load chats.');
        setLoadingChats(false);
      }
    );

    return () => unsubscribe();
  }, [user]);

  const handleSearch = async () => {
    if (searchTerm.trim() === '') {
      setSearchResults([]);
      return;
    }

    setLoadingSearch(true);
    setErrorSearch(null);
    setSearchResults([]);

    try {
      const usersRef = collection(db, 'users');
      const querySnapshot = await getDocs(usersRef);
      const users = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as User[];
      
      const searchTermLower = searchTerm.toLowerCase().trim();
      const filteredUsers = users.filter(userData => {
        const displayName = (userData.displayName || '').toLowerCase();
        const email = (userData.email || '').toLowerCase();
        return (userData.id !== user?.uid) && 
               (displayName.includes(searchTermLower) || 
                email.includes(searchTermLower));
      });

      const sortedUsers = filteredUsers.sort((a, b) => {
        const aName = (a.displayName || '').toLowerCase();
        const bName = (b.displayName || '').toLowerCase();
        const aEmail = (a.email || '').toLowerCase();
        const bEmail = (b.email || '').toLowerCase();
        
        const aStartsWith = aName.startsWith(searchTermLower) || aEmail.startsWith(searchTermLower);
        const bStartsWith = bName.startsWith(searchTermLower) || bEmail.startsWith(searchTermLower);
        
        if (aStartsWith && !bStartsWith) return -1;
        if (!aStartsWith && bStartsWith) return 1;
        return 0;
      });

      setSearchResults(sortedUsers);
    } catch (err) {
      console.error('Error searching users:', err);
      setErrorSearch('Failed to search for users.');
    } finally {
      setLoadingSearch(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchTerm.trim() !== '') {
        handleSearch();
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  const handleUserClick = async (otherUser: User) => {
    if (!user || !otherUser || initiatingChat) return;

    setInitiatingChat(true);
    console.log('Starting chat initiation with user:', otherUser.id);

    try {
      const chatsRef = collection(db, 'users', user.uid, 'chats');
      const existingChatQuery = query(chatsRef, where('otherUserId', '==', otherUser.id));
      const existingChatSnapshot = await getDocs(existingChatQuery);

      if (!existingChatSnapshot.empty) {
        const existingChatId = existingChatSnapshot.docs[0].id;
        console.log('Found existing chat:', existingChatId);
        navigate(`/chat/${existingChatId}`);
        return;
      }

      const newChatId = [user.uid, otherUser.id].sort().join('_');
      console.log('Creating new chat with ID:', newChatId);

      const currentUserChatData = {
        otherUserId: otherUser.id,
        participants: [user.uid, otherUser.id],
        createdAt: serverTimestamp(),
        timestamp: serverTimestamp(),
        lastMessage: null,
        unreadCount: 0
      };

      const otherUserChatData = {
        otherUserId: user.uid,
        participants: [user.uid, otherUser.id],
        createdAt: serverTimestamp(),
        timestamp: serverTimestamp(),
        lastMessage: null,
        unreadCount: 0
      };

      try {
        await setDoc(
          doc(db, 'users', user.uid, 'chats', newChatId), 
          currentUserChatData
        );
        console.log('Successfully created chat in current user subcollection');
      } catch (error) {
        console.error('Error creating chat in current user subcollection:', error);
        throw error;
      }

      try {
        await setDoc(
          doc(db, 'users', otherUser.id, 'chats', newChatId), 
          otherUserChatData
        );
        console.log('Successfully created chat in other user subcollection');
      } catch (error) {
        console.error('Error creating chat in other user subcollection:', error);
        
        try {
          await deleteDoc(doc(db, 'users', user.uid, 'chats', newChatId));
          console.log('Cleaned up current user chat document after failure');
        } catch (cleanupError) {
          console.error('Failed to clean up current user chat document:', cleanupError);
        }
        
        throw error;
      }

      navigate(`/chat/${newChatId}`);
    } catch (err) {
      console.error('Error initiating chat:', err);
      alert(`Failed to start chat: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setInitiatingChat(false);
    }
  };

  const handleChatClick = (chatId: string) => {
    navigate(`/chat/${chatId}`);
  };

  const displaySearchResults = searchTerm.trim() !== '' || loadingSearch || errorSearch;

  if (loadingChats) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-secondary-900">Chats</h1>
          <p className="text-secondary-600">Communicate with other users</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-secondary-200 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-2 text-secondary-600">Loading chats...</p>
        </div>
      </div>
    );
  }

  if (errorChats) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-secondary-900">Chats</h1>
          <p className="text-secondary-600">Communicate with other users</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-secondary-200 text-center">
          <p className="text-red-600">{errorChats}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-secondary-900">Chats</h1>
        <p className="text-secondary-600">Communicate with other users</p>
      </div>

      {/* Search bar */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-secondary-200">
        <div className="relative">
          <input
            type="text"
            placeholder="Search users to chat..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
          {loadingSearch && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary-600"></div>
            </div>
          )}
        </div>
        <p className="text-sm text-secondary-500 mt-1">Search by name or email</p>
      </div>

      {/* Search results or chat list */}
      {displaySearchResults ? (
        <div className="bg-white rounded-lg shadow-sm border border-secondary-200">
          {loadingSearch ? (
            <div className="p-6 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
            </div>
          ) : errorSearch ? (
            <div className="p-6 text-center text-red-600">{errorSearch}</div>
          ) : searchResults.length > 0 ? (
            <div className="divide-y divide-secondary-200">
              {searchResults.map(user => (
                <div
                  key={user.id}
                  onClick={() => handleUserClick(user)}
                  className="p-4 hover:bg-secondary-50 cursor-pointer transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                      {user.photoURL ? (
                        <img src={user.photoURL} alt={user.displayName} className="w-10 h-10 rounded-full" />
                      ) : (
                        <span className="text-primary-600 font-semibold">
                          {user.displayName?.charAt(0) || user.email?.charAt(0) || 'U'}
                        </span>
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-secondary-900">{user.displayName || 'Anonymous User'}</p>
                      <p className="text-sm text-secondary-600">{user.email}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : searchTerm.trim() !== '' && !loadingSearch && (
            <div className="p-6 text-center text-secondary-600">No users found for this search term.</div>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm border border-secondary-200">
          {chats.length === 0 ? (
            <div className="p-6 text-center">
              <p className="text-lg font-medium text-secondary-900">No chats yet</p>
              <p className="text-secondary-600 mt-1">Use the search bar above to find users and start chatting</p>
            </div>
          ) : (
            <div className="divide-y divide-secondary-200">
              {chats.map((chat) => (
                <div
                  key={chat.id}
                  onClick={() => handleChatClick(chat.id)}
                  className="p-4 hover:bg-secondary-50 cursor-pointer transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <div className="relative">
                      <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                        {chat.user.avatar ? (
                          <img src={chat.user.avatar} alt={chat.user.name} className="w-10 h-10 rounded-full" />
                        ) : (
                          <span className="text-primary-600 font-semibold">
                            {chat.user.name.charAt(0)}
                          </span>
                        )}
                      </div>
                      {chat.unreadCount > 0 && (
                        <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                          {chat.unreadCount}
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-secondary-900">{chat.user.name}</p>
                      <p className="text-sm text-secondary-600 truncate">
                        {chat.lastMessage ? (
                          chat.lastMessage.mediaType ? (
                            chat.lastMessage.mediaType === 'image' ? '📷 Image' : '🎥 Video'
                          ) : (
                            chat.lastMessage.text || 'No messages yet.'
                          )
                        ) : (
                          'No messages yet.'
                        )}
                      </p>
                    </div>
                    <div className="text-xs text-secondary-500">
                      {chat.timestamp?.toDate().toLocaleString() || ''}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
} 