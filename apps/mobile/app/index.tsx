import { designTokens } from "@saas/design-tokens";
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
    backgroundColor: designTokens.color.page,
    gap: 12,
  },
  eyebrow: {
    color: designTokens.color.textMuted,
    fontSize: 13,
    fontWeight: "500",
  },
  title: {
    color: designTokens.color.textPrimary,
    fontSize: 28,
    fontWeight: "600",
  },
  body: {
    color: designTokens.color.textSecondary,
    fontSize: 14,
    lineHeight: 20,
  },
});
