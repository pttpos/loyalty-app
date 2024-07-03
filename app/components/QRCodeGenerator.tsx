// components/QRCodeGenerator.tsx
import React from "react";
import { View, StyleSheet, Text } from "react-native";
import QRCode from "react-native-qrcode-svg";
import { useAuth } from "../hooks/useAuth";

const QRCodeGenerator = () => {
  const { user } = useAuth();

  return (
    <View style={styles.container}>
      {user ? (
        <QRCode value={user.uid} size={200} />
      ) : (
        <Text>No user logged in</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#121212",
  },
});

export default QRCodeGenerator;
