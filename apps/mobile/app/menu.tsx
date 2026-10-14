import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useLocalSearchParams } from 'expo-router';

interface MenuItem {
  id: string;
  name: string;
  basePrice: number;
  description?: string;
}

export default function MenuScreen() {
  const { token } = useLocalSearchParams<{ token?: string }>();
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<MenuItem[]>([]);
  const [restaurantName, setRestaurantName] = useState('Restaurant Menu');

  useEffect(() => {
    // In production, verify token and fetch menu from API
    // Placeholder demo menu data for mobile
    setTimeout(() => {
      setRestaurantName('Spice Garden');
      setItems([
        { id: '1', name: 'Paneer Tikka', basePrice: 280, description: 'Grilled cottage cheese with spices' },
        { id: '2', name: 'Butter Chicken', basePrice: 380, description: 'Creamy tomato-based chicken curry' },
        { id: '3', name: 'Dal Makhani', basePrice: 280, description: 'Slow-cooked black lentils in cream' },
        { id: '4', name: 'Garlic Naan', basePrice: 60, description: 'Fluffy leavened bread with garlic butter' },
        { id: '5', name: 'Mango Lassi', basePrice: 120, description: 'Chilled yogurt drink with mango' },
      ]);
      setLoading(false);
    }, 1000);
  }, [token]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#FF6B35" />
        <Text style={styles.loadingText}>Loading menu...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>{restaurantName}</Text>
      <FlatList
        data={items}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.itemCard}>
            <View style={styles.itemInfo}>
              <Text style={styles.itemName}>{item.name}</Text>
              {item.description && <Text style={styles.itemDesc}>{item.description}</Text>}
              <Text style={styles.itemPrice}>₹{item.basePrice.toFixed(2)}</Text>
            </View>
            <TouchableOpacity style={styles.addButton}>
              <Text style={styles.addButtonText}>+ Add</Text>
            </TouchableOpacity>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 16,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#666',
  },
  header: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  itemCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  itemInfo: {
    flex: 1,
    marginRight: 12,
  },
  itemName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111',
  },
  itemDesc: {
    fontSize: 13,
    color: '#666',
    marginTop: 4,
  },
  itemPrice: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FF6B35',
    marginTop: 6,
  },
  addButton: {
    backgroundColor: '#FF6B35',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  addButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
});
