import * as SQLite from 'expo-sqlite';

let db: SQLite.SQLiteDatabase | null = null;

export async function initDatabase(): Promise<SQLite.SQLiteDatabase> {
  db = await SQLite.openDatabaseAsync('PlantCareAssistant.db');
  await createTables(db);
  return db;
}

async function createTables(database: SQLite.SQLiteDatabase): Promise<void> {
  await database.execAsync(`
    CREATE TABLE IF NOT EXISTS plants (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      scientificName TEXT,
      description TEXT,
      imageUri TEXT,
      categoryId TEXT,
      wateringFrequencyDays INTEGER NOT NULL DEFAULT 7,
      fertilizingFrequencyDays INTEGER NOT NULL DEFAULT 30,
      lastWateredAt TEXT,
      lastFertilizedAt TEXT,
      nextWateringAt TEXT,
      nextFertilizingAt TEXT,
      sunlightRequirement TEXT NOT NULL DEFAULT 'medium',
      humidityPreference TEXT,
      temperatureRange TEXT,
      isIndoor INTEGER NOT NULL DEFAULT 1,
      notes TEXT,
      createdAt TEXT NOT NULL,
      updatedAt TEXT NOT NULL,
      ownerId TEXT NOT NULL
    )
  `);

  await database.execAsync(`
    CREATE TABLE IF NOT EXISTS growth_photos (
      id TEXT PRIMARY KEY,
      plantId TEXT NOT NULL,
      uri TEXT NOT NULL,
      takenAt TEXT NOT NULL,
      notes TEXT,
      FOREIGN KEY (plantId) REFERENCES plants(id) ON DELETE CASCADE
    )
  `);

  await database.execAsync(`
    CREATE TABLE IF NOT EXISTS care_schedules (
      id TEXT PRIMARY KEY,
      plantId TEXT NOT NULL,
      type TEXT NOT NULL CHECK(type IN ('watering', 'fertilizing')),
      lastDoneAt TEXT,
      nextDueAt TEXT NOT NULL,
      frequencyDays INTEGER NOT NULL,
      FOREIGN KEY (plantId) REFERENCES plants(id) ON DELETE CASCADE
    )
  `);

  await database.execAsync(`
    CREATE TABLE IF NOT EXISTS plant_categories (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      icon TEXT NOT NULL
    )
  `);

  await database.execAsync(`
    CREATE TABLE IF NOT EXISTS plant_database (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      scientificName TEXT,
      imageUrl TEXT,
      description TEXT,
      difficulty TEXT CHECK(difficulty IN ('easy', 'moderate', 'hard')),
      wateringFrequencyDays INTEGER,
      sunlightRequirement TEXT
    )
  `);
}

export function getDatabase(): SQLite.SQLiteDatabase {
  if (!db) {
    throw new Error('Database not initialized. Call initDatabase() first.');
  }
  return db;
}

export async function closeDatabase(): Promise<void> {
  if (db) {
    await db.closeAsync();
    db = null;
  }
}
