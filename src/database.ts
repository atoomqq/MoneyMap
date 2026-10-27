
import * as SQLite from 'expo-sqlite';

export type SavedTransaction = {
  id: string;
  title: string;
  amount: number;
  type: string;
  category: string | null;
  date: string;
};

export type SavedGoal = {
  id: string;
  title: string;
  targetAmount: number;
  savedAmount: number;
  createdAt: string;
};

export type AppLanguage = 'ru' | 'uk';
export type AppCurrency = 'UAH' | 'USD' | 'EUR';

export const databasePromise = SQLite.openDatabaseAsync('moneymap.db');

export async function initDatabase() {
  const db = await databasePromise;

  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS transactions (
      id TEXT PRIMARY KEY NOT NULL,
      title TEXT NOT NULL,
      amount REAL NOT NULL,
      type TEXT NOT NULL,
      category TEXT,
      date TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS goals (
      id TEXT PRIMARY KEY NOT NULL,
      title TEXT NOT NULL,
      targetAmount REAL NOT NULL,
      savedAmount REAL NOT NULL DEFAULT 0,
      createdAt TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS app_settings (
      key TEXT PRIMARY KEY NOT NULL,
      value TEXT NOT NULL
    );
  `);
}

// TRANSACTIONS

export async function getTransactions(): Promise<SavedTransaction[]> {
  const db = await databasePromise;

  return db.getAllAsync<SavedTransaction>(
    'SELECT * FROM transactions ORDER BY date DESC'
  );
}

export async function addTransaction(transaction: {
  id: string;
  title: string;
  amount: number;
  type: string;
  category?: string | null;
  date: string;
}) {
  const db = await databasePromise;

  await db.runAsync(
    `INSERT INTO transactions
      (id, title, amount, type, category, date)
     VALUES (?, ?, ?, ?, ?, ?)`,
    transaction.id,
    transaction.title,
    transaction.amount,
    transaction.type,
    transaction.category ?? null,
    transaction.date
  );
}

export async function deleteTransaction(id: string) {
  const db = await databasePromise;

  await db.runAsync(
    'DELETE FROM transactions WHERE id = ?',
    id
  );
}

// GOALS

export async function getGoals(): Promise<SavedGoal[]> {
  const db = await databasePromise;

  return db.getAllAsync<SavedGoal>(
    'SELECT * FROM goals ORDER BY createdAt DESC'
  );
}

export async function addGoal(goal: {
  id: string;
  title: string;
  targetAmount: number;
  savedAmount?: number;
  createdAt?: string;
}) {
  const db = await databasePromise;

  await db.runAsync(
    `INSERT INTO goals
      (id, title, targetAmount, savedAmount, createdAt)
     VALUES (?, ?, ?, ?, ?)`,
    goal.id,
    goal.title.trim(),
    goal.targetAmount,
    goal.savedAmount ?? 0,
    goal.createdAt ?? new Date().toISOString()
  );
}

export async function updateGoalSavings(
  id: string,
  savedAmount: number
) {
  const db = await databasePromise;

  await db.runAsync(
    'UPDATE goals SET savedAmount = ? WHERE id = ?',
    Math.max(0, savedAmount),
    id
  );
}

export async function deleteGoal(id: string) {
  const db = await databasePromise;

  await db.runAsync(
    'DELETE FROM goals WHERE id = ?',
    id
  );
}

// AVAILABLE BALANCE

export async function getAvailableBalance(): Promise<number> {
  const db = await databasePromise;

  const result = await db.getFirstAsync<{ balance: number }>(`
    SELECT COALESCE(
      SUM(
        CASE
          WHEN type = 'income' THEN amount
          WHEN type = 'expense' THEN -amount
          WHEN type = 'goal_contribution' THEN -amount
          WHEN type = 'goal_return' THEN amount
          ELSE 0
        END
      ),
      0
    ) AS balance
    FROM transactions
  `);

  return result?.balance ?? 0;
}

// ADD MONEY TO GOAL

export async function contributeToGoal(
  goalId: string,
  amount: number
) {
  const db = await databasePromise;

  if (!Number.isFinite(amount) || amount <= 0) {
    throw new Error('INVALID_AMOUNT');
  }

  await db.withTransactionAsync(async () => {
    const goal = await db.getFirstAsync<SavedGoal>(
      'SELECT * FROM goals WHERE id = ?',
      goalId
    );

    if (!goal) {
      throw new Error('GOAL_NOT_FOUND');
    }

    const result = await db.getFirstAsync<{ balance: number }>(`
      SELECT COALESCE(
        SUM(
          CASE
            WHEN type = 'income' THEN amount
            WHEN type = 'expense' THEN -amount
            WHEN type = 'goal_contribution' THEN -amount
            WHEN type = 'goal_return' THEN amount
            ELSE 0
          END
        ),
        0
      ) AS balance
      FROM transactions
    `);

    const balance = result?.balance ?? 0;

    if (amount > balance) {
      throw new Error('INSUFFICIENT_BALANCE');
    }

    await db.runAsync(
      'UPDATE goals SET savedAmount = savedAmount + ? WHERE id = ?',
      amount,
      goalId
    );

    await db.runAsync(
      `INSERT INTO transactions
        (id, title, amount, type, category, date)
       VALUES (?, ?, ?, ?, ?, ?)`,
      `goal-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      `Пополнение цели: ${goal.title}`,
      amount,
      'goal_contribution',
      'Цель',
      new Date().toISOString()
    );
  });
}

// DELETE GOAL AND RETURN SAVINGS

export async function deleteGoalAndReturnSavings(goalId: string) {
  const db = await databasePromise;

  await db.withTransactionAsync(async () => {
    const goal = await db.getFirstAsync<SavedGoal>(
      'SELECT * FROM goals WHERE id = ?',
      goalId
    );

    if (!goal) {
      throw new Error('GOAL_NOT_FOUND');
    }

    if (goal.savedAmount > 0) {
      await db.runAsync(
        `INSERT INTO transactions
          (id, title, amount, type, category, date)
         VALUES (?, ?, ?, ?, ?, ?)`,
        `return-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        `Возврат из цели: ${goal.title}`,
        goal.savedAmount,
        'goal_return',
        'Возврат из цели',
        new Date().toISOString()
      );
    }

    await db.runAsync(
      'DELETE FROM goals WHERE id = ?',
      goalId
    );
  });
}

// SETTINGS

export async function getSetting(key: string): Promise<string | null> {
  const db = await databasePromise;

  const result = await db.getFirstAsync<{ value: string }>(
    'SELECT value FROM app_settings WHERE key = ?',
    key
  );

  return result?.value ?? null;
}

export async function setSetting(key: string, value: string) {
  const db = await databasePromise;

  await db.runAsync(
    `INSERT INTO app_settings (key, value)
     VALUES (?, ?)
     ON CONFLICT(key) DO UPDATE SET value = excluded.value`,
    key,
    value
  );
}

export async function getAppLanguage(): Promise<AppLanguage> {
  const value = await getSetting('language');

  return value === 'uk' ? 'uk' : 'ru';
}

export async function setAppLanguage(language: AppLanguage) {
  await setSetting('language', language);
}

export async function getAppCurrency(): Promise<AppCurrency> {
  const value = await getSetting('currency');

  if (value === 'USD' || value === 'EUR') {
    return value;
  }

  return 'UAH';
}

export async function setAppCurrency(currency: AppCurrency) {
  await setSetting('currency', currency);
}

// RESET ALL APP DATA

export async function resetAllData() {
  const db = await databasePromise;

  await db.withTransactionAsync(async () => {
    await db.runAsync('DELETE FROM transactions');
    await db.runAsync('DELETE FROM goals');
    await db.runAsync('DELETE FROM app_settings');
  });
}
