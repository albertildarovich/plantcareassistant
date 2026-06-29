import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  FlatList,
} from 'react-native';
import { Card, Input, Chip, Badge, EmptyState } from '@shared/ui';
import { colors, typography } from '@shared/ui/theme';
import { observer } from 'mobx-react-lite';
import { useNavigation } from '@react-navigation/native';
import { searchPlantModel } from '@features/searchPlant/model';
import { PlantSearchResult, RootStackParamList } from '@shared/types';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const DIFFICULTY_FILTERS = ['All', 'easy', 'moderate', 'hard'] as const;

export const SearchPage: React.FC = observer(() => {
  const navigation = useNavigation<NavigationProp>();
  const [difficultyFilter, setDifficultyFilter] =
    useState<string>('All');
  const [query, setQuery] = useState('');

  const handleSearch = useCallback(
    (text: string) => {
      setQuery(text);
      searchPlantModel.search(text);
    },
    [],
  );

  const filteredResults = searchPlantModel.results.filter(result => {
    if (difficultyFilter === 'All') return true;
    return result.difficulty === difficultyFilter;
  });

  const handleSelectPlant = (plant: PlantSearchResult) => {
    navigation.navigate('AddPlant', {
      identificationResult: {
        plantName: plant.name,
        scientificName: plant.scientificName,
        confidence: 1,
        description: plant.description,
      },
    });
  };

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <Text style={styles.title}>Plant Database</Text>
          <Text style={styles.subtitle}>
            Search from our plant library
          </Text>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Search plants..."
            placeholderTextColor={colors.gray400}
            value={query}
            onChangeText={handleSearch}
            autoCapitalize="none"
            autoCorrect={false}
          />
          {query.length > 0 && (
            <TouchableOpacity
              onPress={() => {
                setQuery('');
                searchPlantModel.clear();
              }}
            >
              <Text style={styles.clearButton}>✕</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Difficulty Filter */}
        <View style={styles.filterRow}>
          {DIFFICULTY_FILTERS.map(filter => (
            <Chip
              key={filter}
              label={filter === 'All' ? 'All Levels' : filter}
              selected={difficultyFilter === filter}
              onPress={() => setDifficultyFilter(filter)}
              color={
                filter === 'easy'
                  ? colors.success
                  : filter === 'moderate'
                  ? colors.warning
                  : filter === 'hard'
                  ? colors.error
                  : undefined
              }
            />
          ))}
        </View>

        {/* Results */}
        {filteredResults.length === 0 && query.length > 0 && (
          <EmptyState
            title="No plants found"
            description={`No results for "${query}". Try a different search term.`}
            icon="🔍"
          />
        )}

        {filteredResults.length === 0 && query.length === 0 && (
          <View style={styles.suggestionsContainer}>
            <Text style={styles.suggestionsTitle}>Popular Plants</Text>
            <View style={styles.popularGrid}>
              {searchPlantModel.allCommonPlants.slice(0, 6).map(plant => (
                <TouchableOpacity
                  key={plant.id}
                  style={styles.popularCard}
                  onPress={() => handleSelectPlant(plant)}
                >
                  <Text style={styles.popularIcon}>🪴</Text>
                  <Text style={styles.popularName} numberOfLines={2}>
                    {plant.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* Search Results List */}
        {filteredResults.length > 0 && (
          <View style={styles.resultsContainer}>
            {filteredResults.map(result => (
              <TouchableOpacity
                key={result.id}
                onPress={() => handleSelectPlant(result)}
              >
                <Card variant="outlined" style={styles.resultCard}>
                  <View style={styles.resultRow}>
                    <View style={styles.resultIcon}>
                      <Text style={{ fontSize: 32 }}>🪴</Text>
                    </View>
                    <View style={styles.resultInfo}>
                      <Text style={styles.resultName}>{result.name}</Text>
                      <Text style={styles.resultScientificName}>
                        {result.scientificName}
                      </Text>
                      {result.difficulty && (
                        <View style={styles.difficultyRow}>
                          <Badge
                            label={result.difficulty}
                            variant={
                              result.difficulty === 'easy'
                                ? 'success'
                                : result.difficulty === 'moderate'
                                ? 'warning'
                                : 'error'
                            }
                          />
                        </View>
                      )}
                    </View>
                    <Text style={styles.addIcon}>+</Text>
                  </View>
                </Card>
              </TouchableOpacity>
            ))}
          </View>
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
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    marginHorizontal: 16,
    borderRadius: 12,
    paddingHorizontal: 14,
    borderWidth: 1.5,
    borderColor: colors.gray200,
    marginBottom: 12,
  },
  searchIcon: {
    fontSize: 18,
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    ...typography.body,
    color: colors.gray900,
    paddingVertical: 14,
  },
  clearButton: {
    fontSize: 18,
    color: colors.gray400,
    padding: 4,
  },
  filterRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginBottom: 16,
    flexWrap: 'wrap',
  },
  suggestionsContainer: {
    paddingHorizontal: 16,
  },
  suggestionsTitle: {
    ...typography.h4,
    color: colors.gray800,
    marginBottom: 12,
  },
  popularGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  popularCard: {
    width: '30%',
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.gray200,
  },
  popularIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  popularName: {
    ...typography.caption,
    color: colors.gray700,
    textAlign: 'center',
    fontWeight: '500',
  },
  resultsContainer: {
    paddingHorizontal: 16,
  },
  resultCard: {
    marginVertical: 4,
  },
  resultRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  resultIcon: {
    width: 50,
    height: 50,
    borderRadius: 12,
    backgroundColor: colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  resultInfo: {
    flex: 1,
  },
  resultName: {
    ...typography.bodyBold,
    color: colors.gray900,
  },
  resultScientificName: {
    ...typography.caption,
    color: colors.gray500,
    fontStyle: 'italic',
    marginTop: 2,
  },
  difficultyRow: {
    flexDirection: 'row',
    marginTop: 4,
  },
  addIcon: {
    fontSize: 24,
    color: colors.primary,
    fontWeight: '600',
    marginLeft: 8,
  },
});
