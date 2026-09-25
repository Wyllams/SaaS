import { Link } from "expo-router";
import { StyleSheet, Text, View } from "react-native";

export default function HomeScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Mobile POC 11</Text>
      <Text style={styles.copy}>
        Navigation, camera, upload contract and deep-link routing.
      </Text>

      <Link href="/camera" style={styles.link}>
        Open camera proof
      </Link>

      <Link
        href={{
          pathname: "/jobs/[jobId]",
          params: { jobId: "demo-job-123" },
        }}
        style={styles.link}
      >
        Open deep-link target
      </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    gap: 16,
    padding: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
  },
  copy: {
    fontSize: 16,
    lineHeight: 24,
  },
  link: {
    fontSize: 18,
    textDecorationLine: "underline",
  },
});
