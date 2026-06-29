import { makeAutoObservable, runInAction } from 'mobx';
import { PlantSearchResult } from '@shared/types';
import { searchPlantDatabase, COMMON_HOUSEPLANTS } from '@shared/api/plantDatabase';

class SearchPlantModel {
  query: string = '';
  results: PlantSearchResult[] = [];
  allCommonPlants: PlantSearchResult[] = COMMON_HOUSEPLANTS;
  loading = false;
  error: string | null = null;

  constructor() {
    makeAutoObservable(this);
  }

  setQuery(query: string): void {
    this.query = query;
    if (query.length === 0) {
      this.results = [];
    }
  }

  async search(query: string): Promise<void> {
    this.query = query;
    if (!query.trim()) {
      this.results = [];
      return;
    }

    this.loading = true;
    this.error = null;

    try {
      // Search locally first
      const localResults = this.allCommonPlants.filter(
        plant =>
          plant.name.toLowerCase().includes(query.toLowerCase()) ||
          plant.scientificName.toLowerCase().includes(query.toLowerCase()),
      );

      // Then try online API
      const onlineResults = await searchPlantDatabase(query);

      // Merge results - prefer local matches, then add unique online matches
      const mergedResults = [...localResults];
      const localIds = new Set(localResults.map(r => r.id));

      for (const result of onlineResults) {
        if (!localIds.has(result.id)) {
          mergedResults.push(result);
        }
      }

      runInAction(() => {
        this.results = mergedResults;
        this.loading = false;
      });
    } catch (err) {
      runInAction(() => {
        // Fallback to local results on error
        this.results = this.allCommonPlants.filter(
          plant =>
            plant.name.toLowerCase().includes(query.toLowerCase()) ||
            plant.scientificName.toLowerCase().includes(query.toLowerCase()),
        );
        this.loading = false;
      });
    }
  }

  clear(): void {
    this.query = '';
    this.results = [];
    this.error = null;
  }
}

export const searchPlantModel = new SearchPlantModel();
