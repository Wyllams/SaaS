import { useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { Button, StyleSheet, Text, View } from "react-native";
import { uploadCapturedMedia } from "../src/upload";

export default function UploadScreen() {
  const { uri } = useLocalSearchParams<{ uri?: string }>();
  const [status, setStatus] = useState("idle");

  const endpoint = process.env.EXPO_PUBLIC_POC11_UPLOAD_URL;

  async function upload() {
    if (!uri) {
      setStatus("missing-file");
      return;
    }

    if (!endpoint) {
      setStatus("missing-endpoint");
      return;
    }

    setStatus("uploading");
    try {
      const result = await uploadCapturedMedia({
        uri,
        endpoint,
      });
      setStatus(`uploaded-${result.status}`);
    } catch {
      setStatus("failed");
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Upload proof</Text>
      <Text selectable style={styles.uri}>
        {uri ?? "No captured file URI received."}
      </Text>
      <Text>Status: {status}</Text>
      <Button title="Upload captured file" onPress={() => void upload()} />
      {!endpoint ? (
        <Text style={styles.note}>
          Set EXPO_PUBLIC_POC11_UPLOAD_URL only to a disposable HTTPS test endpoint.
          Do not place secrets in EXPO_PUBLIC variables.
        </Text>
      ) : null}
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
    fontSize: 24,
    fontWeight: "700",
  },
  uri: {
    fontSize: 12,
  },
  note: {
    fontSize: 13,
    lineHeight: 19,
  },
});
