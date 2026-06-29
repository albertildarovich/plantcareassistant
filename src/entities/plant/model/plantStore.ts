import { makeAutoObservable, runInAction } from 'mobx';
import { Plant, GrowthPhoto, PlantCareSchedule } from '@shared/types';
import { getDatabase } from '@shared/api/database';
import { getNextDateFromDays, generateId } from '@shared/lib/helpers';

class PlantStore {
  plants: Plant[] = [];
  schedules: PlantCareSchedule[] = [];
  selectedPlant: Plant | null = null;
  loading = false;
  error: string | null = null;

  constructor() {
    makeAutoObservable(this);
  }

  async loadPlants(ownerId: string): Promise<void> {
    this.loading = true;
    this.error = null;

    try {
      const db = getDatabase();
      const plantsResult = await db.getAllAsync(
        'SELECT * FROM plants WHERE ownerId = ? ORDER BY createdAt DESC',
        [ownerId],
      );
      const photosResult = await db.getAllAsync(
        'SELECT * FROM growth_photos ORDER BY takenAt DESC',
      );
      const schedulesResult = await db.getAllAsync(
        'SELECT * FROM care_schedules',
      );

      const plants: Plant[] = (plantsResult as any[]).map(item => ({
        ...item,
        isIndoor: item.isIndoor === 1,
        category: item.categoryId
          ? { id: item.categoryId, name: '', icon: '' }
          : undefined,
      }));

      const photos = photosResult as GrowthPhoto[];
      const schedules = schedulesResult as PlantCareSchedule[];

      runInAction(() => {
        this.plants = plants.map(p => ({
          ...p,
          growthProgressPhotos: photos.filter(ph => (ph as any).plantId === p.id),
        }));
        this.schedules = schedules;
        this.loading = false;
      });
    } catch (err) {
      runInAction(() => {
        this.error = 'Failed to load plants';
        this.loading = false;
      });
    }
  }

  async addPlant(plant: Omit<Plant, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    const id = generateId();
    const now = new Date().toISOString();
    const nextWatering = getNextDateFromDays(plant.wateringFrequencyDays);
    const nextFertilizing = getNextDateFromDays(plant.fertilizingFrequencyDays);

    const newPlant: Plant = {
      ...plant,
      id,
      createdAt: now,
      updatedAt: now,
      nextWateringAt: nextWatering,
      nextFertilizingAt: nextFertilizing,
      growthProgressPhotos: [],
    };

    try {
      const db = getDatabase();
      await db.runAsync(
        `INSERT INTO plants (id, name, scientificName, description, imageUri, categoryId,
          wateringFrequencyDays, fertilizingFrequencyDays, lastWateredAt, lastFertilizedAt,
          nextWateringAt, nextFertilizingAt, sunlightRequirement, humidityPreference,
          temperatureRange, isIndoor, notes, createdAt, updatedAt, ownerId)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          newPlant.id, newPlant.name, newPlant.scientificName || null,
          newPlant.description || null, newPlant.imageUri || null,
          plant.category?.id || null, newPlant.wateringFrequencyDays,
          newPlant.fertilizingFrequencyDays, newPlant.lastWateredAt || null,
          newPlant.lastFertilizedAt || null, newPlant.nextWateringAt,
          newPlant.nextFertilizingAt, newPlant.sunlightRequirement,
          newPlant.humidityPreference || null, newPlant.temperatureRange || null,
          newPlant.isIndoor ? 1 : 0, newPlant.notes || null,
          newPlant.createdAt, newPlant.updatedAt, newPlant.ownerId,
        ],
      );

      // Create schedules
      await Promise.all([
        db.runAsync(
          `INSERT INTO care_schedules (id, plantId, type, lastDoneAt, nextDueAt, frequencyDays)
           VALUES (?, ?, 'watering', ?, ?, ?)`,
          [generateId(), id, plant.lastWateredAt || null, nextWatering, plant.wateringFrequencyDays],
        ),
        db.runAsync(
          `INSERT INTO care_schedules (id, plantId, type, lastDoneAt, nextDueAt, frequencyDays)
           VALUES (?, ?, 'fertilizing', ?, ?, ?)`,
          [generateId(), id, plant.lastFertilizedAt || null, nextFertilizing, plant.fertilizingFrequencyDays],
        ),
      ]);

      runInAction(() => {
        this.plants.unshift(newPlant);
        this.schedules.push(
          { plantId: id, type: 'watering', nextDueAt: nextWatering, frequencyDays: plant.wateringFrequencyDays },
          { plantId: id, type: 'fertilizing', nextDueAt: nextFertilizing, frequencyDays: plant.fertilizingFrequencyDays },
        );
      });

      return id;
    } catch (err) {
      runInAction(() => {
        this.error = 'Failed to add plant';
      });
      throw err;
    }
  }

  async updatePlant(id: string, updates: Partial<Plant>): Promise<void> {
    try {
      const db = getDatabase();
      const fields: string[] = [];
      const values: any[] = [];

      Object.entries(updates).forEach(([key, value]) => {
        if (key !== 'id' && key !== 'createdAt' && key !== 'growthProgressPhotos') {
          fields.push(`${key} = ?`);
          if (key === 'isIndoor') {
            values.push(value ? 1 : 0);
          } else {
            values.push(value);
          }
        }
      });

      values.push(id);
      fields.push('updatedAt = ?');
      values.push(new Date().toISOString());

      await db.runAsync(
        `UPDATE plants SET ${fields.join(', ')} WHERE id = ?`,
        values,
      );

      runInAction(() => {
        const index = this.plants.findIndex(p => p.id === id);
        if (index !== -1) {
          this.plants[index] = { ...this.plants[index], ...updates, updatedAt: new Date().toISOString() };
        }
      });
    } catch (err) {
      runInAction(() => {
        this.error = 'Failed to update plant';
      });
    }
  }

  async deletePlant(id: string): Promise<void> {
    try {
      const db = getDatabase();
      await db.runAsync('DELETE FROM plants WHERE id = ?', [id]);
      await db.runAsync('DELETE FROM care_schedules WHERE plantId = ?', [id]);
      await db.runAsync('DELETE FROM growth_photos WHERE plantId = ?', [id]);

      runInAction(() => {
        this.plants = this.plants.filter(p => p.id !== id);
        this.schedules = this.schedules.filter(s => s.plantId !== id);
        if (this.selectedPlant?.id === id) {
          this.selectedPlant = null;
        }
      });
    } catch (err) {
      runInAction(() => {
        this.error = 'Failed to delete plant';
      });
    }
  }

  async markWatered(plantId: string): Promise<void> {
    const now = new Date().toISOString();
    const plant = this.plants.find(p => p.id === plantId);
    if (!plant) return;

    const nextWatering = getNextDateFromDays(plant.wateringFrequencyDays);

    try {
      const db = getDatabase();
      await db.runAsync(
        'UPDATE plants SET lastWateredAt = ?, nextWateringAt = ?, updatedAt = ? WHERE id = ?',
        [now, nextWatering, now, plantId],
      );
      await db.runAsync(
        'UPDATE care_schedules SET lastDoneAt = ?, nextDueAt = ? WHERE plantId = ? AND type = ?',
        [now, nextWatering, plantId, 'watering'],
      );

      runInAction(() => {
        const p = this.plants.find(pl => pl.id === plantId);
        if (p) {
          p.lastWateredAt = now;
          p.nextWateringAt = nextWatering;
          p.updatedAt = now;
        }
        const schedule = this.schedules.find(s => s.plantId === plantId && s.type === 'watering');
        if (schedule) {
          schedule.lastDoneAt = now;
          schedule.nextDueAt = nextWatering;
        }
      });
    } catch (err) {
      runInAction(() => {
        this.error = 'Failed to update watering';
      });
    }
  }

  async markFertilized(plantId: string): Promise<void> {
    const now = new Date().toISOString();
    const plant = this.plants.find(p => p.id === plantId);
    if (!plant) return;

    const nextFertilizing = getNextDateFromDays(plant.fertilizingFrequencyDays);

    try {
      const db = getDatabase();
      await db.runAsync(
        'UPDATE plants SET lastFertilizedAt = ?, nextFertilizingAt = ?, updatedAt = ? WHERE id = ?',
        [now, nextFertilizing, now, plantId],
      );
      await db.runAsync(
        'UPDATE care_schedules SET lastDoneAt = ?, nextDueAt = ? WHERE plantId = ? AND type = ?',
        [now, nextFertilizing, plantId, 'fertilizing'],
      );

      runInAction(() => {
        const p = this.plants.find(pl => pl.id === plantId);
        if (p) {
          p.lastFertilizedAt = now;
          p.nextFertilizingAt = nextFertilizing;
          p.updatedAt = now;
        }
        const schedule = this.schedules.find(s => s.plantId === plantId && s.type === 'fertilizing');
        if (schedule) {
          schedule.lastDoneAt = now;
          schedule.nextDueAt = nextFertilizing;
        }
      });
    } catch (err) {
      runInAction(() => {
        this.error = 'Failed to update fertilizing';
      });
    }
  }

  async addGrowthPhoto(plantId: string, uri: string, notes?: string): Promise<void> {
    const photo: GrowthPhoto = {
      id: generateId(),
      uri,
      takenAt: new Date().toISOString(),
      notes,
    };

    try {
      const db = getDatabase();
      await db.runAsync(
        'INSERT INTO growth_photos (id, plantId, uri, takenAt, notes) VALUES (?, ?, ?, ?, ?)',
        [photo.id, plantId, photo.uri, photo.takenAt, photo.notes || null],
      );

      runInAction(() => {
        const plant = this.plants.find(p => p.id === plantId);
        if (plant) {
          plant.growthProgressPhotos.unshift(photo);
        }
      });
    } catch (err) {
      runInAction(() => {
        this.error = 'Failed to add photo';
      });
    }
  }

  setSelectedPlant(plant: Plant | null): void {
    this.selectedPlant = plant;
  }

  getPlantById(id: string): Plant | undefined {
    return this.plants.find(p => p.id === id);
  }

  get dueSchedules(): PlantCareSchedule[] {
    const now = new Date();
    return this.schedules.filter(s => new Date(s.nextDueAt) <= now);
  }

  get upcomingSchedules(): PlantCareSchedule[] {
    const now = new Date();
    const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    return this.schedules.filter(s => {
      const dueDate = new Date(s.nextDueAt);
      return dueDate > now && dueDate <= nextWeek;
    });
  }
}

export const plantStore = new PlantStore();
