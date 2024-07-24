import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, TextInput, TouchableOpacity } from 'react-native';
import { collection, getDocs, query, where } from 'firebase/firestore';
import DateTimePicker from '@react-native-community/datetimepicker';
import { db } from '../services/firebase';
import QRCode from 'react-native-qrcode-svg';

interface Transaction {
  id: string;
  description: string;
  points: number;
  price: number;
  timestamp: string; // ISO 8601 Timestamp string
  userId: string;
}

interface User {
  uid: string;
  username: string;
  surname: string;
  phone: string;
}

const AdminTransactionHistoryScreen: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState<{ [key: string]: User }>({});
  const [filterPhone, setFilterPhone] = useState('');
  const [filterStartDate, setFilterStartDate] = useState<Date | null>(null);
  const [filterEndDate, setFilterEndDate] = useState<Date | null>(null);
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const transactionQuery = query(collection(db, 'transactions'));
      const transactionSnapshot = await getDocs(transactionQuery);
      const transactionList = transactionSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as Transaction[];

      const userCollection = collection(db, 'users');
      const userSnapshot = await getDocs(userCollection);
      const userList: { [key: string]: User } = {};

      userSnapshot.docs.forEach(doc => {
        const userData = doc.data() as User;
        userList[doc.id] = userData;
      });

      setTransactions(transactionList);
      setUsers(userList);
    } catch (error) {
      console.error('Error fetching transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatTimestamp = (timestamp: string): string => {
    return new Date(timestamp).toLocaleString();
  };

  const filterTransactions = () => {
    return transactions.filter(transaction => {
      const user = users[transaction.userId];
      const transactionDate = new Date(transaction.timestamp);
      const isPhoneFilter = !filterPhone || (user?.phone && user.phone.includes(filterPhone));
      const isStartDateFilter = !filterStartDate || transactionDate.setHours(0, 0, 0, 0) >= filterStartDate.setHours(0, 0, 0, 0);
      const isEndDateFilter = !filterEndDate || transactionDate.setHours(0, 0, 0, 0) <= filterEndDate.setHours(0, 0, 0, 0);

      return isPhoneFilter && isStartDateFilter && isEndDateFilter;
    });
  };

  const handleDateChange = (event: any, selectedDate: Date | undefined, setDate: (date: Date | null) => void) => {
    if (selectedDate) {
      setDate(selectedDate);
    }
    setShowStartDatePicker(false);
    setShowEndDatePicker(false);
  };

  const clearFilters = () => {
    setFilterPhone('');
    setFilterStartDate(null);
    setFilterEndDate(null);
  };

  if (loading) {
    return <ActivityIndicator size="large" color="#1E90FF" />;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Transaction History</Text>
      <View style={styles.filterContainer}>
        <TextInput
          style={styles.input}
          placeholder="Filter by Phone"
          value={filterPhone}
          onChangeText={setFilterPhone}
          placeholderTextColor="#888"
        />
        <View style={styles.datePickerContainer}>
          <TouchableOpacity onPress={() => setShowStartDatePicker(true)} style={styles.datePicker}>
            <Text style={styles.datePickerText}>
              Start Date: {filterStartDate ? filterStartDate.toDateString() : 'Select'}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setShowEndDatePicker(true)} style={styles.datePicker}>
            <Text style={styles.datePickerText}>
              End Date: {filterEndDate ? filterEndDate.toDateString() : 'Select'}
            </Text>
          </TouchableOpacity>
        </View>
        {showStartDatePicker && (
          <DateTimePicker
            value={filterStartDate || new Date()}
            mode="date"
            display="default"
            onChange={(event, selectedDate) => handleDateChange(event, selectedDate, setFilterStartDate)}
          />
        )}
        {showEndDatePicker && (
          <DateTimePicker
            value={filterEndDate || new Date()}
            mode="date"
            display="default"
            onChange={(event, selectedDate) => handleDateChange(event, selectedDate, setFilterEndDate)}
          />
        )}
        <TouchableOpacity style={styles.clearButton} onPress={clearFilters}>
          <Text style={styles.clearButtonText}>Clear Filters</Text>
        </TouchableOpacity>
      </View>
      <FlatList
        data={filterTransactions()}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => {
          const user = users[item.userId];
          return (
            <View style={styles.transactionContainer}>
              <Text style={styles.field}><Text style={styles.label}>Transaction ID:</Text> {item.id}</Text>
              <Text style={styles.field}><Text style={styles.label}>Description:</Text> {item.description}</Text>
              <Text style={styles.field}><Text style={styles.label}>Points:</Text> {item.points}</Text>
              <Text style={styles.field}><Text style={styles.label}>Price:</Text> {item.price}</Text>
              <Text style={styles.field}><Text style={styles.label}>Timestamp:</Text> {formatTimestamp(item.timestamp)}</Text>
              {user && (
                <>
                  <Text style={styles.field}><Text style={styles.label}>Username:</Text> {user.username}</Text>
                  <Text style={styles.field}><Text style={styles.label}>Surname:</Text> {user.surname}</Text>
                  <Text style={styles.field}><Text style={styles.label}>Phone:</Text> {user.phone}</Text>
                </>
              )}
              <QRCode value={item.userId} size={100} color="black" />
            </View>
          );
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f4f4f4',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
    textAlign: 'center',
  },
  filterContainer: {
    marginBottom: 20,
  },
  input: {
    height: 50,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 15,
    marginBottom: 15,
    backgroundColor: '#fff',
    color: '#333',
  },
  datePickerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  datePicker: {
    flex: 1,
    padding: 10,
    borderRadius: 5,
    borderColor: '#ccc',
    borderWidth: 1,
    marginHorizontal: 5,
    alignItems: 'center',
  },
  datePickerText: {
    color: '#333',
  },
  clearButton: {
    backgroundColor: '#ff6347',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
  },
  clearButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  transactionContainer: {
    padding: 15,
    backgroundColor: '#fff',
    borderRadius: 10,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  field: {
    fontSize: 16,
    marginBottom: 5,
    color: '#333',
  },
  label: {
    fontWeight: 'bold',
    color: '#555',
  },
});

export default AdminTransactionHistoryScreen;
