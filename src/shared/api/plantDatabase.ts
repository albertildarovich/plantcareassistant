import { PlantSearchResult } from '@shared/types';

const PLANT_DB_API = 'https://openfarm.cc/api/v1';

export async function searchPlantDatabase(query: string): Promise<PlantSearchResult[]> {
  try {
    const response = await fetch(
      `${PLANT_DB_API}/plants?q=${encodeURIComponent(query)}`,
    );

    if (!response.ok) {
      return [];
    }

    const data = await response.json();
    return data.data?.map((item: any) => ({
      id: item.id,
      name: item.attributes.name,
      scientificName: item.attributes.scientific_name || '',
      imageUrl: item.attributes.main_image_path || undefined,
      description: item.attributes.description || undefined,
    })) || [];
  } catch {
    return [];
  }
}

export const COMMON_HOUSEPLANTS: PlantSearchResult[] = [
  { id: '1', name: 'Monstera Deliciosa', scientificName: 'Monstera deliciosa', difficulty: 'easy' },
  { id: '2', name: 'Snake Plant', scientificName: 'Sansevieria trifasciata', difficulty: 'easy' },
  { id: '3', name: 'Peace Lily', scientificName: 'Spathiphyllum wallisii', difficulty: 'easy' },
  { id: '4', name: 'Fiddle Leaf Fig', scientificName: 'Ficus lyrata', difficulty: 'moderate' },
  { id: '5', name: 'Pothos', scientificName: 'Epipremnum aureum', difficulty: 'easy' },
  { id: '6', name: 'ZZ Plant', scientificName: 'Zamioculcas zamiifolia', difficulty: 'easy' },
  { id: '7', name: 'Spider Plant', scientificName: 'Chlorophytum comosum', difficulty: 'easy' },
  { id: '8', name: 'Aloe Vera', scientificName: 'Aloe barbadensis miller', difficulty: 'easy' },
  { id: '9', name: 'Calathea', scientificName: 'Calathea spp.', difficulty: 'moderate' },
  { id: '10', name: 'Boston Fern', scientificName: 'Nephrolepis exaltata', difficulty: 'moderate' },
  { id: '11', name: 'Rubber Plant', scientificName: 'Ficus elastica', difficulty: 'easy' },
  { id: '12', name: 'Bamboo Palm', scientificName: 'Chamaedorea seifrizii', difficulty: 'easy' },
  { id: '13', name: 'Chinese Money Plant', scientificName: 'Pilea peperomioides', difficulty: 'easy' },
  { id: '14', name: 'Jade Plant', scientificName: 'Crassula ovata', difficulty: 'easy' },
  { id: '15', name: 'Orchid', scientificName: 'Phalaenopsis spp.', difficulty: 'moderate' },
  { id: '16', name: 'Succulent Mix', scientificName: 'Various', difficulty: 'easy' },
  { id: '17', name: 'Lavender', scientificName: 'Lavandula angustifolia', difficulty: 'hard' },
  { id: '18', name: 'Basil', scientificName: 'Ocimum basilicum', difficulty: 'easy' },
  { id: '19', name: 'Mint', scientificName: 'Mentha spp.', difficulty: 'easy' },
  { id: '20', name: 'Rosemary', scientificName: 'Salvia rosmarinus', difficulty: 'moderate' },
];
