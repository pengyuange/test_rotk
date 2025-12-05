import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  Alert,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Target } from "lucide-react-native";
import { useStepSettings } from "@/contexts/StepContext";

export default function SettingsScreen() {
  const { dailyGoal, setDailyGoal } = useStepSettings();
  const [inputValue, setInputValue] = useState(dailyGoal.toString());

  const handleSave = () => {
    const newGoal = parseInt(inputValue);
    if (isNaN(newGoal) || newGoal < 100 || newGoal > 100000) {
      Alert.alert("提示", "请输入100到100000之间的步数目标");
      return;
    }
    setDailyGoal(newGoal);
    Alert.alert("成功", "每日目标已更新！");
  };

  return (
    <LinearGradient colors={["#FFF5F5", "#FFFFFF"]} style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <View style={styles.iconContainer}>
            <Target size={32} color="#FF6B6B" />
          </View>
          <Text style={styles.title}>每日步数目标</Text>
          <Text style={styles.subtitle}>设置你的每日健康目标</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.label}>目标步数</Text>
          <TextInput
            style={styles.input}
            value={inputValue}
            onChangeText={setInputValue}
            keyboardType="number-pad"
            placeholder="输入目标步数"
            placeholderTextColor="#CCCCCC"
          />
          <Text style={styles.hint}>建议：每天8000-10000步</Text>
        </View>

        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <LinearGradient
            colors={["#FF6B6B", "#FF8E8E"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.gradientButton}
          >
            <Text style={styles.saveButtonText}>保存设置</Text>
          </LinearGradient>
        </TouchableOpacity>

        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>关于步数计算</Text>
          <Text style={styles.infoText}>
            • 卡路里：每步约消耗0.04千卡
          </Text>
          <Text style={styles.infoText}>
            • 距离：每步约0.7米（因人而异）
          </Text>
          <Text style={styles.infoText}>
            • 数据来源：手机健康传感器
          </Text>
        </View>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 20,
    paddingTop: 60,
  },
  header: {
    alignItems: "center",
    marginBottom: 40,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#FFF0F0",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "700" as const,
    color: "#2D2D2D",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "#888888",
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 24,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  label: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: "#2D2D2D",
    marginBottom: 12,
  },
  input: {
    borderWidth: 2,
    borderColor: "#FFE0E0",
    borderRadius: 12,
    padding: 16,
    fontSize: 24,
    fontWeight: "700" as const,
    color: "#FF6B6B",
    textAlign: "center",
    backgroundColor: "#FFF5F5",
  },
  hint: {
    fontSize: 14,
    color: "#999999",
    textAlign: "center",
    marginTop: 12,
  },
  saveButton: {
    borderRadius: 16,
    overflow: "hidden",
    marginBottom: 30,
  },
  gradientButton: {
    paddingVertical: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  saveButtonText: {
    fontSize: 18,
    fontWeight: "700" as const,
    color: "#FFFFFF",
  },
  infoCard: {
    backgroundColor: "#F8F8F8",
    borderRadius: 16,
    padding: 20,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: "#2D2D2D",
    marginBottom: 12,
  },
  infoText: {
    fontSize: 14,
    color: "#666666",
    lineHeight: 24,
  },
});
