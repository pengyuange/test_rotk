import { useState } from 'react';
import {
  StyleSheet,
  View,
  TextInput,
  TouchableOpacity,
  Text,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Mic, Volume2, ArrowLeftRight } from 'lucide-react-native';
import { Audio } from 'expo-av';
import * as Speech from 'expo-speech';
import { useMutation } from '@tanstack/react-query';
import { LANGUAGES, Language } from '@/constants/languages';

export default function TranslateScreen() {
  const [sourceLanguage, setSourceLanguage] = useState<Language>(LANGUAGES[0]);
  const [targetLanguage, setTargetLanguage] = useState<Language>(LANGUAGES[1]);
  const [inputText, setInputText] = useState<string>('');
  const [translatedText, setTranslatedText] = useState<string>('');
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [showSourcePicker, setShowSourcePicker] = useState<boolean>(false);
  const [showTargetPicker, setShowTargetPicker] = useState<boolean>(false);

  const translateMutation = useMutation({
    mutationFn: async (text: string) => {
      const apiKey = process.env.EXPO_PUBLIC_DEEPSEEK_API_KEY;
      if (!apiKey) {
        throw new Error('Please set EXPO_PUBLIC_DEEPSEEK_API_KEY in your environment');
      }

      const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: 'deepseek-chat',
          messages: [
            {
              role: 'user',
              content: `Translate the following text from ${sourceLanguage.name} to ${targetLanguage.name}. Only respond with the translation, no explanations:\n\n${text}`,
            },
          ],
          temperature: 0.3,
        }),
      });

      if (!response.ok) {
        throw new Error('Translation failed');
      }

      const data = await response.json();
      return data.choices[0].message.content;
    },
    onSuccess: (data) => {
      setTranslatedText(data);
    },
    onError: (error) => {
      console.error('Translation error:', error);
      Alert.alert('Error', error instanceof Error ? error.message : 'Translation failed');
    },
  });

  const handleTranslate = () => {
    if (!inputText.trim()) {
      return;
    }
    translateMutation.mutate(inputText);
  };

  const handleSwapLanguages = () => {
    setSourceLanguage(targetLanguage);
    setTargetLanguage(sourceLanguage);
    setInputText(translatedText);
    setTranslatedText(inputText);
  };

  const startRecording = async () => {
    try {
      const { status } = await Audio.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission required', 'Please grant microphone permission');
        return;
      }

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const { recording: newRecording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );

      setRecording(newRecording);
      setIsRecording(true);
      console.log('Recording started');
    } catch (error) {
      console.error('Failed to start recording:', error);
      Alert.alert('Error', 'Failed to start recording');
    }
  };

  const stopRecording = async () => {
    if (!recording) return;

    try {
      console.log('Stopping recording');
      setIsRecording(false);
      await recording.stopAndUnloadAsync();
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
      });

      const uri = recording.getURI();
      console.log('Recording stopped and stored at', uri);

      Alert.alert(
        'Recording Complete',
        'Speech-to-text is not yet implemented. Please use text input for now.'
      );

      setRecording(null);
    } catch (error) {
      console.error('Failed to stop recording:', error);
      Alert.alert('Error', 'Failed to stop recording');
    }
  };

  const handleMicPress = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  const handleSpeak = () => {
    if (!translatedText.trim()) return;

    Speech.speak(translatedText, {
      language: targetLanguage.code,
      pitch: 1.0,
      rate: 0.9,
    });
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        style={styles.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <Text style={styles.headerTitle}>Translate</Text>
      </LinearGradient>

      <View style={styles.languageSelector}>
        <TouchableOpacity
          style={styles.languageButton}
          onPress={() => setShowSourcePicker(!showSourcePicker)}
        >
          <Text style={styles.languageFlag}>{sourceLanguage.flag}</Text>
          <Text style={styles.languageName}>{sourceLanguage.name}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.swapButton}
          onPress={handleSwapLanguages}
        >
          <ArrowLeftRight size={24} color="#667eea" />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.languageButton}
          onPress={() => setShowTargetPicker(!showTargetPicker)}
        >
          <Text style={styles.languageFlag}>{targetLanguage.flag}</Text>
          <Text style={styles.languageName}>{targetLanguage.name}</Text>
        </TouchableOpacity>
      </View>

      {showSourcePicker && (
        <ScrollView style={styles.picker}>
          {LANGUAGES.map((lang) => (
            <TouchableOpacity
              key={lang.code}
              style={styles.pickerItem}
              onPress={() => {
                setSourceLanguage(lang);
                setShowSourcePicker(false);
              }}
            >
              <Text style={styles.pickerFlag}>{lang.flag}</Text>
              <Text style={styles.pickerText}>{lang.name}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}

      {showTargetPicker && (
        <ScrollView style={styles.picker}>
          {LANGUAGES.map((lang) => (
            <TouchableOpacity
              key={lang.code}
              style={styles.pickerItem}
              onPress={() => {
                setTargetLanguage(lang);
                setShowTargetPicker(false);
              }}
            >
              <Text style={styles.pickerFlag}>{lang.flag}</Text>
              <Text style={styles.pickerText}>{lang.name}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.inputSection}>
          <View style={styles.inputHeader}>
            <Text style={styles.sectionLabel}>Input</Text>
            <TouchableOpacity
              style={[
                styles.micButton,
                isRecording && styles.micButtonActive,
              ]}
              onPress={handleMicPress}
            >
              <Mic size={20} color={isRecording ? '#fff' : '#667eea'} />
            </TouchableOpacity>
          </View>

          <TextInput
            style={styles.textInput}
            placeholder={`Enter text in ${sourceLanguage.name}...`}
            placeholderTextColor="#999"
            multiline
            value={inputText}
            onChangeText={setInputText}
            onSubmitEditing={handleTranslate}
          />

          <TouchableOpacity
            style={[
              styles.translateButton,
              translateMutation.isPending && styles.translateButtonDisabled,
            ]}
            onPress={handleTranslate}
            disabled={translateMutation.isPending || !inputText.trim()}
          >
            {translateMutation.isPending ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.translateButtonText}>Translate</Text>
            )}
          </TouchableOpacity>
        </View>

        {translatedText && (
          <View style={styles.outputSection}>
            <View style={styles.outputHeader}>
              <Text style={styles.sectionLabel}>Translation</Text>
              <TouchableOpacity
                style={styles.speakButton}
                onPress={handleSpeak}
              >
                <Volume2 size={20} color="#667eea" />
              </TouchableOpacity>
            </View>

            <View style={styles.translationBox}>
              <Text style={styles.translationText}>{translatedText}</Text>
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 24,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: '700' as const,
    color: '#fff',
    letterSpacing: 0.5,
  },
  languageSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  languageButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    gap: 8,
  },
  languageFlag: {
    fontSize: 24,
  },
  languageName: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#333',
  },
  swapButton: {
    padding: 12,
    marginHorizontal: 8,
  },
  picker: {
    maxHeight: 300,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  pickerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    gap: 12,
  },
  pickerFlag: {
    fontSize: 24,
  },
  pickerText: {
    fontSize: 16,
    color: '#333',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 24,
  },
  inputSection: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  inputHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: '#667eea',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  micButton: {
    padding: 10,
    backgroundColor: '#f5f5f5',
    borderRadius: 20,
  },
  micButtonActive: {
    backgroundColor: '#667eea',
  },
  textInput: {
    minHeight: 120,
    fontSize: 16,
    color: '#333',
    textAlignVertical: 'top',
    marginBottom: 16,
    padding: 0,
  },
  translateButton: {
    backgroundColor: '#667eea',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 50,
  },
  translateButtonDisabled: {
    opacity: 0.6,
  },
  translateButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600' as const,
  },
  outputSection: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  outputHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  speakButton: {
    padding: 10,
    backgroundColor: '#f5f5f5',
    borderRadius: 20,
  },
  translationBox: {
    minHeight: 100,
  },
  translationText: {
    fontSize: 18,
    color: '#333',
    lineHeight: 28,
  },
});
