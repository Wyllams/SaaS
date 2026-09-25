import { useLocalSearchParams } from "expo-router";
import { StyleSheet, Text, View } from "react-native";

export default function JobDeepLinkScreen() {
  const { jobId } = useLocalSearchParams<{ jobId?: string }>();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Deep-link target</Text>
      <Text selectable>{jobId ?? "missing-job-id"}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    gap: 12,
    padding: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
  },
});
