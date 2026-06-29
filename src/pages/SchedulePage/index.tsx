import React, { useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Card, Badge, EmptyState } from '@shared/ui';
import { colors, typography } from '@shared/ui/theme';
import { observer } from 'mobx-react-lite';
import { plantStore } from '@entities/plant';
import { waterScheduleModel } from '@features/waterSchedule/model';
import { formatRelativeDate, formatDate } from '@shared/lib/helpers';
import { PlantCareSchedule } from '@shared/types';

export const SchedulePage: React.FC = observer(() => {
  useEffect(() => {
    waterScheduleModel.requestNotificationPermission();
  }, []);

  const onRefresh = useCallback(() => {
    // Already reactive via MobX
  }, []);

  const handleComplete = (schedule: PlantCareSchedule) => {
    const plant = plantStore.getPlantById(schedule.plantId);
    if (!plant) return;

    const taskName = schedule.type === 'watering' ? 'watered' : 'fertilized';

    Alert.alert(
      `Mark as ${taskName}?`,
      `Have you ${taskName} ${plant.name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Yes',
          onPress: () => waterScheduleModel.completeTask(schedule.plantId, schedule.type),
        },
      ],
    );
  };

  const { overdueTasks, todayTasks, upcomingTasks } = waterScheduleModel;

  const getPlantName = (plantId: string): string => {
    return plantStore.getPlantById(plantId)?.name || 'Unknown Plant';
  };

  const renderScheduleItem = (schedule: PlantCareSchedule) => (
    <TouchableOpacity
      key={`${schedule.plantId}-${schedule.type}`}
      onPress={() => handleComplete(schedule)}
      activeOpacity={0.7}
    >
      <Card variant="outlined" style={styles.scheduleCard}>
        <View style={styles.scheduleRow}>
          <Text style={styles.scheduleIcon}>
            {schedule.type === 'watering' ? '💧' : '🌿'}
          </Text>
          <View style={styles.scheduleInfo}>
            <Text style={styles.schedulePlantName}>
              {getPlantName(schedule.plantId)}
            </Text>
            <Text style={styles.scheduleType}>
              {schedule.type === 'watering' ? 'Watering' : 'Fertilizing'}
            </Text>
            <Text style={styles.scheduleDate}>
              Due: {formatDate(schedule.nextDueAt)} ({formatRelativeDate(schedule.nextDueAt)})
            </Text>
          </View>
          <View style={styles.scheduleAction}>
            <Badge
              label={schedule.type === 'watering' ? 'Water' : 'Fertilize'}
              variant="success"
            />
          </View>
        </View>
      </Card>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={false} onRefresh={onRefresh} />
        }
      >
        <View style={styles.header}>
          <Text style={styles.title}>Care Schedule</Text>
          <Text style={styles.subtitle}>
            Track watering and fertilizing tasks
          </Text>
        </View>

        {/* Overdue Tasks */}
        {overdueTasks.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>🔴 Overdue</Text>
              <Badge label={`${overdueTasks.length}`} variant="error" />
            </View>
            {overdueTasks.map(renderScheduleItem)}
          </View>
        )}

        {/* Today's Tasks */}
        {todayTasks.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>🟡 Today</Text>
              <Badge label={`${todayTasks.length}`} variant="warning" />
            </View>
            {todayTasks.map(renderScheduleItem)}
          </View>
        )}

        {/* Upcoming Tasks */}
        {upcomingTasks.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>🟢 Upcoming</Text>
              <Badge label={`${upcomingTasks.length}`} variant="info" />
            </View>
            {upcomingTasks.map(renderScheduleItem)}
          </View>
        )}

        {/* Empty State */}
        {plantStore.plants.length === 0 && (
          <EmptyState
            title="No plants to care for"
            description="Add plants to start seeing your care schedule."
            icon="📋"
          />
        )}

        {plantStore.plants.length > 0 &&
          overdueTasks.length === 0 &&
          todayTasks.length === 0 &&
          upcomingTasks.length === 0 && (
            <EmptyState
              title="All caught up!"
              description="No pending tasks. Your plants are well cared for."
              icon="✅"
            />
          )}
      </ScrollView>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    paddingVertical: 20,
    paddingBottom: 100,
  },
  header: {
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  title: {
    ...typography.h2,
    color: colors.gray900,
  },
  subtitle: {
    ...typography.body,
    color: colors.gray500,
    marginTop: 4,
  },
  section: {
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 8,
  },
  sectionTitle: {
    ...typography.h4,
    color: colors.gray800,
  },
  scheduleCard: {
    marginHorizontal: 16,
    marginVertical: 4,
  },
  scheduleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  scheduleIcon: {
    fontSize: 32,
    marginRight: 12,
  },
  scheduleInfo: {
    flex: 1,
  },
  schedulePlantName: {
    ...typography.bodyBold,
    color: colors.gray900,
  },
  scheduleType: {
    ...typography.caption,
    color: colors.gray500,
    marginTop: 2,
  },
  scheduleDate: {
    ...typography.small,
    color: colors.gray400,
    marginTop: 2,
  },
  scheduleAction: {
    marginLeft: 8,
  },
});
