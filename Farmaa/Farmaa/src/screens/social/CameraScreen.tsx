import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  StatusBar,
  Image,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import vectorIcon from '../../assets/images/Vector.png';
import effectsIcon from '../../assets/images/magicpen.png';
import lengthIcon from '../../assets/images/timer.png';
import audioIcon from '../../assets/images/music.png';
import cameraBg from '../../assets/images/cameraBg.png';
import galleryIcon from '../../assets/images/gallery.png';
import rotateIcon from '../../assets/images/refresh-2.png';  

const { width, height } = Dimensions.get('window');

const CameraScreen = () => {
  
  const navigation = useNavigation();
  const [isRecording, setIsRecording] = useState(false);
  const [hasRecorded, setHasRecorded] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [recordProgress, setRecordProgress] = useState(0);

  const handleRecord = () => {
    if (!hasRecorded) {
      setIsRecording(true);
      // Simulate recording progress
      let progress = 0;
      const interval = setInterval(() => {
        progress += 10;
        setRecordProgress(progress);
        if (progress >= 100) {
          clearInterval(interval);
          setIsRecording(false);
          setHasRecorded(true);
        }
      }, 200);
    }
  };

  const handleUndo = () => {
    setHasRecorded(false);
    setRecordProgress(0);
    setIsRecording(false);
  };

  const handleNext = () => {
    (navigation as any).navigate('PostVideo' as never, { hasVideo: true } as never);
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      {/* Camera Preview */}
      <View style={styles.cameraPreview}>
        <Image source={cameraBg} style={styles.cameraBg} />
      </View>

      {/* Top Controls */}
      <View style={styles.topControls}>
        <TouchableOpacity
          style={styles.topButton}
          onPress={() => navigation.goBack()}
        >
          <View style={styles.closeButton}>
            <Text style={styles.closeButtonText}>✕</Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.topButton}
          onPress={() => setIsMuted(!isMuted)}
        >
          <View style={styles.vectorButton}>
            <Image source={vectorIcon} style={styles.vectorIcon} />
          </View>
        </TouchableOpacity>
      </View>

      {/* Left Sidebar Controls */}
      <View style={styles.leftSidebar}>
        <TouchableOpacity style={styles.sidebarButton}>
          <Image source={audioIcon} style={styles.sidebarIcon} />
          <Text style={styles.sidebarText}>Audio</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.sidebarButton}>
          <Image source={effectsIcon} style={styles.sidebarIcon} />
          <Text style={styles.sidebarText}>Effects</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.sidebarButton}>
          <Image source={lengthIcon} style={styles.sidebarIcon} />
          <Text style={styles.sidebarText}>Length</Text>
        </TouchableOpacity>
      </View>

      {/* Bottom Controls */}
      <View style={styles.bottomControls}>
        {!hasRecorded ? (
          <>
            <View style={styles.upperBar}>
              <View style={{ width: 60 }} />
              <TouchableOpacity
                style={styles.recordButtonContainer}
                onPress={handleRecord}
              >
                <View
                  style={[
                    styles.recordButton,
                    isRecording && styles.recordButtonRecording,
                  ]}
                >
                  <View
                    style={[
                      styles.recordButtonInner,
                      isRecording && styles.recordButtonInnerRecording,
                    ]}
                  />
                </View>
              </TouchableOpacity>

              {/* Filters */}
              <View style={styles.rightBottomButtons}>
                <TouchableOpacity style={styles.filterButton}>
                  <View style={styles.filterButtonYellow} />
                </TouchableOpacity>
                <TouchableOpacity style={styles.filterButton}>
                  <View style={styles.filterButtonBlue} />
                </TouchableOpacity>
              </View>
            </View>

            {/* Lower row */}
            <View style={styles.lowerBar}>
              <TouchableOpacity style={styles.galleryButton}>
                <Image source={galleryIcon} style={styles.galleryIcon} />
              </TouchableOpacity>

              <TouchableOpacity style={styles.rotateButton}>
                <Image source={rotateIcon} style={styles.rotateIcon} />
              </TouchableOpacity>
            </View>
          </>
        ) : (
          /* After recording */
          <View style={styles.recordedBar}>
            <TouchableOpacity style={styles.undoButton} onPress={handleUndo}>
              <Text style={styles.undoButtonText}>Undo</Text>
            </TouchableOpacity>

            <View style={styles.recordButtonContainer}>
              <View style={styles.recordButtonCompleted}>
                <View style={styles.recordButtonInnerCompleted} />
              </View>
            </View>

            <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
              <Text style={styles.nextButtonText}>Next →</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  cameraPreview: {
    flex: 1,
    backgroundColor: '#1A1A1A',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cameraBg: {
    position: 'absolute',
    width: '100%',
    height: '90%',
    resizeMode: 'cover',
    borderRadius: 16,
    paddingBottom: 100,
  },
  topControls: {
    position: 'absolute',
    top: 50,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    zIndex: 10,
  },
  topButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 18,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  vectorButton: {
    width: 36,
    height: 36,
    borderWidth: 2,
    borderColor: '#FFFFFF',
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  vectorIcon: {
    width: 20,
    height: 20,
  },
  leftSidebar: {
    position: 'absolute',
    left: 15,
    top: '30%',
    alignItems: 'flex-start',
    gap: 25,
    zIndex: 10,
  },
  sidebarButton: {
    flexDirection: 'row', 
    alignItems: 'center',
    gap: 15,
  },
  sidebarIcon: {
    width: 30,
    height: 30,
    marginBottom: 4,
  },
  sidebarText: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '500',
  },
bottomControls: {
  position: 'absolute',
  bottom: 20,
  width: '100%',
  paddingHorizontal: 20,
},

upperBar: {
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'space-between',
  marginBottom: 20,
},

recordButtonContainer: {
  alignItems: 'center',
  justifyContent: 'center',
},
recordButtonCompleted: {
  width: 80,
  height: 80,
  borderRadius: 40,
  borderWidth: 4,
  borderColor: '#10B981', 
  alignItems: 'center',
  justifyContent: 'center',
},

recordButtonInnerCompleted: {
  width: 60,
  height: 60,
  borderRadius: 30,
  backgroundColor: '#10B981',
},

recordButton: {
  width: 80,
  height: 80,
  borderRadius: 40,
  borderWidth: 4,
  borderColor: '#FFFFFF',
  alignItems: 'center',
  justifyContent: 'center',
},

recordButtonInner: {
  width: 60,
  height: 60,
  borderRadius: 30,
  backgroundColor: '#FFFFFF',
},

rightBottomButtons: {
  flexDirection: 'row',
  gap: 10,
},

filterButton: {
  width: 36,
  height: 36,
  borderRadius: 18,
  alignItems: 'center',
  justifyContent: 'center',
},

filterButtonYellow: {
  width: 50,
  height: 50,
  borderRadius: 14,
  backgroundColor: '#FACC15',
  marginRight: 50,
},

filterButtonBlue: {
  width: 50,
  height: 50,
  borderRadius: 14,
  backgroundColor: '#2563EB',

},

lowerBar: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
},

galleryButton: {
  width: 40,
  height: 40,
},

galleryIcon: {
  width: 40,
  height: 40,
},

rotateButton: {
  width: 40,
  height: 40,
},

rotateIcon: {
  width: 40,
  height: 40,
},

recordedBar: {
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'space-between',
  paddingHorizontal: 40,
  paddingVertical: 30,

},

 recordButtonRecording: {
    borderColor: '#EF4444',
  },
  recordButtonRecorded: {
    borderWidth: 4,
  },
  recordButtonInnerRecording: {
    backgroundColor: '#EF4444',
  },
  recordButtonInnerRecorded: {
    backgroundColor: '#EF4444',
  },
  
undoButton: {
  backgroundColor: '#8E939A',
  paddingHorizontal: 24,
  paddingVertical: 12,
  borderRadius: 30,
},

undoButtonText: {
  fontSize: 14,
  color: '#FFFFFF',
},

nextButton: {
  backgroundColor: '#ffffff',
  paddingHorizontal: 24,
  paddingVertical: 12,
  borderRadius: 30,
},

nextButtonText: {
  color: '#000000',
  fontWeight: '600',
},

});

export default CameraScreen;

