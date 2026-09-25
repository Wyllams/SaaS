import { StatusBar } from "expo-status-bar";
import { StyleSheet, Text, View } from "react-native";

export default function FoundationScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.eyebrow}>Epic 0 · Foundation</Text>
      <Text style={styles.title}>Mobile foundation is ready for validation.</Text>
      <Text style={styles.body}>
        Product workflows start only after the Foundation exit gate.
      </Text>
      <StatusBar style="dark" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 24,
    backgroundColor: "#F8FAFC",
    gap: 12,
  },
  eyebrow: {
    color: "#64748B",
    fontSize: 13,
    fontWeight: "500",
  },
  title: {
    color: "#0F172A",
    fontSize: 28,
    fontWeight: "600",
  },
  body: {
    color: "#475569",
    fontSize: 14,
    lineHeight: 20,
  },
});
