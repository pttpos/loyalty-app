import React, { useState } from "react";
import { View, Button, TextInput, StyleSheet, Alert } from "react-native";
import QRCode from "react-native-qrcode-svg";
import { db } from "../services/firebase";
import { doc, setDoc } from "firebase/firestore";
import { v4 as uuidv4 } from "uuid";

const QRCodeGenerator = () => {
  const [points, setPoints] = useState("");
  const [qrValue, setQrValue] = useState("");

  const generateQRCode = async () => {
    if (!points) {
      Alert.alert("Please enter the points");
      return;
    }

    const qrCodeId = uuidv4();
    const qrData = {
      id: qrCodeId,
      points: parseInt(points, 10),
      used: false,
    };

    try {
      await setDoc(doc(db, "qrCodes", qrCodeId), qrData);
      setQrValue(qrCodeId);
    } catch (error) {
      Alert.alert("Error generating QR code:", (error as Error).message);
    }
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder="Points"
        value={points}
        onChangeText={setPoints}
        keyboardType="numeric"
      />
      <Button title="Generate QR Code" onPress={generateQRCode} />
      {qrValue ? (
        <QRCode value={qrValue} size={200} />
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    marginTop: 20,
  },
  input: {
    height: 50,
    borderColor: "#444",
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    marginBottom: 20,
    backgroundColor: "#333",
    color: "#fff",
  },
});

export default QRCodeGenerator;
