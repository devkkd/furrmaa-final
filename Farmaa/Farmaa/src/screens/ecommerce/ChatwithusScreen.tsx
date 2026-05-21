import React from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Image,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import leftArrow from '../../assets/images/arrow-left.png';
import attachIcon from '../../assets/images/attach-square.png';
import sendIcon from '../../assets/images/send.png';

const ChatWithUsScreen: React.FC = () => {
  const navigation = useNavigation();
  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
         <TouchableOpacity onPress={() => navigation.goBack()}>
            <Image  source={leftArrow} style={styles.back} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Chat With us</Text>
      </View>

      {/* Chat Messages */}
      <ScrollView
        contentContainerStyle={{
        flexGrow: 1, justifyContent: 'flex-end',paddingBottom: 20,padding:15,
        }}
        showsVerticalScrollIndicator={false}
        >
        <Text style={styles.date}>10 December 2025</Text>

        {/* User Message */}
        <View style={styles.userBubble}>
          <Text style={styles.userText}>Pet Health Guidance?</Text>
          
        </View>
        <Text style={styles.time}>12:45 pm</Text>

        {/* Bot Message */}
        <View style={styles.botBubble}>
          <Text style={styles.botText}>
            Ask about symptoms, care tips, or general health questions.
          </Text>
        </View>
        <Text style={{left:0,alignSelf: 'flex-start',marginLeft: 5,fontSize:12}}>12:45 pm</Text>
      </ScrollView>

      {/* Input */}
      <View style={styles.inputRow}>
        <Image source={attachIcon} style={{width:24,height:24,marginRight:10}} />
        <TextInput
          placeholder="Write your message"
          placeholderTextColor="#9CA3AF"
          style={styles.input}
        />
        <TouchableOpacity style={styles.sendBtn}>
            <Image source={sendIcon} style={styles.sendIcon} />
        </TouchableOpacity>
      </View>
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
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginTop: 50,
  },

  back: {
    width: 30,
    height: 30,
    marginRight: 10,
  },

  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },

  chat: {
    flex: 1,
  },

  chatContent: {
    padding: 16,
    paddingBottom: 30,
    justifyContent: 'flex-end',
  },

  date: {
    textAlign: 'center',
    fontSize: 12,
    color: '#9CA3AF',
    marginBottom: 20,
  },

  userBubble: {
    alignSelf: 'flex-end',
    backgroundColor: '#E5E7EB',
    borderRadius: 30,
    padding: 12,
    maxWidth: '70%',
    marginBottom: 14,
  },

  userText: {
    fontSize: 14,
    color: '#111827',
  },

  botBubble: {
    alignSelf: 'flex-start',
    borderRadius: 30,
    padding: 12,
    maxWidth: '75%',
    marginBottom: 14,
  },

  botText: {
    fontSize: 14,
    color: '#000000',
  },

  time: {
    fontSize: 10,
    color: '#000000',
    alignSelf: 'flex-end',
  },

  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },

  input: {
    flex: 1,
    height: 44,
    backgroundColor: '#F9FAFB',
    borderRadius: 22,
    paddingHorizontal: 16,
    fontSize: 14,
  },

  sendBtn: {
    // marginLeft: 10,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#1F2937',
    alignItems: 'center',
    justifyContent: 'center',
  },

  sendIcon: {
    width: 24,
    height: 24,
  },
});

export default ChatWithUsScreen;