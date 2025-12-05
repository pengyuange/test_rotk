import React, { useEffect, useRef } from "react";
import {
  StyleSheet,
  Text,
  View,
  Animated,
  ActivityIndicator,
  Platform,
  ScrollView,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Flame, MapPin, TrendingUp, Award } from "lucide-react-native";
import { useStepSettings } from "@/contexts/StepContext";
import Svg, { Circle } from "react-native-svg";

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

export default function HomeScreen() {
  const { stepData, dailyGoal, isLoading, isPedometerAvailable } =
    useStepSettings();
  const progressAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const celebrateAnim = useRef(new Animated.Value(0)).current;

  const radius = 100;
  const strokeWidth = 16;
  const circumference = 2 * Math.PI * radius;

  useEffect(() => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      tension: 50,
      friction: 7,
      useNativeDriver: true,
    }).start();
  }, [scaleAnim]);

  useEffect(() => {
    Animated.timing(progressAnim, {
      toValue: stepData.goalPercentage,
      duration: 1000,
      useNativeDriver: false,
    }).start();

    if (stepData.goalPercentage >= 100) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(celebrateAnim, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
          }),
          Animated.timing(celebrateAnim, {
            toValue: 0,
            duration: 500,
            useNativeDriver: true,
          }),
        ])
      ).start();
    }
  }, [stepData.goalPercentage, progressAnim, celebrateAnim]);

  const strokeDashoffset = progressAnim.interpolate({
    inputRange: [0, 100],
    outputRange: [circumference, 0],
  });

  const celebrateScale = celebrateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.1],
  });

  if (isLoading) {
    return (
      <LinearGradient
        colors={["#FF6B6B", "#FF8E8E", "#FFB6B6"]}
        style={styles.container}
      >
        <ActivityIndicator size="large" color="#FFFFFF" />
        <Text style={styles.loadingText}>加载中...</Text>
      </LinearGradient>
    );
  }

  if (!isPedometerAvailable && Platform.OS !== "web") {
    return (
      <LinearGradient
        colors={["#FF6B6B", "#FF8E8E", "#FFB6B6"]}
        style={styles.container}
      >
        <Text style={styles.errorText}>计步器不可用</Text>
        <Text style={styles.errorSubtext}>
          此设备不支持计步功能，请在支持的设备上使用
        </Text>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient
      colors={["#FF6B6B", "#FF8E8E", "#FFB6B6"]}
      style={styles.container}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.greeting}>今日步数</Text>
          <Text style={styles.date}>
            {new Date().toLocaleDateString("zh-CN", {
              month: "long",
              day: "numeric",
              weekday: "short",
            })}
          </Text>
        </View>

        <Animated.View
          style={[
            styles.circleContainer,
            {
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          <View style={styles.circleWrapper}>
            <Svg width={radius * 2 + strokeWidth * 2} height={radius * 2 + strokeWidth * 2}>
              <Circle
                cx={radius + strokeWidth}
                cy={radius + strokeWidth}
                r={radius}
                stroke="#FFFFFF40"
                strokeWidth={strokeWidth}
                fill="none"
              />
              <AnimatedCircle
                cx={radius + strokeWidth}
                cy={radius + strokeWidth}
                r={radius}
                stroke="#FFFFFF"
                strokeWidth={strokeWidth}
                fill="none"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                rotation="-90"
                origin={`${radius + strokeWidth}, ${radius + strokeWidth}`}
              />
            </Svg>
            <Animated.View
              style={[
                styles.circleContent,
                stepData.goalPercentage >= 100 && {
                  transform: [{ scale: celebrateScale }],
                },
              ]}
            >
              {stepData.goalPercentage >= 100 && (
                <Award size={40} color="#FFFFFF" style={styles.awardIcon} />
              )}
              <Text style={styles.stepsNumber}>
                {stepData.steps.toLocaleString()}
              </Text>
              <Text style={styles.stepsLabel}>步</Text>
              <View style={styles.goalBadge}>
                <Text style={styles.goalText}>
                  {Math.round(stepData.goalPercentage)}%
                </Text>
              </View>
            </Animated.View>
          </View>
        </Animated.View>

        {stepData.goalPercentage >= 100 && (
          <View style={styles.congratsCard}>
            <Text style={styles.congratsText}>🎉 目标达成！</Text>
            <Text style={styles.congratsSubtext}>继续保持，你真棒！</Text>
          </View>
        )}

        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <View style={styles.statIconContainer}>
              <Flame size={24} color="#FF6B6B" />
            </View>
            <Text style={styles.statValue}>{stepData.calories}</Text>
            <Text style={styles.statLabel}>千卡</Text>
          </View>

          <View style={styles.statCard}>
            <View style={styles.statIconContainer}>
              <MapPin size={24} color="#FF6B6B" />
            </View>
            <Text style={styles.statValue}>{stepData.distance}</Text>
            <Text style={styles.statLabel}>公里</Text>
          </View>

          <View style={styles.statCard}>
            <View style={styles.statIconContainer}>
              <TrendingUp size={24} color="#FF6B6B" />
            </View>
            <Text style={styles.statValue}>{dailyGoal.toLocaleString()}</Text>
            <Text style={styles.statLabel}>目标</Text>
          </View>
        </View>

        {Platform.OS === "web" && (
          <View style={styles.webNotice}>
            <Text style={styles.webNoticeText}>
              💡 在手机上查看实时步数数据
            </Text>
          </View>
        )}
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingTop: 60,
    paddingBottom: 100,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: "#FFFFFF",
    fontWeight: "500" as const,
  },
  errorText: {
    fontSize: 20,
    fontWeight: "700" as const,
    color: "#FFFFFF",
    marginBottom: 12,
    textAlign: "center",
    paddingHorizontal: 40,
  },
  errorSubtext: {
    fontSize: 14,
    color: "#FFFFFFCC",
    textAlign: "center",
    paddingHorizontal: 40,
  },
  header: {
    alignItems: "center",
    marginBottom: 40,
  },
  greeting: {
    fontSize: 32,
    fontWeight: "800" as const,
    color: "#FFFFFF",
    marginBottom: 8,
  },
  date: {
    fontSize: 16,
    color: "#FFFFFFCC",
    fontWeight: "500" as const,
  },
  circleContainer: {
    alignItems: "center",
    marginBottom: 30,
  },
  circleWrapper: {
    position: "relative",
  },
  circleContent: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: "center",
    justifyContent: "center",
  },
  awardIcon: {
    marginBottom: 8,
  },
  stepsNumber: {
    fontSize: 48,
    fontWeight: "800" as const,
    color: "#FFFFFF",
  },
  stepsLabel: {
    fontSize: 18,
    color: "#FFFFFFCC",
    fontWeight: "500" as const,
    marginTop: 4,
  },
  goalBadge: {
    backgroundColor: "#FFFFFF30",
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    marginTop: 12,
  },
  goalText: {
    fontSize: 16,
    fontWeight: "700" as const,
    color: "#FFFFFF",
  },
  congratsCard: {
    backgroundColor: "#FFFFFF30",
    borderRadius: 16,
    padding: 20,
    alignItems: "center",
    marginBottom: 30,
  },
  congratsText: {
    fontSize: 24,
    fontWeight: "700" as const,
    color: "#FFFFFF",
    marginBottom: 8,
  },
  congratsSubtext: {
    fontSize: 16,
    color: "#FFFFFFCC",
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  statIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#FFF0F0",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  statValue: {
    fontSize: 24,
    fontWeight: "700" as const,
    color: "#2D2D2D",
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: "#888888",
    fontWeight: "500" as const,
  },
  webNotice: {
    backgroundColor: "#FFFFFF30",
    borderRadius: 12,
    padding: 16,
    marginTop: 20,
    alignItems: "center",
  },
  webNoticeText: {
    fontSize: 14,
    color: "#FFFFFF",
    fontWeight: "500" as const,
  },
});
