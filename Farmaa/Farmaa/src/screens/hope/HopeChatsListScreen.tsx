import React, { useMemo, useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  StatusBar,
  ActivityIndicator,
  RefreshControl,
  Image,
  TextInput,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useAuth } from '../../context/AuthContext';
import api from '../../config/api';
import leftArrow from '../../assets/images/arrow-left.png';
import searchIcon from '../../assets/images/search-normal.png';
import microphoneIcon from '../../assets/images/microphone-2.png';
import petImage from '../../assets/images/pet.png';

const NAVY = '#1F2E46';

type HopeChatThread = {
  id: string;
  _id?: string;
  name: string;
  avatar: string;
  lastMessage: string;
  time: string;
  unread?: boolean;
  postId?: string;
  post?: any;
};

type HopePost = {
  id: string;
  type: 'Adoption' | 'Lost & Found';
  image: string;
  name: string;
  age: string;
  location: string;
};
type ChatItem = {
  id: string;
  _id?: string;
  name: string;
  avatar: string;
  lastMessage: string;
  time: string;
  unread?: boolean;
  postId?: string;
  post?: any;
};
const HopePostAndChatScreen = () => {
  const navigation = useNavigation();
  const { user } = useAuth();
  const [query, setQuery] = useState('');
  const [threads, setThreads] = useState<HopeChatThread[]>([]);
  const [myPosts, setMyPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<'Hope Post' | 'Chats'>('Hope Post');

  const fetchChats = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const response = await api.CLIENT.get(api.ENDPOINTS.HOPE_CHATS || `${api.ENDPOINTS.HOPE}/chats`);
      const fetchedChats = response.data?.chats || [];
      
      const mapped: HopeChatThread[] = fetchedChats.map((chat: any) => {
        const otherParticipant = chat.participants?.find((p: any) => p._id !== user.id);
        const lastMsg = chat.lastMessage;
        
        return {
          id: chat._id,
          _id: chat._id,
          name: otherParticipant?.name || chat.post?.petName || 'User',
          avatar: otherParticipant?.profileImage || (chat.post?.petType === 'dog' ? '🐕' : '🐱'),
          lastMessage: lastMsg?.content || 'No messages yet',
          time: lastMsg?.timestamp ? new Date(lastMsg.timestamp).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : '',
          unread: chat.messages?.some((msg: any) => !msg.read && msg.sender._id !== user.id),
          postId: chat.post?._id,
          post: chat.post,
        };
      });
      
      setThreads(mapped);
    } catch (error: any) {
      console.error('Failed to fetch chats:', error);
      setThreads([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const fetchMyPosts = async () => {
    if (!user) return;
    
    try {
      const response = await api.CLIENT.get(`${api.ENDPOINTS.HOPE}/posts`);
      const all = response.data?.posts || [];
      const uid = String(user?.id || (user as any)?._id || '');
      setMyPosts(
        all.filter((p: any) => {
          const author = p.user?._id ?? p.user;
          return author != null && String(author) === uid;
        })
      );
    } catch (error: any) {
      console.error('Failed to fetch my posts:', error);
      setMyPosts([]);
    }
  };

  useFocusEffect(
    useCallback(() => {
      if (!user) return;
      fetchMyPosts();
      fetchChats();
    }, [user])
  );

  const onRefresh = () => {
    setRefreshing(true);
    if (activeTab === 'Chats') {
      fetchChats();
    } else {
      fetchMyPosts();
    }
  };

  const displayPosts = useMemo(
    () =>
      myPosts.map((p: any) => ({
        id: p._id,
        raw: p,
        type: (p.postType === 'lostFound' ? 'Lost & Found' : 'Adoption') as HopePost['type'],
        image: p.images?.[0] ? { uri: p.images[0] } : petImage,
        name: p.petName || 'Pet',
        age: p.petAgeText || '',
        location: p.locationText || '',
      })),
    [myPosts]
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (activeTab === 'Chats') {
      if (!q) return threads;
      return threads.filter(
        (t) =>
          t.name.toLowerCase().includes(q) || t.lastMessage.toLowerCase().includes(q),
      );
    }
    if (!q) return displayPosts;
    return displayPosts.filter(
      (p: any) =>
        p.name?.toLowerCase().includes(q) || p.location?.toLowerCase().includes(q),
    );
  }, [query, threads, displayPosts, activeTab]);

  const openThread = (thread: HopeChatThread) => {
    navigation.navigate(
      'HopeChat' as never,
      {
        chatId: thread._id || thread.id,
        postId: thread.postId,
        name: thread.name,
      } as never,
    );
  };

  const openPost = (post: any) => {
    navigation.navigate('HopeDetail' as never, { post } as never);
  };

  const renderItem = ({ item }: { item: HopeChatThread }) => (
    <TouchableOpacity style={styles.row} onPress={() => openThread(item)}>
      <View style={styles.avatar}>
        <Text style={styles.avatarEmoji}>{item.avatar}</Text>
      </View>
      <View style={styles.rowBody}>
        <View style={styles.rowTop}>
          <Text style={styles.name} numberOfLines={1}>
            {item.name}
          </Text>
          <Text style={styles.time}>{item.time}</Text>
        </View>
        <View style={styles.rowBottom}>
          <Text style={styles.lastMessage} numberOfLines={1}>
            {item.lastMessage}
          </Text>
          {item.unread ? <View style={styles.unreadDot} /> : null}
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderPost = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => openPost(item.raw || item)}
    >
      <View style={styles.imageWrap}>
        <Image source={typeof item.image === 'string' ? { uri: item.image } : item.image} style={styles.image} />
        <View style={[styles.tag, item.type === 'Adoption' ? styles.adoptTag : styles.lostTag]}>
          <Text style={styles.tagText}>{item.type}</Text>
        </View>
      </View>
      <Text style={styles.cardTitle}>{item.name}</Text>
      <Text style={styles.cardSub}>{item.age}</Text>
      <Text style={styles.cardSub}>{item.location}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Image source={leftArrow} style={styles.back}/>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Hope Post and Chat</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Tabs */}
      <View style={styles.tabs}>
        {(['Hope Post', 'Chats'] as const).map((t) => (
          <TouchableOpacity key={t} onPress={() => setActiveTab(t)}>
            <Text style={[styles.tabText, activeTab === t && styles.tabActive]}>
              {t}
            </Text>
            {activeTab === t && <View style={styles.underline} />}
          </TouchableOpacity>
        ))}
      </View>
      {activeTab === 'Chats' ?(
       <View style={styles.searchWrap}>
        <Image source={searchIcon} style={{marginLeft:10}}/>
              <View style={styles.searchBox}>
                <TextInput
                  style={styles.searchInput}
                  placeholder="Search Chats"
                  placeholderTextColor="#9CA3AF"
                  value={query}
                  onChangeText={setQuery}
                />
               <View style={styles.verticalDivider} />
                       <TouchableOpacity style={styles.micButton}>
                         <Image source={microphoneIcon} style={styles.micIcon} />
                       </TouchableOpacity>
              </View>
            </View>
      ): null }
      {/* Content */}
      {activeTab === 'Hope Post' ? (
        loading && displayPosts.length === 0 ? (
          <ActivityIndicator size="large" color={NAVY} style={{ marginTop: 40 }} />
        ) : (filtered as any[]).length === 0 ? (
          <View style={styles.emptyWrap}>
            <Text style={styles.emptyTitle}>No posts yet</Text>
            <Text style={styles.emptySub}>
              Create a Hope post for adoption or lost & found.
            </Text>
            <TouchableOpacity
              style={styles.startChatButton}
              onPress={() => navigation.navigate('AddHopePost' as never)}
            >
              <Text style={styles.startChatText}>Create post →</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <FlatList
            data={filtered as any[]}
            key="hope-posts"
            numColumns={2}
            keyExtractor={(item) => item.id}
            renderItem={renderPost}
            columnWrapperStyle={styles.column}
            contentContainerStyle={styles.list}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
          />
        )
      ) : loading && threads.length === 0 ? (
        <ActivityIndicator size="large" color={NAVY} style={{ marginTop: 40 }} />
      ) : filtered.length === 0 ? (
        <View style={styles.emptyWrap}>
          <Text style={styles.emptyTitle}>No Chats Yet</Text>
          <Text style={styles.emptySub}>
            Open a Hope listing and tap chat to start a conversation.
          </Text>
          <TouchableOpacity
            style={styles.startChatButton}
            onPress={() => navigation.navigate('Hope' as never)}
          >
            <Text style={styles.startChatText}>Browse Hope →</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={filtered as HopeChatThread[]}
          key="chats"
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.chatList}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        />
      )}
    </View>
  );
};
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 60,
    paddingHorizontal: 16,
    paddingBottom: 12,

  },
  back: { height:30,width:30,marginRight:10, },
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#111827' },

  tabs: {
    flexDirection: 'row',
    gap: 24,
    paddingHorizontal: 16,
    paddingTop: 30,
    borderBottomWidth:1,
    borderBottomColor:'#8E939A',
    marginLeft:10,
    marginRight:10,
  },
  tabText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6B7280',
  },
  tabActive: { color: NAVY },
  underline: {
    height: 2,
    backgroundColor: NAVY,
    marginTop: 6,
    borderRadius: 2,
  },
  searchWrap: { flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 20,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#D9DCE2',
    maxHeight: 56,
    marginHorizontal: 15, 
    marginTop:20,
  },
  searchBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 10,
  },

  micButton: {
    padding: 8,
  },
  micIcon: { width: 30,
    height: 30, },
  searchInput: { flex: 1,
    fontSize: 14,
    color: '#1F2937', },
verticalDivider: {
    width: 2,
    backgroundColor: '#D9DCE2',
    alignSelf: 'stretch',
    marginLeft: 4,
    marginVertical: 5,
  },
  list: { padding: 16 },
  column: { gap: 12 },

  card: { flex: 1, marginBottom: 16 },

  imageWrap: {
    borderRadius: 12,
    overflow: 'hidden',
    height:200,
    width:170,
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode:'cover'
  },

  tag: {
    position: 'absolute',
    top: 8,
    left: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  adoptTag: { backgroundColor: '#84CC16' },
  lostTag: { backgroundColor: '#A855F7' },
  tagText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },

  cardTitle: {
    marginTop: 10,
    fontSize: 14,
    fontWeight: '700',
    color: '#000000',
  },
  cardSub: {
    fontSize: 13,
    color: '#000000',
    marginTop: 5,
  },

  emptyWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 4,
  },
  emptySub: {
    fontSize: 14,
    color: '#000000',
    textAlign: 'center',
    padding:20,
  },
  startChatButton: {
    marginTop: 30,
    backgroundColor: '#1F2E46',
    paddingVertical: 14,
    borderRadius: 25,
    alignItems: 'center',
    paddingHorizontal:40,
  },
  startChatText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  chatList: {
  paddingVertical: 10,
},

chatItem: {
  flexDirection: 'row',
  alignItems: 'center',
  paddingHorizontal: 16,
  paddingVertical: 12,
},

avatar: {
  width: 46,
  height: 46,
  borderRadius: 23,
  marginRight: 12,
},

chatBody: {
  flex: 1,
},

chatName: {
  fontSize: 15,
  fontWeight: '700',
  color: '#111827',
  marginBottom: 2,
},

chatMessage: {
  fontSize: 13,
  color: '#9CA3AF',
},

chatMeta: {
  alignItems: 'flex-end',
  marginLeft: 10,
},

chatTime: {
  fontSize: 11,
  color: '#9CA3AF',
  marginBottom: 6,
},

unreadBadge: {
  backgroundColor: '#84CC16',
  width: 22,
  height: 22,
  borderRadius: 11,
  alignItems: 'center',
  justifyContent: 'center',
},

unreadText: {
  color: '#FFFFFF',
  fontSize: 11,
  fontWeight: '700',
},

row: {
  flexDirection: 'row',
  alignItems: 'center',
  paddingHorizontal: 16,
  paddingVertical: 12,
  borderBottomWidth: 1,
  borderBottomColor: '#F3F4F6',
},
rowBody: {
  flex: 1,
  marginLeft: 12,
},
rowTop: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: 4,
},
rowBottom: {
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'space-between',
},
name: {
  fontSize: 15,
  fontWeight: '700',
  color: '#111827',
  flex: 1,
},
time: {
  fontSize: 12,
  color: '#9CA3AF',
},
lastMessage: {
  fontSize: 13,
  color: '#6B7280',
  flex: 1,
},
unreadDot: {
  width: 8,
  height: 8,
  borderRadius: 4,
  backgroundColor: '#84CC16',
  marginLeft: 8,
},
avatarEmoji: {
  fontSize: 24,
},

/* EMPTY STATE */
// emptyWrap: {
//   flex: 1,
//   alignItems: 'center',
//   justifyContent: 'center',
//   paddingHorizontal: 30,
// },

// emptyTitle: {
//   fontSize: 18,
//   fontWeight: '800',
//   color: '#111827',
//   marginBottom: 10,
// },

// emptySub: {
//   fontSize: 14,
//   color: '#6B7280',
//   textAlign: 'center',
//   lineHeight: 22,
//   marginBottom: 24,
// },

// startChatButton: {
//   backgroundColor: '#1E293B',
//   paddingHorizontal: 24,
//   paddingVertical: 12,
//   borderRadius: 999,
// },

// startChatText: {
//   color: '#FFFFFF',
//   fontSize: 14,
//   fontWeight: '700',
// },
});
export default HopePostAndChatScreen;