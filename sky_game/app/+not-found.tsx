import { Link, Stack } from "expo-router";
import { StyleSheet, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: "404" }} />
      <View style={styles.container}>
        <LinearGradient
          colors={['#0A0E27', '#1A1F3A']}
          style={StyleSheet.absoluteFill}
        />
        <Text style={styles.title}>页面未找到</Text>
        <Link href="/" style={styles.link}>
          <Text style={styles.linkText}>返回主页</Text>
        </Link>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold" as const,
    color: "#FFFFFF",
    marginBottom: 20,
  },
  link: {
    paddingVertical: 15,
    paddingHorizontal: 30,
    backgroundColor: "rgba(0, 217, 255, 0.2)",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#00D9FF",
  },
  linkText: {
    fontSize: 16,
    color: "#00D9FF",
    fontWeight: "bold" as const,
  },
});
