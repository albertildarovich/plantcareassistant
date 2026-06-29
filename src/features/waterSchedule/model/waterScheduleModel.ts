import { makeAutoObservable } from 'mobx';
import { PlantCareSchedule } from '@shared/types';
import { plantStore } from '@entities/plant';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

class WaterScheduleModel {
  loading = false;

  constructor() {
    makeAutoObservable(this);
  }

  get todayTasks(): PlantCareSchedule[] {
    const today = new Date().toDateString();
    return plantStore.schedules.filter(s => {
      const dueDate = new Date(s.nextDueAt).toDateString();
      return dueDate === today;
    });
  }

  get overdueTasks(): PlantCareSchedule[] {
    return plantStore.dueSchedules.filter(s => {
      const dueDate = new Date(s.nextDueAt);
      const today = new Date();
      return dueDate < today && !this.isToday(dueDate);
    });
  }

  get upcomingTasks(): PlantCareSchedule[] {
    return plantStore.upcomingSchedules;
  }

  private isToday(date: Date): boolean {
    return date.toDateString() === new Date().toDateString();
  }

  async requestNotificationPermission(): Promise<boolean> {
    try {
      const { status } = await Notifications.requestPermissionsAsync();
      return status === 'granted';
    } catch {
      return false;
    }
  }

  async scheduleNotifications(): Promise<void> {
    try {
      // Remove existing scheduled notifications
      await Notifications.cancelAllScheduledNotificationsAsync();

      // Schedule watering notifications
      for (const schedule of plantStore.schedules) {
        const dueDate = new Date(schedule.nextDueAt);
        const plant = plantStore.getPlantById(schedule.plantId);

        if (!plant || dueDate <= new Date()) continue;

        const title =
          schedule.type === 'watering'
            ? `💧 Time to water ${plant.name}`
            : `🌿 Time to fertilize ${plant.name}`;

        const body =
          schedule.type === 'watering'
            ? `${plant.name} needs watering today. Keep it healthy!`
            : `${plant.name} needs fertilizing. Feed your plant!`;

        const trigger = {
          date: dueDate,
          type: Notifications.SchedulableTriggerInputTypes.DATE,
        } as Notifications.DateTriggerInput;

        await Notifications.scheduleNotificationAsync({
          content: {
            title,
            body,
            sound: 'default',
            data: { plantId: schedule.plantId, type: schedule.type },
          },
          trigger,
        });
      }
    } catch (err) {
      console.error('Failed to schedule notifications:', err);
    }
  }

  async completeTask(plantId: string, type: 'watering' | 'fertilizing'): Promise<void> {
    if (type === 'watering') {
      await plantStore.markWatered(plantId);
    } else {
      await plantStore.markFertilized(plantId);
    }
    await this.scheduleNotifications();
  }
}

export const waterScheduleModel = new WaterScheduleModel();
