// components/PointUpdater.tsx
import React, { useState, useEffect } from "react";
import { View, Button, TextInput, Alert, Text, StyleSheet, TouchableOpacity, FlatList } from "react-native";
import { db } from "../services/firebase";
import { collection, query, where, getDocs, updateDoc, increment } from "firebase/firestore";

const PointUpdater = () => {
  const [email, setEmail] = useState("");
  const [points, setPoints] = useState("");
  const [userEmails, setUserEmails] = useState<string[]>([]);
  const [filteredEmails, setFilteredEmails] = useState<string[]>([]);
  const [selectedEmail, setSelectedEmail] = useState("");

  useEffect(() => {
    const fetchEmails = async () => {
      const q = query(collection(db, "users"));
      const querySnapshot = await getDocs(q);
      const emails = querySnapshot.docs.map((doc) => doc.data().email);
      setUserEmails(emails);
    };

    fetchEmails();
  }, []);

  const handleEmailChange = (text: string) => {
    setEmail(text);
    if (text) {
      const filtered = userEmails.filter((email) => email.toLowerCase().includes(text.toLowerCase()));
      setFilteredEmails(filtered);
    } else {
      setFilteredEmails([]);
    }
  };

  const handleSelectEmail = (email: string) => {
    setSelectedEmail(email);
    setEmail(email);
    setFilteredEmails([]);
  };

  const handleSendPoints = async () => {
    if (!selectedEmail) {
      Alert.alert("Error", "Please select the user's email");
      return;
    }
    const q = query(collection(db, "users"), where("email", "==", selectedEmail));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      Alert.alert("Error", "No user found with this email");
      return;
    }

    const userDoc = querySnapshot.docs[0];
    const userRef = userDoc.ref;
    await updateDoc(userRef, {
      points: increment(parseInt(points, 10)),
    });

    Alert.alert("Points added successfully!");
  };

  return (
    <View style={styles.container}>
      <TextInput 
        style={styles.input}
        placeholder="User Email" 
        value={email} 
        onChangeText={handleEmailChange} 
        keyboardType="email-address" 
      />
      {filteredEmails.length > 0 && (
        <FlatList
          data={filteredEmails}
          keyExtractor={(item) => item}
          renderItem={({ item }) => (
            <TouchableOpacity onPress={() => handleSelectEmail(item)}>
              <Text style={styles.emailItem}>{item}</Text>
            </TouchableOpacity>
          )}
        />
      )}
      <TextInput 
        style={styles.input}
        placeholder="Points" 
        value={points} 
        onChangeText={setPoints} 
        keyboardType="numeric" 
      />
      <Button title="Send Points" onPress={handleSendPoints} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  input: {
    height: 50,
    borderColor: '#444',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    marginBottom: 20,
    backgroundColor: '#333',
    color: '#fff',
  },
  emailItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
});

export default PointUpdater;
