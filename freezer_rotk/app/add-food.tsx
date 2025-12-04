import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  Platform,
  KeyboardAvoidingView,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { Camera, Calendar } from 'lucide-react-native';
import { useFoodContext } from '@/contexts/FoodContext';
import Colors from '@/constants/colors';

export default function AddFoodScreen() {
  const router = useRouter();
  const { addFood } = useFoodContext();
  
  const [name, setName] = useState<string>('');
  const [expiryDate, setExpiryDate] = useState<string>('');
  const [imageUri, setImageUri] = useState<string | undefined>(undefined);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const pickImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (permissionResult.granted === false) {
      if (Platform.OS === 'web') {
        alert('需要相册权限才能选择图片');
      } else {
        Alert.alert('权限不足', '需要相册权限才能选择图片');
      }
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'] as any,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setImageUri(result.assets[0].uri);
    }
  };

  const handleSubmit = async () => {
    if (!name.trim()) {
      if (Platform.OS === 'web') {
        alert('请输入食品名称');
      } else {
        Alert.alert('提示', '请输入食品名称');
      }
      return;
    }

    if (!expiryDate.trim()) {
      if (Platform.OS === 'web') {
        alert('请输入保质期');
      } else {
        Alert.alert('提示', '请输入保质期');
      }
      return;
    }

    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(expiryDate)) {
      if (Platform.OS === 'web') {
        alert('请使用正确的日期格式：YYYY-MM-DD');
      } else {
        Alert.alert('提示', '请使用正确的日期格式：YYYY-MM-DD');
      }
      return;
    }

    setIsSubmitting(true);
    try {
      await addFood({
        name: name.trim(),
        expiryDate,
        imageUri,
      });
      router.back();
    } catch (error) {
      console.error('Failed to add food:', error);
      if (Platform.OS === 'web') {
        alert('添加失败，请重试');
      } else {
        Alert.alert('错误', '添加失败，请重试');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <TouchableOpacity style={styles.imagePickerButton} onPress={pickImage}>
          {imageUri ? (
            <Image source={{ uri: imageUri }} style={styles.selectedImage} />
          ) : (
            <View style={styles.imagePlaceholder}>
              <Camera color={Colors.primary} size={48} />
              <Text style={styles.imagePickerText}>点击选择照片</Text>
            </View>
          )}
        </TouchableOpacity>

        <View style={styles.formSection}>
          <Text style={styles.label}>食品名称</Text>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="例如：牛奶、鸡蛋、面包"
            placeholderTextColor={Colors.textLight}
            autoCapitalize="none"
          />
        </View>

        <View style={styles.formSection}>
          <View style={styles.labelRow}>
            <Calendar color={Colors.text} size={20} />
            <Text style={styles.label}>保质期（到期日期）</Text>
          </View>
          <TextInput
            style={styles.input}
            value={expiryDate}
            onChangeText={setExpiryDate}
            placeholder="YYYY-MM-DD (例如: 2024-12-31)"
            placeholderTextColor={Colors.textLight}
            keyboardType={Platform.OS === 'web' ? 'default' : 'numbers-and-punctuation'}
          />
          <Text style={styles.hint}>请输入格式：年-月-日</Text>
        </View>

        <TouchableOpacity
          style={[styles.submitButton, isSubmitting && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={isSubmitting}
        >
          <Text style={styles.submitButtonText}>
            {isSubmitting ? '添加中...' : '添加到冰箱'}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  imagePickerButton: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: 20,
    overflow: 'hidden' as const,
    marginBottom: 24,
    backgroundColor: Colors.cardBackground,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  selectedImage: {
    width: '100%',
    height: '100%',
  },
  imagePlaceholder: {
    width: '100%',
    height: '100%',
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
    backgroundColor: Colors.primaryLight,
  },
  imagePickerText: {
    marginTop: 12,
    fontSize: 16,
    color: Colors.primary,
    fontWeight: '600' as const,
  },
  formSection: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.text,
    marginBottom: 8,
  },
  labelRow: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 8,
    marginBottom: 8,
  },
  input: {
    backgroundColor: Colors.cardBackground,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: Colors.text,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  hint: {
    fontSize: 13,
    color: Colors.textLight,
    marginTop: 6,
  },
  submitButton: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center' as const,
    marginTop: 8,
    marginBottom: 40,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '600' as const,
  },
});
