import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  FlatList,
  StatusBar,
  ActivityIndicator,
  ScrollView,
  Image,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useAuth } from '../../context/AuthContext';
import api from '../../config/api';
import leftArrow from '../../assets/images/arrow-left.png';
import historyIcon from '../../assets/images/clock.png';
import copyIcon from '../../assets/images/document-copy.png';
import likeIcon from '../../assets/images/like.png';
import dislikeIcon from '../../assets/images/dislike.png';
import attachIcon from '../../assets/images/attach-square.png';

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

const PetAIChatScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { user } = useAuth();
  // Safely extract route params with default values
  const routeParams = route.params as any || {};
  const initialTopic = routeParams?.initialTopic;
  const initialSessionId = routeParams?.sessionId;
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [sessionId, setSessionId] = useState<string | null>(initialSessionId || null);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);

  useEffect(() => {
    if (initialSessionId) {
      fetchChatSession(initialSessionId);
    } else if (initialTopic) {
      createNewSession(initialTopic);
    }
    // If no initial topic or session, just show welcome screen
  }, [initialTopic, initialSessionId]);

  const createNewSession = async (firstMessage?: string) => {
    try {
      setLoading(true);
      const response = await api.CLIENT.post(api.ENDPOINTS.AI_CHAT.SESSIONS, {
        title: firstMessage || 'New Chat',
      });
      const newSessionId = response.data.chat.sessionId;
      setSessionId(newSessionId);
      
      if (firstMessage) {
        await sendMessage(firstMessage, newSessionId);
      }
    } catch (error: any) {
      console.error('Failed to create session:', error);
      // Fallback: use local session ID
      const fallbackSessionId = `chat_${Date.now()}_${user?.id || 'guest'}`;
      setSessionId(fallbackSessionId);
      if (firstMessage) {
        handleSendMessageLocal(firstMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchChatSession = async (sessionId: string) => {
    try {
      setLoading(true);
      const response = await api.CLIENT.get(
        api.ENDPOINTS.AI_CHAT.SESSION.replace(':sessionId', sessionId)
      );
      
      if (response.data.chat && response.data.chat.messages) {
        const formattedMessages = response.data.chat.messages.map((msg: any) => ({
          id: msg._id || Date.now().toString(),
          text: msg.content,
          isUser: msg.role === 'user',
          timestamp: new Date(msg.timestamp),
        }));
        setMessages(formattedMessages);
      }
    } catch (error: any) {
      console.error('Failed to fetch chat session:', error);
    } finally {
      setLoading(false);
    }
  };

  const suggestedTopics = [
    'Pet Health Guidance?',
    'Find Nearby Vet Clinics?',
    'Pet Nutrition Advice?',
    'Behavior & Training Tips?',
    'Grooming & Hygiene?',
    'Lost & Found Support?',
    'Pet Adoption Guidance?',
    'Pet Events Information?',
  ];

  const handleSendMessage = async (text: string) => {
    if (!text.trim() || sending) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: text.trim(),
      isUser: true,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputText('');
    setSending(true);

    // Create session if doesn't exist
    let currentSessionId = sessionId;
    if (!currentSessionId) {
      try {
        const response = await api.CLIENT.post(api.ENDPOINTS.AI_CHAT.SESSIONS, {
          title: text.trim().substring(0, 50),
        });
        currentSessionId = response.data.chat.sessionId;
        setSessionId(currentSessionId);
      } catch (error) {
        console.error('Failed to create session:', error);
        handleSendMessageLocal(text);
        return;
      }
    }

    // Send message to API
    try {
      const response = await api.CLIENT.post(
        api.ENDPOINTS.AI_CHAT.MESSAGE.replace(':sessionId', currentSessionId),
        {
          message: text.trim(),
        }
      );

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: response.data.message.content,
        isUser: false,
        timestamp: new Date(response.data.message.timestamp),
      };
      setMessages((prev) => [...prev, aiMessage]);
    } catch (error: any) {
      console.error('Failed to send message:', error);
      // Fallback response
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: 'I apologize, but I\'m having trouble processing your request right now. Please try again in a moment.',
        isUser: false,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiMessage]);
    } finally {
      setSending(false);
    }
  };

  const handleSendMessageLocal = (text: string) => {
    // Fallback local handling
    const userMessage: Message = {
      id: Date.now().toString(),
      text: text.trim(),
      isUser: true,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMessage]);
    
    setTimeout(() => {
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: 'I\'m here to help with pet-related questions! You can ask about pet health, nutrition, behavior, grooming, finding vets, adoption, or any other pet care topics.',
        isUser: false,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiMessage]);
    }, 1000);
  };

  const handleSuggestedTopic = (topic: string) => {
    handleSendMessage(topic);
  };

  const renderMessage = ({ item }: { item: Message }) => (
    <View
      style={[
        styles.messageContainer,
        item.isUser ? styles.userMessage : styles.aiMessage,
      ]}
    >
      <Text
        style={[
          styles.messageText,
          item.isUser ? styles.userMessageText : styles.aiMessageText,
        ]}
      >
        {item.text}
      </Text>
      {!item.isUser && (
        <View style={styles.messageActions}>
          <TouchableOpacity style={styles.actionButton}>
            <Image source={copyIcon} style={styles.actionIcon} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton}>
            <Image source={likeIcon} style={styles.actionIcon} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton}>
            <Image source={dislikeIcon} style={styles.actionIcon} />
          </TouchableOpacity>
        </View>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Image source={leftArrow} style={styles.backIcon} />
        </TouchableOpacity>
        <View style={styles.headerSpacer} />
        <TouchableOpacity
          onPress={() => navigation.navigate('ChatHistory' as never)}
        >
          <View style={styles.historyButton}>
            <Image source={historyIcon} style={styles.historyIcon} />
            <Text style={styles.historyText}>History</Text>
          </View>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#1E3A8A" />
          <Text style={styles.loadingText}>Loading chat...</Text>
        </View>
      ) : (
      <ScrollView
          ref={scrollViewRef}
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
          onContentSizeChange={() => {
            scrollViewRef.current?.scrollToEnd({ animated: true });
          }}
      >
        {messages.length === 0 ? (
          <>
            {/* Welcome Message */}
            <View style={styles.welcomeContainer}>
              <Text style={styles.welcomeTitle}>
                Welcome to Furrmaa Pet AI Chat
              </Text>
              <Text style={styles.welcomeSubtitle}>
                How can I help you today?
              </Text>
            </View>

            {/* Suggested Topics */}
            <View style={styles.suggestedTopicsContainer}>
              {suggestedTopics.map((topic, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.suggestedTopic}
                  onPress={() => handleSuggestedTopic(topic)}
                >
                  <Text style={styles.suggestedTopicText}>{topic}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </>
        ) : (
          <FlatList
            data={messages}
            keyExtractor={(item) => item.id}
            renderItem={renderMessage}
            scrollEnabled={false}
          />
        )}
      </ScrollView>
      )}

      {/* Input Area */}
      <View style={styles.inputContainer}>
        <TouchableOpacity style={styles.cameraButton}>
          <Image source={attachIcon} style={styles.cameraIcon} />
        </TouchableOpacity>
        <TextInput
          style={styles.input}
          placeholder={messages.length === 0 ? 'Ask anything' : 'Ask anything'}
          placeholderTextColor="#9CA3AF"
          value={inputText}
          onChangeText={setInputText}
          multiline
          onSubmitEditing={() => handleSendMessage(inputText)}
        />
        <TouchableOpacity
          style={styles.sendButton}
          onPress={() => handleSendMessage(inputText)}
          disabled={!inputText.trim() || sending}
        >
          {sending ? (
            <ActivityIndicator size="small" color="#1E3A8A" />
          ) : (
          <Text style={styles.sendIcon}>✈️</Text>
          )}
        </TouchableOpacity>
      </View>

      {/* Disclaimer */}
      <Text style={styles.disclaimer}>
        AI can make mistakes. Please double-check responses.
      </Text>
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 15,
    backgroundColor: '#FFFFFF',
  },
  backIcon: {
    width: 30,
    height: 30,
  },
  headerSpacer: {
    flex: 1,
  },
  historyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#D9DCE2',
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 20,
    gap: 6,
  },
  historyIcon: {
    width: 22,
    height: 22,
  },
  historyText: {
    fontSize: 14,
    color: '#1F2937',
    fontWeight: '600',
  },
  contentContainer: {
  paddingHorizontal: 24,
  paddingTop: 40,
  paddingBottom: 140,
},
  welcomeContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  welcomeTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 6,
    textAlign: 'center',

  },
  welcomeSubtitle: {
    fontSize: 16,
    color: '#000000',
    textAlign: 'center',
  },
  suggestedTopicsContainer: {
    gap: 12,
  },
suggestedTopic: {
  alignSelf: 'flex-start',
  backgroundColor: '#FFFFFF',
  paddingVertical: 12,
  paddingHorizontal: 18,
  borderRadius: 999,
  elevation: 0.3,
  borderColor: '#E5E7EB',
},
  suggestedTopicText: {
    fontSize: 16,
    color: '#1F2937',
    fontWeight: '500',
  },
  messageContainer: {
  marginBottom: 14,
  padding: 14,
  borderRadius: 14,
},

  userMessage: {
    alignContent: 'flex-end',
    alignSelf: 'flex-end',
    backgroundColor: '#ffffff',
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 999,
    elevation: 0.6,
  },
  aiMessage: {
    alignSelf: 'flex-start',
  },
  messageText: {
    fontSize: 14,
    lineHeight: 20,
  },
  userMessageText: {
    color: '#000000',
  },
  aiMessageText: {
    color: '#1F2937',
  },
  messageActions: {
    flexDirection: 'row',
    marginTop: 10,
    gap: 10,
  },
  actionButton: {
    padding: 4,
  },
  actionIcon: {
    width: 22,
    height: 22,
    tintColor: '#8E939A',
  },
  inputContainer: {
  position: 'absolute',
  bottom: 28,
  left: 20,
  right: 20,
  backgroundColor: '#FFFFFF',
  borderRadius: 30,
  paddingHorizontal: 14,
  paddingVertical: 12,
  borderWidth: 1,
  borderColor: '#E5E7EB',
},

  cameraButton: {
  position: 'absolute',
  bottom: 10,
  left: 14,
},

cameraIcon: {
  width: 26,
  height: 26,
},

  input: {
  width: '100%',
  fontSize: 14,
  color: '#111827',
  paddingVertical: 8,
  marginBottom: 40,
},
  sendButton: {
  position: 'absolute',
  bottom: 8,
  right: 10,
  width: 40,
  height: 40,
  borderRadius: 18,
  backgroundColor: '#1F2E46',
  alignItems: 'center',
  justifyContent: 'center',
},

sendIcon: {
  fontSize: 20,
  color: '#FFFFFF',
},

  disclaimer: {
    fontSize: 11,
    color: '#9CA3AF',
    textAlign: 'center',
    paddingBottom: 10,
    paddingHorizontal: 20,
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
});

export default PetAIChatScreen;

