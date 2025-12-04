import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Plus, Trash2 } from 'lucide-react-native';
import { useFoodContext } from '@/contexts/FoodContext';
import { scheduleNotificationsForFoods } from '@/utils/notifications';
import Colors from '@/constants/colors';
import { FoodStatus } from '@/types/food';

export default function HomeScreen() {
  const router = useRouter();
  const { foods, stats, isLoading, deleteFood } = useFoodContext();

  useEffect(() => {
    if (!isLoading && foods.length > 0) {
      scheduleNotificationsForFoods(foods);
    }
  }, [foods, isLoading]);

  const handleDelete = (id: string, name: string) => {
    if (Platform.OS === 'web') {
      if (confirm(`确定要删除 ${name} 吗？`)) {
        deleteFood(id);
      }
    } else {
      Alert.alert('删除食品', `确定要删除 ${name} 吗？`, [
        { text: '取消', style: 'cancel' },
        { text: '删除', style: 'destructive', onPress: () => deleteFood(id) },
      ]);
    }
  };

  const getStatusColor = (status: FoodStatus) => {
    switch (status) {
      case 'fresh':
        return Colors.fresh;
      case 'expiring':
        return Colors.expiring;
      case 'expired':
        return Colors.expired;
    }
  };

  const getStatusBgColor = (status: FoodStatus) => {
    switch (status) {
      case 'fresh':
        return Colors.freshLight;
      case 'expiring':
        return Colors.expiringLight;
      case 'expired':
        return Colors.expiredLight;
    }
  };

  const getStatusText = (status: FoodStatus, daysUntilExpiry: number) => {
    switch (status) {
      case 'fresh':
        return `还有 ${daysUntilExpiry} 天`;
      case 'expiring':
        return daysUntilExpiry === 0 ? '今天过期' : `还有 ${daysUntilExpiry} 天`;
      case 'expired':
        return `已过期 ${Math.abs(daysUntilExpiry)} 天`;
    }
  };

  return (
    <View style={styles.container}>
      <SafeAreaView edges={['top']} style={styles.safeArea}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>我的冰箱</Text>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => router.push('/add-food')}
          >
            <Plus color="#fff" size={24} />
          </TouchableOpacity>
        </View>

        <View style={styles.statsContainer}>
          <View style={[styles.statCard, { backgroundColor: Colors.freshLight }]}>
            <Text style={[styles.statNumber, { color: Colors.fresh }]}>
              {stats.fresh}
            </Text>
            <Text style={[styles.statLabel, { color: Colors.fresh }]}>新鲜</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: Colors.expiringLight }]}>
            <Text style={[styles.statNumber, { color: Colors.expiring }]}>
              {stats.expiring}
            </Text>
            <Text style={[styles.statLabel, { color: Colors.expiring }]}>临期</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: Colors.expiredLight }]}>
            <Text style={[styles.statNumber, { color: Colors.expired }]}>
              {stats.expired}
            </Text>
            <Text style={[styles.statLabel, { color: Colors.expired }]}>过期</Text>
          </View>
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {foods.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>还没有添加任何食品</Text>
              <Text style={styles.emptySubtext}>点击右上角的 + 按钮添加</Text>
            </View>
          ) : (
            <View style={styles.grid}>
              {foods.map((food) => (
                <View key={food.id} style={styles.foodCard}>
                  <View style={styles.imageContainer}>
                    {food.imageUri ? (
                      <Image source={{ uri: food.imageUri }} style={styles.foodImage} />
                    ) : (
                      <View style={[styles.foodImage, styles.placeholderImage]}>
                        <Text style={styles.placeholderText}>
                          {food.name.charAt(0)}
                        </Text>
                      </View>
                    )}
                    <View
                      style={[
                        styles.statusBadge,
                        { backgroundColor: getStatusBgColor(food.status) },
                      ]}
                    >
                      <Text
                        style={[styles.statusText, { color: getStatusColor(food.status) }]}
                      >
                        {getStatusText(food.status, food.daysUntilExpiry)}
                      </Text>
                    </View>
                  </View>
                  <View style={styles.foodInfo}>
                    <Text style={styles.foodName} numberOfLines={1}>
                      {food.name}
                    </Text>
                    <Text style={styles.foodDate}>
                      到期: {new Date(food.expiryDate).toLocaleDateString('zh-CN')}
                    </Text>
                  </View>
                  <TouchableOpacity
                    style={styles.deleteButton}
                    onPress={() => handleDelete(food.id, food.name)}
                  >
                    <Trash2 color={Colors.expired} size={18} />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'center' as const,
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: Colors.background,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: 'bold' as const,
    color: Colors.text,
  },
  addButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.primary,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  statsContainer: {
    flexDirection: 'row' as const,
    paddingHorizontal: 20,
    gap: 12,
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    padding: 16,
    borderRadius: 16,
    alignItems: 'center' as const,
  },
  statNumber: {
    fontSize: 28,
    fontWeight: 'bold' as const,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    fontWeight: '600' as const,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    color: Colors.textSecondary,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: Colors.textLight,
  },
  grid: {
    flexDirection: 'row' as const,
    flexWrap: 'wrap' as const,
    gap: 12,
  },
  foodCard: {
    width: 'calc(50% - 6px)' as any,
    backgroundColor: Colors.cardBackground,
    borderRadius: 16,
    overflow: 'hidden' as const,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  imageContainer: {
    position: 'relative' as const,
    width: '100%',
    aspectRatio: 1,
  },
  foodImage: {
    width: '100%',
    height: '100%',
  },
  placeholderImage: {
    backgroundColor: Colors.primaryLight,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
  },
  placeholderText: {
    fontSize: 48,
    fontWeight: 'bold' as const,
    color: Colors.primary,
  },
  statusBadge: {
    position: 'absolute' as const,
    top: 8,
    right: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600' as const,
  },
  foodInfo: {
    padding: 12,
  },
  foodName: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.text,
    marginBottom: 4,
  },
  foodDate: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  deleteButton: {
    position: 'absolute' as const,
    bottom: 8,
    right: 8,
    padding: 8,
  },
});
