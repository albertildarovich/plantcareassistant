import { makeAutoObservable, runInAction } from 'mobx';
import { IdentificationResult } from '@shared/types';

class IdentifyPlantModel {
  capturedImageUri: string | null = null;
  identificationResult: IdentificationResult | null = null;
  isIdentifying = false;
  error: string | null = null;

  constructor() {
    makeAutoObservable(this);
  }

  setCapturedImage(uri: string): void {
    this.capturedImageUri = uri;
    this.identificationResult = null;
    this.error = null;
  }

  async identifyPlant(imageUri: string): Promise<void> {
    this.isIdentifying = true;
    this.error = null;

    try {
      // Simulated plant identification API call
      // In production, integrate with a service like Plant.id or Google Cloud Vision
      const result = await this.mockIdentify(imageUri);

      runInAction(() => {
        this.identificationResult = result;
        this.isIdentifying = false;
      });
    } catch (err) {
      runInAction(() => {
        this.error = 'Failed to identify plant. Please try again.';
        this.isIdentifying = false;
      });
    }
  }

  // Mock identification for demo purposes
  private async mockIdentify(imageUri: string): Promise<IdentificationResult> {
    await new Promise<void>(resolve => setTimeout(resolve, 2000));

    const mockResults: IdentificationResult[] = [
      {
        plantName: 'Monstera Deliciosa',
        scientificName: 'Monstera deliciosa',
        confidence: 0.94,
        description:
          'A tropical plant native to southern Mexico, known for its large, distinctive leaves with natural holes.',
        careInstructions:
          'Water when top 2 inches of soil are dry. Thrives in bright, indirect light. Prefers humidity above 60%.',
      },
      {
        plantName: 'Snake Plant',
        scientificName: 'Sansevieria trifasciata',
        confidence: 0.91,
        description:
          'A hardy succulent native to West Africa, known for its upright, sword-like leaves.',
        careInstructions:
          'Water sparingly - let soil dry completely between waterings. Tolerates low light. Perfect for beginners.',
      },
      {
        plantName: 'Peace Lily',
        scientificName: 'Spathiphyllum wallisii',
        confidence: 0.88,
        description:
          'An elegant flowering plant native to tropical Americas, known for its white spathes and air-purifying qualities.',
        careInstructions:
          'Water weekly, keep soil moist but not soggy. Prefers low to medium indirect light. Droops when thirsty.',
      },
    ];

    return mockResults[Math.floor(Math.random() * mockResults.length)];
  }

  clearIdentification(): void {
    this.capturedImageUri = null;
    this.identificationResult = null;
    this.error = null;
    this.isIdentifying = false;
  }
}

export const identifyPlantModel = new IdentifyPlantModel();
