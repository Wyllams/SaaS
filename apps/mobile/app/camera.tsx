import { CameraView, useCameraPermissions } from "expo-camera";
import { useRouter } from "expo-router";
import { useRef, useState } from "react";
import { Button, StyleSheet, Text, View } from "react-native";

export default function CameraScreen() {
  const cameraRef = useRef<CameraView>(null);
  const [permission, requestPermission] = useCameraPermissions();
  const [capturing, setCapturing] = useState(false);
  const router = useRouter();

  if (!permission) {
    return (
      <View style={styles.center}>
        <Text>Checking camera permission…</Text>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.center}>
        <Text style={styles.copy}>
          Camera access is required only for this capture proof.
        </Text>
        <Button title="Allow camera" onPress={() => void requestPermission()} />
      </View>
    );
  }

  async function capture() {
    if (!cameraRef.current || capturing) return;

    setCapturing(true);
    try {
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.7,
      });

      if (photo?.uri) {
        router.push({
          pathname: "/upload",
          params: { uri: photo.uri },
        });
      }
    } finally {
      setCapturing(false);
    }
  }

  return (
    <View style={styles.container}>
      <CameraView ref={cameraRef} style={styles.camera} facing="back" />
      <View style={styles.controls}>
        <Button
          title={capturing ? "Capturing…" : "Capture photo"}
          onPress={() => void capture()}
          disabled={capturing}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  camera: {
    flex: 1,
  },
  controls: {
    padding: 24,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    gap: 16,
    padding: 24,
  },
  copy: {
    fontSize: 16,
    lineHeight: 24,
  },
});
