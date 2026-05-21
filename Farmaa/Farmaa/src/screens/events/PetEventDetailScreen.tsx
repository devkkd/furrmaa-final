import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Image,
  Modal,
  TextInput,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import leftArrow from '../../assets/images/arrow-left.png';
import eventPoster from '../../assets/images/event-poster.png';
import api from '../../config/api';

const NAVY = '#1F2E46';

const PetEventDetailScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const params = (route.params as any) || {};
  const eventFromParams = params.event;
  const eventIdFromParams = params.eventId || eventFromParams?.id || eventFromParams?._id;

  const [eventData, setEventData] = useState<any>(null);
  const [loadingDetail, setLoadingDetail] = useState(!!eventIdFromParams);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [registerName, setRegisterName] = useState('');
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPhone, setRegisterPhone] = useState('');
  const [registerNotes, setRegisterNotes] = useState('');
  const [registering, setRegistering] = useState(false);

  React.useEffect(() => {
    if (!eventIdFromParams) return;
    let cancelled = false;
    (async () => {
      try {
        const res = await api.CLIENT.get(`${api.ENDPOINTS.PET_EVENTS}/${eventIdFromParams}`);
        if (!cancelled && res.data?.event) {
          const e = res.data.event;
          setEventData({
            id: e._id,
            _id: e._id,
            title: e.title,
            date: e.dateText,
            dateText: e.dateText,
            venue: e.venue,
            city: e.city,
            posterUrl: e.posterUrl || e.images?.[0],
            images: e.images || (e.posterUrl ? [e.posterUrl] : []),
            about: e.description || '',
          });
        }
      } catch {
        if (!cancelled) setEventData(eventFromParams || null);
      } finally {
        if (!cancelled) setLoadingDetail(false);
      }
    })();
    return () => { cancelled = true; };
  }, [eventIdFromParams]);

  const data = eventData || eventFromParams || {
    title: 'Event',
    date: '',
    venue: '',
    city: '',
    posterUrl: null,
    images: [],
    about: '',
  };

  const eventId = data.id || data._id;
  const images = data.images?.filter(Boolean) || (data.posterUrl ? [data.posterUrl] : []);
  const posterSource = images[0] ? { uri: images[0] } : eventPoster;

  const handleRegister = async () => {
    const name = registerName.trim();
    const email = registerEmail.trim();
    const phone = registerPhone.trim();
    if (!name || !email || !phone) {
      Alert.alert('Required', 'Please enter name, email and phone.');
      return;
    }
    if (!eventId) {
      Alert.alert('Error', 'Event not found.');
      return;
    }
    setRegistering(true);
    try {
      await api.CLIENT.post(`${api.ENDPOINTS.PET_EVENTS}/${eventId}/register`, {
        name,
        email,
        phone,
        notes: registerNotes.trim() || undefined,
      });
      setShowRegisterModal(false);
      setRegisterName('');
      setRegisterEmail('');
      setRegisterPhone('');
      setRegisterNotes('');
      Alert.alert('Success', 'You are registered for this event. We will get in touch soon.');
    } catch (e: any) {
      const msg = e?.response?.data?.message || 'Registration failed. Try again.';
      Alert.alert('Error', msg);
    } finally {
      setRegistering(false);
    }
  };

  if (loadingDetail) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="dark-content" />
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Image source={leftArrow} style={styles.backIcon} />
          </TouchableOpacity>
          <Text style={styles.title}>Event Details</Text>
          <View style={styles.headerSpacer} />
        </View>
        <View style={styles.loadingWrap}>
          <ActivityIndicator size="large" color={NAVY} />
          <Text style={styles.loadingText}>Loading event...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Image source={leftArrow} style={styles.backIcon} />
        </TouchableOpacity>
        <Text style={styles.title} numberOfLines={1}>
          Event Details
        </Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.poster}>
          <Image source={posterSource} style={styles.posterImage} />
        </View>
        {images.length > 1 && (
          <View style={styles.posterSecond}>
            <Image source={{ uri: images[1] }} style={styles.posterImage} />
          </View>
        )}

        <View style={styles.body}>
          <Text style={styles.eventTitle}>{data.title || 'Event'}</Text>
          {(data.date || data.dateText) ? (
            <Text style={styles.meta}>{data.date || data.dateText}</Text>
          ) : null}
          {(data.venue || data.city) ? (
            <Text style={styles.meta}>{[data.venue, data.city].filter(Boolean).join(', ')}</Text>
          ) : null}

          {(data.about || data.description) ? (
            <>
              <Text style={styles.sectionTitle}>Event Details</Text>
              <Text style={styles.desc}>{data.about || data.description}</Text>
            </>
          ) : null}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.ctaBtn}
          onPress={() => eventId && setShowRegisterModal(true)}
          disabled={!eventId}
        >
          <Text style={styles.ctaText}>Register / Join</Text>
        </TouchableOpacity>
      </View>

      <Modal visible={showRegisterModal} transparent animationType="fade">
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.modalOverlay}
        >
          <TouchableOpacity
            style={StyleSheet.absoluteFill}
            onPress={() => !registering && setShowRegisterModal(false)}
          />
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Register for this event</Text>
            <Text style={styles.modalSubtitle}>{data.title}</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="Your name *"
              placeholderTextColor="#9CA3AF"
              value={registerName}
              onChangeText={setRegisterName}
              editable={!registering}
            />
            <TextInput
              style={styles.modalInput}
              placeholder="Email *"
              placeholderTextColor="#9CA3AF"
              value={registerEmail}
              onChangeText={setRegisterEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              editable={!registering}
            />
            <TextInput
              style={styles.modalInput}
              placeholder="Phone *"
              placeholderTextColor="#9CA3AF"
              value={registerPhone}
              onChangeText={setRegisterPhone}
              keyboardType="phone-pad"
              editable={!registering}
            />
            <TextInput
              style={[styles.modalInput, styles.modalInputArea]}
              placeholder="Notes (optional)"
              placeholderTextColor="#9CA3AF"
              value={registerNotes}
              onChangeText={setRegisterNotes}
              multiline
              numberOfLines={3}
              editable={!registering}
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.modalCancelBtn}
                onPress={() => !registering && setShowRegisterModal(false)}
                disabled={registering}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalSubmitBtn, registering && styles.modalSubmitDisabled]}
                onPress={handleRegister}
                disabled={registering}
              >
                {registering ? (
                  <ActivityIndicator size="small" color="#FFF" />
                ) : (
                  <Text style={styles.modalSubmitText}>Submit</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  header: {
    paddingTop: 50,
    paddingHorizontal: 16,
    paddingBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  backIcon: { width: 30, height: 30 },
  title: { fontSize: 18, fontWeight: '800', color: '#111827', marginLeft: 20, },
  headerSpacer: { width: 24 },
  poster: {
    height: 465,
    alignItems: 'center',
    justifyContent: 'center',
  },
  posterSecond: {
    height: 280,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    marginTop: 8,
  },
  posterImage: { height: '100%', width: '100%', resizeMode: 'cover', borderRadius: 14 },
  body: { padding: 16, paddingBottom: 90 },
  eventTitle: { fontSize: 18, fontWeight: '900', color: '#111827', marginBottom: 8 },
  meta: { fontSize: 13, color: '#6B7280', marginBottom: 6 },
  sectionTitle: { fontSize: 18, fontWeight: '900', color: '#111827', marginTop: 16, marginBottom: 8 },
  desc: { fontSize: 13, color: '#6B7280', lineHeight: 22 },
  footer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  ctaBtn: { backgroundColor: NAVY, borderRadius: 30, paddingVertical: 16, alignItems: 'center', alignSelf: 'center', paddingHorizontal: 60 },
  ctaText: { color: '#FFFFFF', fontWeight: '900', fontSize: 15 },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: 24,
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
  },
  modalTitle: { fontSize: 18, fontWeight: '800', color: '#111827', marginBottom: 4 },
  modalSubtitle: { fontSize: 13, color: '#6B7280', marginBottom: 16 },
  modalInput: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    color: '#111827',
    marginBottom: 12,
  },
  modalInputArea: { minHeight: 70, textAlignVertical: 'top' },
  modalButtons: { flexDirection: 'row', gap: 12, marginTop: 8 },
  modalCancelBtn: { flex: 1, paddingVertical: 12, alignItems: 'center', borderRadius: 10, backgroundColor: '#F3F4F6' },
  modalCancelText: { fontSize: 15, fontWeight: '600', color: '#6B7280' },
  modalSubmitBtn: { flex: 1, paddingVertical: 12, alignItems: 'center', borderRadius: 10, backgroundColor: NAVY },
  modalSubmitDisabled: { opacity: 0.7 },
  modalSubmitText: { fontSize: 15, fontWeight: '600', color: '#FFFFFF' },
  loadingWrap: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  loadingText: { marginTop: 12, fontSize: 14, color: '#6B7280' },
});

export default PetEventDetailScreen;


