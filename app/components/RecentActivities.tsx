import React from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';

interface RecentActivitiesProps {
  recentActivities: Array<{ id: string, description: string, points: number }>;
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
          </View>
        )}
        keyExtractor={(item) => item.id}
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
  },
  activityPoints: {
    color: "#FFD700",
  },
  list: {
    maxHeight: '80%' // Adjust based on your layout requirements
  }
});

export default RecentActivities;
