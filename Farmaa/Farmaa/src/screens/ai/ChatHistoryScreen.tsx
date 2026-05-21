import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  StatusBar,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../../context/AuthContext';
import api from '../../config/api';

interface ChatHistoryItem {
  id: string;
  topic: string;
  timestamp: string;
  lastMessage?: string;
}

const ChatHistoryScreen = () => {
  const navigation = useNavigation();
  const { user } = useAuth();
  const [chatHistory, setChatHistory] = useState<ChatHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchChatHistory();
  }, []);

  const fetchChatHistory = async () => {
    try {
      setLoading(true);
      const response = await api.CLIENT.get(api.ENDPOINTS.AI_CHAT.SESSIONS);
      if (response.data?.chats) {
        setChatHistory(response.data.chats);
      }
    } catch (error: any) {
      console.error('Failed to fetch chat history:', error);
      setChatHistory([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchChatHistory();
  };

  const handleChatSelect = (chat: ChatHistoryItem) => {
    navigation.navigate('PetAIChat' as never, { sessionId: chat.id } as never);
  };

  const formatTimestamp = (timestamp: string | Date) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 60) {
      return `${minutes} minutes ago`;
    } else if (hours < 24) {
      return `${hours} hours ago`;
    } else if (days < 7) {
      return `${days} days ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  const renderChatItem = ({ item }: { item: ChatHistoryItem }) => (
    <TouchableOpacity
      style={styles.chatItem}
      onPress={() => handleChatSelect(item)}
    >
      <View style={styles.chatItemContent}>
      <Text style={styles.chatTopic}>{item.topic}</Text>
        {item.lastMessage && (
          <Text style={styles.chatLastMessage} numberOfLines={1}>
            {item.lastMessage}
          </Text>
        )}
        <Text style={styles.chatTimestamp}>{formatTimestamp(item.timestamp)}</Text>
      </View>
      <Text style={styles.chatQuestionMark}>?</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Image  source={leftArrow} style={styles.backIcon} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Chat History</Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* Chat History List */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#1E3A8A" />
          <Text style={styles.loadingText}>Loading chat history...</Text>
        </View>
      ) : chatHistory.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyTitle}>No Chat History</Text>
          <Text style={styles.emptyDescription}>
            Start a new conversation with our AI assistant to get help with your pet care questions.
          </Text>
          <TouchableOpacity
            style={styles.newChatButton}
            onPress={() => navigation.navigate('PetAIChat' as never, {} as never)}
          >
            <Text style={styles.newChatButtonText}>Start New Chat →</Text>
          </TouchableOpacity>
        </View>
      ) : (
      <FlatList
        data={chatHistory}
        keyExtractor={(item) => item.id}
        renderItem={renderChatItem}
        contentContainerStyle={styles.listContent}
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
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 50,
    paddingHorizontal: 20,
    backgroundColor: '#FFFFFF',
    marginVertical: 15,

  },
  backIcon: {
    width: 30,
    height: 30,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 12,
    color: '#1F2937',
  },
  headerSpacer: {
    width: 24,
  },
  listContent: {
    padding: 20,
    paddingHorizontal: 32,
  },
  chatItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 24,
    borderRadius: 30,
  },
  chatItemContent: {
    flex: 1,
    marginRight: 10,
  },
  chatTopic: {
    fontSize: 16,
    color: '#1F2937',
    fontWeight: '500',
    marginBottom: 4,
  },
  chatLastMessage: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
  },
  chatTimestamp: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  chatQuestionMark: {
    fontSize: 20,
    color: '#9CA3AF',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 14,
    color: '#6B7280',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 12,
    textAlign: 'center',
  },
  emptyDescription: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  newChatButton: {
    backgroundColor: '#1E3A8A',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  newChatButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default ChatHistoryScreen;

