import React from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import moment from 'moment';

interface RecentActivitiesProps {
  recentActivities: Array<{ id: string, description: string, points: number, timestamp: string }>;
}

const RecentActivities: React.FC<RecentActivitiesProps> = ({ recentActivities }) => {
  return (
    <View style={styles.recentActivities}>
      <Text style={styles.recentActivitiesTitle}>Recent Activity</Text>
      <FlatList
        data={recentActivities}
        renderItem={({ item }) => (
          <View style={styles.activityItem}>
            <Text style={styles.activityDescription}>{item.description}</Text>
            <Text style={styles.activityPoints}>{item.points}</Text>
            <Text style={styles.activityTimestamp}>{moment(item.timestamp).format('YYYY-MM-DD HH:mm:ss')}</Text>
          </View>
        )}
        keyExtractor={(item, index) => item.id || index.toString()}
        style={styles.list}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  recentActivities: {
    flex: 1,
    width: "90%",
    alignSelf: 'center',
  },
  recentActivitiesTitle: {
    fontSize: 18,
    color: "#fff",
    marginBottom: 10,
  },
  activityItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "#1F1B24",
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
  },
  activityDescription: {
    color: "#fff",
    flex: 2,
  },
  activityPoints: {
    color: "#FFD700",
    flex: 1,
    textAlign: 'right',
  },
  activityTimestamp: {
    color: "#888",
    flex: 1,
    textAlign: 'right',
    fontSize: 12,
    marginTop: 5,
  },
  list: {
    maxHeight: '80%', // Adjust based on your layout requirements
  }
});

export default RecentActivities;
