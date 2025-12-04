import { Stack, useRouter } from "expo-router";
import { StyleSheet, Text, View, TouchableOpacity } from "react-native";

export default function NotFoundScreen() {
  const router = useRouter();
  
  return (
    <>
      <Stack.Screen options={{ title: "页面未找到" }} />
      <View style={styles.container}>
        <Text style={styles.title}>页面不存在</Text>
        <TouchableOpacity 
          style={styles.button}
          onPress={() => router.replace('/')}
        >
          <Text style={styles.buttonText}>返回首页</Text>
        </TouchableOpacity>
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
    fontSize: 20,
    fontWeight: "bold" as const,
    color: "#1F2937",
    marginBottom: 20,
  },
  button: {
    backgroundColor: "#6366F1",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  buttonText: {
    fontSize: 16,
    color: "#FFF",
    fontWeight: "600" as const,
  },
});
