import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';

import {
  Alert,
  ActivityIndicator,
  Modal,
  Pressable,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { NavigationContainer } from '@react-navigation/native';
import {
  createBottomTabNavigator,
  BottomTabNavigationProp,
} from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

import {
  initDatabase,
  getTransactions,
  addTransaction as saveTransaction,
  deleteTransaction as removeTransaction,
  getGoals,
  addGoal,
  contributeToGoal,
  deleteGoalAndReturnSavings,
  getAppLanguage,
  setAppLanguage,
  getAppCurrency,
  setAppCurrency,
  resetAllData,
  type SavedTransaction,
  type SavedGoal,
  type AppLanguage,
  type AppCurrency,
} from './src/database';

type RootParamList = {
  Home: undefined;
  Analytics: undefined;
  Goals: undefined;
  Settings: undefined;
};

type TransactionType = 'income' | 'expense';

const Tab = createBottomTabNavigator<RootParamList>();

const purple = '#7655F6';
const background = '#F6F5FB';
const cardBackground = '#FFFFFF';
const dark = '#201D2B';
const muted = '#92909E';
const green = '#22A06B';
const red = '#E75C68';

type TranslationKey =
  | 'home'
  | 'analytics'
  | 'goals'
  | 'settings'
  | 'balance'
  | 'income'
  | 'expenses'
  | 'available'
  | 'recentTransactions'
  | 'allTransactions'
  | 'addTransaction'
  | 'noTransactions'
  | 'transactionTitle'
  | 'amount'
  | 'category'
  | 'date'
  | 'save'
  | 'cancel'
  | 'delete'
  | 'deleteTransaction'
  | 'deleteTransactionConfirm'
  | 'incomeType'
  | 'expenseType'
  | 'salary'
  | 'food'
  | 'transport'
  | 'shopping'
  | 'entertainment'
  | 'health'
  | 'other'
  | 'weeklyOverview'
  | 'totalIncome'
  | 'totalExpenses'
  | 'balanceDynamics'
  | 'financialGoals'
  | 'createGoal'
  | 'goalTitle'
  | 'targetAmount'
  | 'savedAmount'
  | 'addSavings'
  | 'goalProgress'
  | 'noGoals'
  | 'goalCreated'
  | 'goalDeleted'
  | 'goalDeleteConfirm'
  | 'contributionAmount'
  | 'settingsDescription'
  | 'language'
  | 'currency'
  | 'russian'
  | 'ukrainian'
  | 'resetData'
  | 'resetDescription'
  | 'resetConfirmTitle'
  | 'resetConfirmMessage'
  | 'resetConfirmButton'
  | 'resetSuccess'
  | 'resetSuccessMessage'
  | 'appearance'
  | 'dataManagement'
  | 'currencyNote'
  | 'selectLanguage'
  | 'selectCurrency'
  | 'week'
  | 'month'
  | 'allTime'
  | 'operationAdded'
  | 'enterValidAmount'
  | 'enterTitle'
  | 'enterGoalTitle'
  | 'enterTargetAmount'
  | 'goalContributionSuccess'
  | 'goalContributionError'
  | 'currencyUAH'
  | 'currencyUSD'
  | 'currencyEUR'
  | 'confirm'
  | 'deleteGoal'
  | 'deleteGoalQuestion';

const translations: Record<
  AppLanguage,
  Record<TranslationKey, string>
> = {
  ru: {
    home: 'Главная',
    analytics: 'Аналитика',
    goals: 'Цели',
    settings: 'Настройки',
    balance: 'Общий баланс',
    income: 'Доходы',
    expenses: 'Расходы',
    available: 'Доступно',
    recentTransactions: 'Последние операции',
    allTransactions: 'Все операции',
    addTransaction: 'Добавить операцию',
    noTransactions: 'Пока нет операций',
    transactionTitle: 'Название операции',
    amount: 'Сумма',
    category: 'Категория',
    date: 'Дата',
    save: 'Сохранить',
    cancel: 'Отмена',
    delete: 'Удалить',
    deleteTransaction: 'Удалить операцию',
    deleteTransactionConfirm: 'Вы уверены, что хотите удалить эту операцию?',
    incomeType: 'Доход',
    expenseType: 'Расход',
    salary: 'Зарплата',
    food: 'Еда',
    transport: 'Транспорт',
    shopping: 'Покупки',
    entertainment: 'Развлечения',
    health: 'Здоровье',
    other: 'Другое',
    weeklyOverview: 'Обзор за неделю',
    totalIncome: 'Всего доходов',
    totalExpenses: 'Всего расходов',
    balanceDynamics: 'Динамика баланса',
    financialGoals: 'Финансовые цели',
    createGoal: 'Создать цель',
    goalTitle: 'Название цели',
    targetAmount: 'Необходимая сумма',
    savedAmount: 'Уже накоплено',
    addSavings: 'Добавить накопления',
    goalProgress: 'Прогресс',
    noGoals: 'У тебя пока нет целей',
    goalCreated: 'Цель создана',
    goalDeleted: 'Цель удалена',
    goalDeleteConfirm: 'Удалить цель? Накопленные средства будут возвращены в доступный баланс.',
    contributionAmount: 'Сумма пополнения',
    settingsDescription: 'Настрой MoneyMap под себя',
    language: 'Язык приложения',
    currency: 'Валюта отображения',
    russian: 'Русский',
    ukrainian: 'Українська',
    resetData: 'Начать заново',
    resetDescription: 'Удалить все операции, цели и сохранённые настройки приложения.',
    resetConfirmTitle: 'Сбросить данные?',
    resetConfirmMessage: 'Все операции и финансовые цели будут удалены. Это действие нельзя отменить.',
    resetConfirmButton: 'Сбросить всё',
    resetSuccess: 'Данные сброшены',
    resetSuccessMessage: 'MoneyMap готов к новому старту.',
    appearance: 'ПЕРСОНАЛИЗАЦИЯ',
    dataManagement: 'УПРАВЛЕНИЕ ДАННЫМИ',
    currencyNote: 'Валюта меняет только отображение. Автоматической конвертации по курсу нет.',
    selectLanguage: 'Выбери язык',
    selectCurrency: 'Выбери валюту',
    week: 'Неделя',
    month: 'Месяц',
    allTime: 'Всё время',
    operationAdded: 'Операция добавлена',
    enterValidAmount: 'Введи корректную сумму больше нуля.',
    enterTitle: 'Введи название операции.',
    enterGoalTitle: 'Введи название цели.',
    enterTargetAmount: 'Введи корректную целевую сумму.',
    goalContributionSuccess: 'Накопления добавлены',
    goalContributionError: 'Недостаточно доступных средств.',
    currencyUAH: 'Гривна (₴)',
    currencyUSD: 'Доллар ($)',
    currencyEUR: 'Евро (€)',
    confirm: 'Подтвердить',
    deleteGoal: 'Удалить цель',
    deleteGoalQuestion: 'Удалить эту финансовую цель?',
  },

  uk: {
    home: 'Головна',
    analytics: 'Аналітика',
    goals: 'Цілі',
    settings: 'Налаштування',
    balance: 'Загальний баланс',
    income: 'Доходи',
    expenses: 'Витрати',
    available: 'Доступно',
    recentTransactions: 'Останні операції',
    allTransactions: 'Усі операції',
    addTransaction: 'Додати операцію',
    noTransactions: 'Поки немає операцій',
    transactionTitle: 'Назва операції',
    amount: 'Сума',
    category: 'Категорія',
    date: 'Дата',
    save: 'Зберегти',
    cancel: 'Скасувати',
    delete: 'Видалити',
    deleteTransaction: 'Видалити операцію',
    deleteTransactionConfirm: 'Ви впевнені, що хочете видалити цю операцію?',
    incomeType: 'Дохід',
    expenseType: 'Витрата',
    salary: 'Зарплата',
    food: 'Їжа',
    transport: 'Транспорт',
    shopping: 'Покупки',
    entertainment: 'Розваги',
    health: 'Здоров’я',
    other: 'Інше',
    weeklyOverview: 'Огляд за тиждень',
    totalIncome: 'Усього доходів',
    totalExpenses: 'Усього витрат',
    balanceDynamics: 'Динаміка балансу',
    financialGoals: 'Фінансові цілі',
    createGoal: 'Створити ціль',
    goalTitle: 'Назва цілі',
    targetAmount: 'Необхідна сума',
    savedAmount: 'Вже накопичено',
    addSavings: 'Додати заощадження',
    goalProgress: 'Прогрес',
    noGoals: 'У тебе поки немає цілей',
    goalCreated: 'Ціль створено',
    goalDeleted: 'Ціль видалено',
    goalDeleteConfirm: 'Видалити ціль? Накопичені кошти буде повернено до доступного балансу.',
    contributionAmount: 'Сума поповнення',
    settingsDescription: 'Налаштуй MoneyMap під себе',
    language: 'Мова застосунку',
    currency: 'Валюта відображення',
    russian: 'Русский',
    ukrainian: 'Українська',
    resetData: 'Почати заново',
    resetDescription: 'Видалити всі операції, цілі та збережені налаштування застосунку.',
    resetConfirmTitle: 'Скинути дані?',
    resetConfirmMessage: 'Усі операції та фінансові цілі буде видалено. Цю дію не можна скасувати.',
    resetConfirmButton: 'Скинути все',
    resetSuccess: 'Дані скинуто',
    resetSuccessMessage: 'MoneyMap готовий до нового старту.',
    appearance: 'ПЕРСОНАЛІЗАЦІЯ',
    dataManagement: 'КЕРУВАННЯ ДАНИМИ',
    currencyNote: 'Валюта змінює лише відображення. Автоматичної конвертації за курсом немає.',
    selectLanguage: 'Обери мову',
    selectCurrency: 'Обери валюту',
    week: 'Тиждень',
    month: 'Місяць',
    allTime: 'Увесь час',
    operationAdded: 'Операцію додано',
    enterValidAmount: 'Введи коректну суму, більшу за нуль.',
    enterTitle: 'Введи назву операції.',
    enterGoalTitle: 'Введи назву цілі.',
    enterTargetAmount: 'Введи коректну цільову суму.',
    goalContributionSuccess: 'Заощадження додано',
    goalContributionError: 'Недостатньо доступних коштів.',
    currencyUAH: 'Гривня (₴)',
    currencyUSD: 'Долар ($)',
    currencyEUR: 'Євро (€)',
    confirm: 'Підтвердити',
    deleteGoal: 'Видалити ціль',
    deleteGoalQuestion: 'Видалити цю фінансову ціль?',
  },
};

type LanguageContextValue = {
  language: AppLanguage;
  currency: AppCurrency;
  changeLanguage: (value: AppLanguage) => Promise<void>;
  changeCurrency: (value: AppCurrency) => Promise<void>;
  refreshData: () => Promise<void>;
};

const LanguageContext = createContext<LanguageContextValue>({
  language: 'ru',
  currency: 'UAH',
  changeLanguage: async () => {},
  changeCurrency: async () => {},
  refreshData: async () => {},
});

function useAppSettings() {
  return useContext(LanguageContext);
}

function useT() {
  const { language } = useAppSettings();

  return useCallback(
    (key: TranslationKey) => translations[language][key],
    [language],
  );
}

function formatMoney(amount: number, currency: AppCurrency) {
  const locale = currency === 'UAH' ? 'uk-UA' : 'en-US';

  try {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency,
      maximumFractionDigits: 2,
    }).format(amount);
  } catch {
    return `${amount.toFixed(2)} ${currency}`;
  }
}

function makeId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function getTransactionDate(date: string) {
  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) {
    return new Date();
  }

  return parsed;
}

function getCategoryName(
  category: string | null | undefined,
  t: (key: TranslationKey) => string,
) {
  const categories: Record<string, TranslationKey> = {
    salary: 'salary',
    food: 'food',
    transport: 'transport',
    shopping: 'shopping',
    entertainment: 'entertainment',
    health: 'health',
    other: 'other',
  };

  if (!category) {
    return t('other');
  }

  return categories[category] ? t(categories[category]) : category;
}

function AppHeader({
  title,
  navigation,
}: {
  title: string;
  navigation?: BottomTabNavigationProp<RootParamList>;
}) {
  const t = useT();

  return (
    <View style={styles.header}>
      <View style={styles.headerTitleContainer}>
        <View style={styles.logo}>
          <Ionicons name="wallet-outline" size={22} color="#FFFFFF" />
        </View>

        <View>
          <Text style={styles.brandName}>MoneyMap</Text>
          <Text style={styles.headerSubtitle}>{title}</Text>
        </View>
      </View>

      <Pressable
        style={styles.headerSettingsButton}
        onPress={() => navigation?.navigate('Settings')}
      >
        <Ionicons name="settings-outline" size={22} color={dark} />
      </Pressable>
    </View>
  );
}

function SectionTitle({
  title,
  right,
}: {
  title: string;
  right?: React.ReactNode;
}) {
  return (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {right}
    </View>
  );
}

function PrimaryButton({
  title,
  onPress,
  icon,
}: {
  title: string;
  onPress: () => void;
  icon?: keyof typeof Ionicons.glyphMap;
}) {
  return (
    <Pressable style={styles.primaryButton} onPress={onPress}>
      {icon ? (
        <Ionicons name={icon} size={19} color="#FFFFFF" />
      ) : null}
      <Text style={styles.primaryButtonText}>{title}</Text>
    </Pressable>
  );
}

function EmptyState({ text }: { text: string }) {
  return (
    <View style={styles.emptyState}>
      <View style={styles.emptyIcon}>
        <Ionicons name="receipt-outline" size={28} color={purple} />
      </View>
      <Text style={styles.emptyText}>{text}</Text>
    </View>
  );
}

function TransactionRow({
  transaction,
  onDelete,
}: {
  transaction: SavedTransaction;
  onDelete: () => void;
}) {
  const { currency } = useAppSettings();
  const t = useT();

  const isIncome = transaction.type === 'income';
  const date = getTransactionDate(transaction.date);

  return (
    <View style={styles.transactionRow}>
      <View
        style={[
          styles.transactionIcon,
          {
            backgroundColor: isIncome ? '#E6F8EF' : '#FFF0F1',
          },
        ]}
      >
        <Ionicons
          name={isIncome ? 'arrow-down-outline' : 'arrow-up-outline'}
          size={20}
          color={isIncome ? green : red}
        />
      </View>

      <View style={styles.transactionInfo}>
        <Text style={styles.transactionTitle} numberOfLines={1}>
          {transaction.title}
        </Text>

        <Text style={styles.transactionMeta}>
          {getCategoryName(transaction.category, t)} ·{' '}
          {date.toLocaleDateString()}
        </Text>
      </View>

      <View style={styles.transactionAmountContainer}>
        <Text
          style={[
            styles.transactionAmount,
            { color: isIncome ? green : dark },
          ]}
        >
          {isIncome ? '+' : '−'}
          {formatMoney(transaction.amount, currency)}
        </Text>

        <Pressable
          hitSlop={8}
          onPress={onDelete}
          style={styles.deleteSmallButton}
        >
          <Ionicons name="trash-outline" size={15} color={muted} />
        </Pressable>
      </View>
    </View>
  );
}

function HomeScreen({
  navigation,
}: {
  navigation: BottomTabNavigationProp<RootParamList, 'Home'>;
}) {
  const t = useT();
  const { currency, refreshData } = useAppSettings();

  const [transactions, setTransactions] = useState<SavedTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [transactionType, setTransactionType] =
    useState<TransactionType>('expense');
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('other');

  const loadTransactions = useCallback(async () => {
    try {
      const data = await getTransactions();
      setTransactions(data);
    } catch (error) {
      console.error('Failed to load transactions:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTransactions();
  }, [loadTransactions]);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      loadTransactions();
    });

    return unsubscribe;
  }, [navigation, loadTransactions]);

  const totalIncome = transactions
    .filter((item) => item.type === 'income')
    .reduce((sum, item) => sum + item.amount, 0);

  const totalExpenses = transactions
    .filter((item) => item.type === 'expense')
    .reduce((sum, item) => sum + item.amount, 0);

  const balance = totalIncome - totalExpenses;

  const recentTransactions = [...transactions]
    .sort(
      (a, b) =>
        getTransactionDate(b.date).getTime() -
        getTransactionDate(a.date).getTime(),
    )
    .slice(0, 5);

  const handleAddTransaction = async () => {
    const parsedAmount = Number(amount.replace(',', '.'));

    if (!title.trim()) {
      Alert.alert(t('enterTitle'));
      return;
    }

    if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
      Alert.alert(t('enterValidAmount'));
      return;
    }

    try {
      await saveTransaction({
        id: makeId(),
        title: title.trim(),
        amount: parsedAmount,
        type: transactionType,
        category,
        date: new Date().toISOString(),
      });

      setTitle('');
      setAmount('');
      setCategory('other');
      setModalVisible(false);

      await loadTransactions();
      await refreshData();

      Alert.alert(t('operationAdded'));
    } catch (error) {
      console.error('Failed to add transaction:', error);
      Alert.alert('Error', 'Не удалось сохранить операцию.');
    }
  };

  const handleDeleteTransaction = (id: string) => {
    Alert.alert(
      t('deleteTransaction'),
      t('deleteTransactionConfirm'),
      [
        { text: t('cancel'), style: 'cancel' },
        {
          text: t('delete'),
          style: 'destructive',
          onPress: async () => {
            try {
              await removeTransaction(id);
              await loadTransactions();
              await refreshData();
            } catch (error) {
              console.error('Failed to delete transaction:', error);
            }
          },
        },
      ],
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={background} />

      <AppHeader title={t('home')} navigation={navigation} />

      <ScrollView
        contentContainerStyle={styles.screenContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.balanceCard}>
          <View style={styles.balanceCardTop}>
            <View>
              <Text style={styles.balanceLabel}>{t('balance')}</Text>
              <Text style={styles.balanceAmount}>
                {formatMoney(balance, currency)}
              </Text>
            </View>

            <View style={styles.balanceIcon}>
              <Ionicons name="wallet" size={27} color="#FFFFFF" />
            </View>
          </View>

          <View style={styles.balanceDivider} />

          <View style={styles.balanceFooter}>
            <View style={styles.balanceFooterItem}>
              <View style={styles.balanceFooterIcon}>
                <Ionicons
                  name="arrow-down"
                  size={16}
                  color="#B9F4D2"
                />
              </View>

              <View>
                <Text style={styles.balanceFooterLabel}>
                  {t('income')}
                </Text>
                <Text style={styles.balanceFooterAmount}>
                  {formatMoney(totalIncome, currency)}
                </Text>
              </View>
            </View>

            <View style={styles.balanceFooterItem}>
              <View style={styles.balanceFooterIcon}>
                <Ionicons
                  name="arrow-up"
                  size={16}
                  color="#FFD3D6"
                />
              </View>

              <View>
                <Text style={styles.balanceFooterLabel}>
                  {t('expenses')}
                </Text>
                <Text style={styles.balanceFooterAmount}>
                  {formatMoney(totalExpenses, currency)}
                </Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.quickActions}>
          <Pressable
            style={styles.quickAction}
            onPress={() => {
              setTransactionType('income');
              setModalVisible(true);
            }}
          >
            <View style={[styles.quickActionIcon, styles.incomeActionIcon]}>
              <Ionicons name="add-circle-outline" size={23} color={green} />
            </View>
            <Text style={styles.quickActionText}>{t('incomeType')}</Text>
          </Pressable>

          <Pressable
            style={styles.quickAction}
            onPress={() => {
              setTransactionType('expense');
              setModalVisible(true);
            }}
          >
            <View style={[styles.quickActionIcon, styles.expenseActionIcon]}>
              <Ionicons name="remove-circle-outline" size={23} color={red} />
            </View>
            <Text style={styles.quickActionText}>{t('expenseType')}</Text>
          </Pressable>

          <Pressable
            style={styles.quickAction}
            onPress={() => navigation.navigate('Goals')}
          >
            <View style={[styles.quickActionIcon, styles.goalActionIcon]}>
              <Ionicons name="flag-outline" size={23} color={purple} />
            </View>
            <Text style={styles.quickActionText}>{t('goals')}</Text>
          </Pressable>
        </View>

        <SectionTitle
          title={t('recentTransactions')}
          right={
            <Pressable onPress={() => navigation.navigate('Analytics')}>
              <Text style={styles.linkText}>{t('allTransactions')}</Text>
            </Pressable>
          }
        />

        <View style={styles.card}>
          {loading ? (
            <ActivityIndicator color={purple} style={styles.loader} />
          ) : recentTransactions.length === 0 ? (
            <EmptyState text={t('noTransactions')} />
          ) : (
            recentTransactions.map((transaction) => (
              <TransactionRow
                key={transaction.id}
                transaction={transaction}
                onDelete={() => handleDeleteTransaction(transaction.id)}
              />
            ))
          )}
        </View>

        <PrimaryButton
          title={t('addTransaction')}
          icon="add"
          onPress={() => {
            setTransactionType('expense');
            setModalVisible(true);
          }}
        />
      </ScrollView>

      <TransactionModal
        visible={modalVisible}
        transactionType={transactionType}
        setTransactionType={setTransactionType}
        title={title}
        setTitle={setTitle}
        amount={amount}
        setAmount={setAmount}
        category={category}
        setCategory={setCategory}
        onSave={handleAddTransaction}
        onClose={() => setModalVisible(false)}
      />
    </SafeAreaView>
  );
}

function TransactionModal({
  visible,
  transactionType,
  setTransactionType,
  title,
  setTitle,
  amount,
  setAmount,
  category,
  setCategory,
  onSave,
  onClose,
}: {
  visible: boolean;
  transactionType: TransactionType;
  setTransactionType: (value: TransactionType) => void;
  title: string;
  setTitle: (value: string) => void;
  amount: string;
  setAmount: (value: string) => void;
  category: string;
  setCategory: (value: string) => void;
  onSave: () => void;
  onClose: () => void;
}) {
  const t = useT();

  const categories = [
    { value: 'salary', label: t('salary') },
    { value: 'food', label: t('food') },
    { value: 'transport', label: t('transport') },
    { value: 'shopping', label: t('shopping') },
    { value: 'entertainment', label: t('entertainment') },
    { value: 'health', label: t('health') },
    { value: 'other', label: t('other') },
  ];

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalCard}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>{t('addTransaction')}</Text>
            <Pressable onPress={onClose} hitSlop={10}>
              <Ionicons name="close" size={25} color={dark} />
            </Pressable>
          </View>

          <View style={styles.segmentedControl}>
            <Pressable
              style={[
                styles.segment,
                transactionType === 'expense' && styles.segmentActiveExpense,
              ]}
              onPress={() => setTransactionType('expense')}
            >
              <Text
                style={[
                  styles.segmentText,
                  transactionType === 'expense' && styles.segmentTextActive,
                ]}
              >
                {t('expenseType')}
              </Text>
            </Pressable>

            <Pressable
              style={[
                styles.segment,
                transactionType === 'income' && styles.segmentActiveIncome,
              ]}
              onPress={() => setTransactionType('income')}
            >
              <Text
                style={[
                  styles.segmentText,
                  transactionType === 'income' && styles.segmentTextActive,
                ]}
              >
                {t('incomeType')}
              </Text>
            </Pressable>
          </View>

          <Text style={styles.inputLabel}>{t('transactionTitle')}</Text>
          <TextInput
            style={styles.input}
            value={title}
            onChangeText={setTitle}
            placeholder={t('transactionTitle')}
            placeholderTextColor="#AAA7B5"
          />

          <Text style={styles.inputLabel}>{t('amount')}</Text>
          <TextInput
            style={styles.input}
            value={amount}
            onChangeText={setAmount}
            placeholder="0.00"
            keyboardType="decimal-pad"
            placeholderTextColor="#AAA7B5"
          />

          <Text style={styles.inputLabel}>{t('category')}</Text>

          <View style={styles.categoryGrid}>
            {categories.map((item) => (
              <Pressable
                key={item.value}
                style={[
                  styles.categoryChip,
                  category === item.value && styles.categoryChipActive,
                ]}
                onPress={() => setCategory(item.value)}
              >
                <Text
                  style={[
                    styles.categoryChipText,
                    category === item.value && styles.categoryChipTextActive,
                  ]}
                >
                  {item.label}
                </Text>
              </Pressable>
            ))}
          </View>

          <PrimaryButton title={t('save')} onPress={onSave} />

          <Pressable style={styles.cancelButton} onPress={onClose}>
            <Text style={styles.cancelButtonText}>{t('cancel')}</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

function AnalyticsScreen({
  navigation,
}: {
  navigation: BottomTabNavigationProp<RootParamList, 'Analytics'>;
}) {
  const t = useT();
  const { currency } = useAppSettings();

  const [transactions, setTransactions] = useState<SavedTransaction[]>([]);
  const [period, setPeriod] = useState<'week' | 'month' | 'allTime'>('week');
  const [loading, setLoading] = useState(true);

  const loadTransactions = useCallback(async () => {
    try {
      setTransactions(await getTransactions());
    } catch (error) {
      console.error('Failed to load analytics:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTransactions();
  }, [loadTransactions]);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', loadTransactions);
    return unsubscribe;
  }, [navigation, loadTransactions]);

  const now = new Date();

  const filteredTransactions = transactions.filter((item) => {
    const date = getTransactionDate(item.date);

    if (period === 'week') {
      return now.getTime() - date.getTime() <= 7 * 24 * 60 * 60 * 1000;
    }

    if (period === 'month') {
      return (
        date.getMonth() === now.getMonth() &&
        date.getFullYear() === now.getFullYear()
      );
    }

    return true;
  });

  const income = filteredTransactions
    .filter((item) => item.type === 'income')
    .reduce((sum, item) => sum + item.amount, 0);

  const expenses = filteredTransactions
    .filter((item) => item.type === 'expense')
    .reduce((sum, item) => sum + item.amount, 0);

  const expenseByCategory: Record<string, number> = {};

  filteredTransactions
    .filter((item) => item.type === 'expense')
    .forEach((item) => {
      const key = item.category || 'other';
      expenseByCategory[key] =
        (expenseByCategory[key] || 0) + item.amount;
    });

  const categoryItems = Object.entries(expenseByCategory).sort(
    (a, b) => b[1] - a[1],
  );

  const maxCategoryAmount = Math.max(
    1,
    ...categoryItems.map((item) => item[1]),
  );

  const periodOptions: {
    value: 'week' | 'month' | 'allTime';
    label: string;
  }[] = [
    { value: 'week', label: t('week') },
    { value: 'month', label: t('month') },
    { value: 'allTime', label: t('allTime') },
  ];

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={background} />

      <AppHeader title={t('analytics')} navigation={navigation} />

      <ScrollView
        contentContainerStyle={styles.screenContent}
        showsVerticalScrollIndicator={false}
      >
        <SectionTitle title={t('weeklyOverview')} />

        <View style={styles.periodSelector}>
          {periodOptions.map((option) => (
            <Pressable
              key={option.value}
              style={[
                styles.periodOption,
                period === option.value && styles.periodOptionActive,
              ]}
              onPress={() => setPeriod(option.value)}
            >
              <Text
                style={[
                  styles.periodOptionText,
                  period === option.value && styles.periodOptionTextActive,
                ]}
              >
                {option.label}
              </Text>
            </Pressable>
          ))}
        </View>

        <View style={styles.statCardsRow}>
          <View style={[styles.statCard, { borderColor: '#D5F2E2' }]}>
            <View style={[styles.statIcon, { backgroundColor: '#E6F8EF' }]}>
              <Ionicons name="trending-up" size={20} color={green} />
            </View>
            <Text style={styles.statLabel}>{t('totalIncome')}</Text>
            <Text style={[styles.statValue, { color: green }]}>
              {formatMoney(income, currency)}
            </Text>
          </View>

          <View style={[styles.statCard, { borderColor: '#FFE0E2' }]}>
            <View style={[styles.statIcon, { backgroundColor: '#FFF0F1' }]}>
              <Ionicons name="trending-down" size={20} color={red} />
            </View>
            <Text style={styles.statLabel}>{t('totalExpenses')}</Text>
            <Text style={[styles.statValue, { color: red }]}>
              {formatMoney(expenses, currency)}
            </Text>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>{t('balanceDynamics')}</Text>

          <View style={styles.dynamicsRow}>
            <View style={styles.dynamicsItem}>
              <Text style={styles.dynamicsLabel}>{t('income')}</Text>
              <View style={styles.dynamicsTrack}>
                <View
                  style={[
                    styles.dynamicsBar,
                    {
                      width: `${
                        income + expenses > 0
                          ? (income / (income + expenses)) * 100
                          : 0
                      }%`,
                      backgroundColor: green,
                    },
                  ]}
                />
              </View>
              <Text style={styles.dynamicsAmount}>
                {formatMoney(income, currency)}
              </Text>
            </View>

            <View style={styles.dynamicsItem}>
              <Text style={styles.dynamicsLabel}>{t('expenses')}</Text>
              <View style={styles.dynamicsTrack}>
                <View
                  style={[
                    styles.dynamicsBar,
                    {
                      width: `${
                        income + expenses > 0
                          ? (expenses / (income + expenses)) * 100
                          : 0
                      }%`,
                      backgroundColor: red,
                    },
                  ]}
                />
              </View>
              <Text style={styles.dynamicsAmount}>
                {formatMoney(expenses, currency)}
              </Text>
            </View>
          </View>

          <View style={styles.netBalanceRow}>
            <Text style={styles.netBalanceLabel}>{t('balance')}</Text>
            <Text
              style={[
                styles.netBalanceValue,
                { color: income - expenses >= 0 ? green : red },
              ]}
            >
              {formatMoney(income - expenses, currency)}
            </Text>
          </View>
        </View>

        <SectionTitle title={t('expenses')} />

        <View style={styles.card}>
          {loading ? (
            <ActivityIndicator color={purple} style={styles.loader} />
          ) : categoryItems.length === 0 ? (
            <EmptyState text={t('noTransactions')} />
          ) : (
            categoryItems.map(([categoryName, value]) => (
              <View key={categoryName} style={styles.categoryStat}>
                <View style={styles.categoryStatTop}>
                  <Text style={styles.categoryStatName}>
                    {getCategoryName(categoryName, t)}
                  </Text>
                  <Text style={styles.categoryStatAmount}>
                    {formatMoney(value, currency)}
                  </Text>
                </View>

                <View style={styles.dynamicsTrack}>
                  <View
                    style={[
                      styles.dynamicsBar,
                      {
                        width: `${(value / maxCategoryAmount) * 100}%`,
                        backgroundColor: purple,
                      },
                    ]}
                  />
                </View>
              </View>
            ))
          )}
        </View>

        <SectionTitle title={t('allTransactions')} />

        <View style={styles.card}>
          {filteredTransactions.length === 0 ? (
            <EmptyState text={t('noTransactions')} />
          ) : (
            [...filteredTransactions]
              .sort(
                (a, b) =>
                  getTransactionDate(b.date).getTime() -
                  getTransactionDate(a.date).getTime(),
              )
              .map((transaction) => (
                <TransactionRow
                  key={transaction.id}
                  transaction={transaction}
                  onDelete={async () => {
                    Alert.alert(
                      t('deleteTransaction'),
                      t('deleteTransactionConfirm'),
                      [
                        { text: t('cancel'), style: 'cancel' },
                        {
                          text: t('delete'),
                          style: 'destructive',
                          onPress: async () => {
                            await removeTransaction(transaction.id);
                            await loadTransactions();
                          },
                        },
                      ],
                    );
                  }}
                />
              ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function GoalsScreen({
  navigation,
}: {
  navigation: BottomTabNavigationProp<RootParamList, 'Goals'>;
}) {
  const t = useT();
  const { currency, refreshData } = useAppSettings();

  const [goals, setGoals] = useState<SavedGoal[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [goalTitle, setGoalTitle] = useState('');
  const [targetAmount, setTargetAmount] = useState('');

  const loadGoals = useCallback(async () => {
    try {
      setGoals(await getGoals());
    } catch (error) {
      console.error('Failed to load goals:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadGoals();
  }, [loadGoals]);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', loadGoals);
    return unsubscribe;
  }, [navigation, loadGoals]);

  const handleCreateGoal = async () => {
    const parsedTarget = Number(targetAmount.replace(',', '.'));

    if (!goalTitle.trim()) {
      Alert.alert(t('enterGoalTitle'));
      return;
    }

    if (!Number.isFinite(parsedTarget) || parsedTarget <= 0) {
      Alert.alert(t('enterTargetAmount'));
      return;
    }

    try {
      await addGoal({
        id: makeId(),
        title: goalTitle.trim(),
        targetAmount: parsedTarget,
        savedAmount: 0,
        createdAt: new Date().toISOString(),
      });

      setGoalTitle('');
      setTargetAmount('');
      setModalVisible(false);
      await loadGoals();
    } catch (error) {
      console.error('Failed to create goal:', error);
    }
  };

  const handleAddSavings = (goal: SavedGoal) => {
    Alert.prompt?.(
      t('addSavings'),
      t('contributionAmount'),
      async (value) => {
        const parsedAmount = Number((value || '').replace(',', '.'));

        if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
          Alert.alert(t('enterValidAmount'));
          return;
        }

        try {
          await contributeToGoal(goal.id, parsedAmount);
          await loadGoals();
          await refreshData();
          Alert.alert(t('goalContributionSuccess'));
        } catch (error) {
          console.error('Failed to contribute to goal:', error);
          Alert.alert(t('goalContributionError'));
        }
      },
      'plain-text',
      '',
      'decimal-pad',
    );

    if (!Alert.prompt) {
      Alert.alert(
        t('addSavings'),
        t('contributionAmount'),
        [{ text: t('cancel'), style: 'cancel' }],
      );
    }
  };

  const handleDeleteGoal = (goal: SavedGoal) => {
  Alert.alert(
    t('deleteGoal'),
    t('deleteGoalQuestion'),
    [
      {
        text: t('cancel'),
        style: 'cancel',
      },
      {
        text: t('delete'),
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteGoalAndReturnSavings(goal.id);
            await loadGoals();
            await refreshData();

            Alert.alert(t('goalDeleted'));
          } catch (error) {
            console.error('Failed to delete goal:', error);
            Alert.alert(
              'Error',
              'Не удалось удалить цель. Попробуй ещё раз.',
            );
          }
        },
      },
    ],
  );
};

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={background} />

      <AppHeader title={t('goals')} navigation={navigation} />

      <ScrollView
        contentContainerStyle={styles.screenContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.goalsIntroCard}>
          <View style={styles.goalsIntroIcon}>
            <Ionicons name="flag" size={27} color="#FFFFFF" />
          </View>
          <Text style={styles.goalsIntroTitle}>{t('financialGoals')}</Text>
          <Text style={styles.goalsIntroText}>
            {t('savedAmount')} — {goals.length}
          </Text>
        </View>

        <PrimaryButton
          title={t('createGoal')}
          icon="add"
          onPress={() => setModalVisible(true)}
        />

        <SectionTitle title={t('financialGoals')} />

        {loading ? (
          <ActivityIndicator color={purple} style={styles.loader} />
        ) : goals.length === 0 ? (
          <View style={styles.card}>
            <EmptyState text={t('noGoals')} />
          </View>
        ) : (
          goals.map((goal) => {
            const progress =
              goal.targetAmount > 0
                ? Math.min(goal.savedAmount / goal.targetAmount, 1)
                : 0;

            return (
              <View key={goal.id} style={styles.goalCard}>
                <View style={styles.goalCardHeader}>
                  <View style={styles.goalIcon}>
                    <Ionicons name="flag-outline" size={22} color={purple} />
                  </View>

                  <View style={styles.goalTitleContainer}>
                    <Text style={styles.goalTitle}>{goal.title}</Text>
                    <Text style={styles.goalProgressText}>
                      {t('goalProgress')}: {Math.round(progress * 100)}%
                    </Text>
                  </View>

                  <Pressable
                    hitSlop={10}
                    onPress={() => handleDeleteGoal(goal)}
                  >
                    <Ionicons name="trash-outline" size={19} color={muted} />
                  </Pressable>
                </View>

                <View style={styles.goalProgressTrack}>
                  <View
                    style={[
                      styles.goalProgressFill,
                      { width: `${progress * 100}%` },
                    ]}
                  />
                </View>

                <View style={styles.goalAmounts}>
                  <View>
                    <Text style={styles.goalAmountLabel}>
                      {t('savedAmount')}
                    </Text>
                    <Text style={styles.goalAmountValue}>
                      {formatMoney(goal.savedAmount, currency)}
                    </Text>
                  </View>

                  <View style={styles.goalTargetContainer}>
                    <Text style={styles.goalAmountLabel}>
                      {t('targetAmount')}
                    </Text>
                    <Text style={styles.goalAmountValue}>
                      {formatMoney(goal.targetAmount, currency)}
                    </Text>
                  </View>
                </View>

                <Pressable
                  style={styles.goalContributeButton}
                  onPress={() => handleAddSavings(goal)}
                >
                  <Ionicons name="add-circle-outline" size={18} color={purple} />
                  <Text style={styles.goalContributeText}>
                    {t('addSavings')}
                  </Text>
                </Pressable>
              </View>
            );
          })
        )}
      </ScrollView>

      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{t('createGoal')}</Text>
              <Pressable
                onPress={() => setModalVisible(false)}
                hitSlop={10}
              >
                <Ionicons name="close" size={25} color={dark} />
              </Pressable>
            </View>

            <Text style={styles.inputLabel}>{t('goalTitle')}</Text>
            <TextInput
              style={styles.input}
              value={goalTitle}
              onChangeText={setGoalTitle}
              placeholder={t('goalTitle')}
              placeholderTextColor="#AAA7B5"
            />

            <Text style={styles.inputLabel}>{t('targetAmount')}</Text>
            <TextInput
              style={styles.input}
              value={targetAmount}
              onChangeText={setTargetAmount}
              placeholder="0.00"
              keyboardType="decimal-pad"
              placeholderTextColor="#AAA7B5"
            />

            <PrimaryButton title={t('createGoal')} onPress={handleCreateGoal} />

            <Pressable
              style={styles.cancelButton}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.cancelButtonText}>{t('cancel')}</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

function SettingsScreen({
  navigation,
}: {
  navigation: BottomTabNavigationProp<RootParamList, 'Settings'>;
}) {
  const t = useT();
  const {
    language,
    currency,
    changeLanguage,
    changeCurrency,
    refreshData,
  } = useAppSettings();

  const handleReset = () => {
    Alert.alert(
      t('resetConfirmTitle'),
      t('resetConfirmMessage'),
      [
        { text: t('cancel'), style: 'cancel' },
        {
          text: t('resetConfirmButton'),
          style: 'destructive',
          onPress: async () => {
            try {
              await resetAllData();

              await setAppLanguage(language);
              await setAppCurrency(currency);

              await refreshData();

              Alert.alert(t('resetSuccess'), t('resetSuccessMessage'));
              navigation.navigate('Home');
            } catch (error) {
              console.error('Failed to reset data:', error);
              Alert.alert('Error', 'Не удалось сбросить данные.');
            }
          },
        },
      ],
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={background} />

      <AppHeader title={t('settings')} navigation={navigation} />

      <ScrollView
        contentContainerStyle={styles.screenContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.settingsWelcome}>
          <View style={styles.settingsWelcomeIcon}>
            <Ionicons name="settings-outline" size={28} color="#FFFFFF" />
          </View>
          <Text style={styles.settingsWelcomeTitle}>MoneyMap</Text>
          <Text style={styles.settingsWelcomeDescription}>
            {t('settingsDescription')}
          </Text>
        </View>

        <Text style={styles.settingsSectionLabel}>{t('appearance')}</Text>

        <View style={styles.settingsCard}>
          <View style={styles.settingsItemHeading}>
            <View style={styles.settingsItemIcon}>
              <Ionicons name="language-outline" size={21} color={purple} />
            </View>
            <View style={styles.settingsItemTextContainer}>
              <Text style={styles.settingsItemTitle}>{t('language')}</Text>
              <Text style={styles.settingsItemDescription}>
                {t('selectLanguage')}
              </Text>
            </View>
          </View>

          <View style={styles.settingsOptions}>
            <Pressable
              style={[
                styles.settingsOption,
                language === 'ru' && styles.settingsOptionActive,
              ]}
              onPress={() => changeLanguage('ru')}
            >
              <Text
                style={[
                  styles.settingsOptionText,
                  language === 'ru' && styles.settingsOptionTextActive,
                ]}
              >
                {t('russian')}
              </Text>
              {language === 'ru' ? (
                <Ionicons name="checkmark-circle" size={18} color={purple} />
              ) : null}
            </Pressable>

            <Pressable
              style={[
                styles.settingsOption,
                language === 'uk' && styles.settingsOptionActive,
              ]}
              onPress={() => changeLanguage('uk')}
            >
              <Text
                style={[
                  styles.settingsOptionText,
                  language === 'uk' && styles.settingsOptionTextActive,
                ]}
              >
                {t('ukrainian')}
              </Text>
              {language === 'uk' ? (
                <Ionicons name="checkmark-circle" size={18} color={purple} />
              ) : null}
            </Pressable>
          </View>

          <View style={styles.settingsDivider} />

          <View style={styles.settingsItemHeading}>
            <View style={styles.settingsItemIcon}>
              <Ionicons name="cash-outline" size={21} color={purple} />
            </View>
            <View style={styles.settingsItemTextContainer}>
              <Text style={styles.settingsItemTitle}>{t('currency')}</Text>
              <Text style={styles.settingsItemDescription}>
                {t('selectCurrency')}
              </Text>
            </View>
          </View>

          <View style={styles.currencyOptions}>
            {(
              [
                ['UAH', t('currencyUAH')],
                ['USD', t('currencyUSD')],
                ['EUR', t('currencyEUR')],
              ] as [AppCurrency, string][]
            ).map(([value, label]) => (
              <Pressable
                key={value}
                style={[
                  styles.currencyOption,
                  currency === value && styles.settingsOptionActive,
                ]}
                onPress={() => changeCurrency(value)}
              >
                <Text
                  style={[
                    styles.settingsOptionText,
                    currency === value && styles.settingsOptionTextActive,
                  ]}
                >
                  {label}
                </Text>
                {currency === value ? (
                  <Ionicons name="checkmark-circle" size={18} color={purple} />
                ) : null}
              </Pressable>
            ))}
          </View>

          <Text style={styles.currencyNote}>{t('currencyNote')}</Text>
        </View>

        <Text style={styles.settingsSectionLabel}>{t('dataManagement')}</Text>

        <View style={styles.resetCard}>
          <View style={styles.resetIcon}>
            <Ionicons name="refresh-outline" size={23} color={red} />
          </View>

          <Text style={styles.resetTitle}>{t('resetData')}</Text>
          <Text style={styles.resetDescription}>{t('resetDescription')}</Text>

          <Pressable style={styles.resetButton} onPress={handleReset}>
            <Ionicons name="trash-outline" size={18} color="#FFFFFF" />
            <Text style={styles.resetButtonText}>{t('resetConfirmButton')}</Text>
          </Pressable>
        </View>

        <Text style={styles.appVersion}>MoneyMap · 1.0.0</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

function AppContent() {
  const [language, setLanguage] = useState<AppLanguage>('ru');
  const [currency, setCurrency] = useState<AppCurrency>('UAH');
  const [ready, setReady] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    let mounted = true;

    async function prepareApp() {
      try {
        await initDatabase();

        const savedLanguage = await getAppLanguage();
        const savedCurrency = await getAppCurrency();

        if (mounted) {
          if (savedLanguage === 'ru' || savedLanguage === 'uk') {
            setLanguage(savedLanguage);
          }

          if (
            savedCurrency === 'UAH' ||
            savedCurrency === 'USD' ||
            savedCurrency === 'EUR'
          ) {
            setCurrency(savedCurrency);
          }
        }
      } catch (error) {
        console.error('Failed to initialize MoneyMap:', error);
      } finally {
        if (mounted) {
          setReady(true);
        }
      }
    }

    prepareApp();

    return () => {
      mounted = false;
    };
  }, []);

  const changeLanguage = useCallback(async (value: AppLanguage) => {
    try {
      await setAppLanguage(value);
      setLanguage(value);
    } catch (error) {
      console.error('Failed to save language:', error);
    }
  }, []);

  const changeCurrency = useCallback(async (value: AppCurrency) => {
    try {
      await setAppCurrency(value);
      setCurrency(value);
    } catch (error) {
      console.error('Failed to save currency:', error);
    }
  }, []);

  const refreshData = useCallback(async () => {
    setRefreshKey((current) => current + 1);
  }, []);

  const contextValue: LanguageContextValue = {
    language,
    currency,
    changeLanguage,
    changeCurrency,
    refreshData,
  };

  if (!ready) {
    return (
      <View style={styles.loadingScreen}>
        <View style={styles.logo}>
          <Ionicons name="wallet-outline" size={25} color="#FFFFFF" />
        </View>
        <Text style={styles.loadingTitle}>MoneyMap</Text>
        <ActivityIndicator color={purple} size="large" />
      </View>
    );
  }

  return (
    <LanguageContext.Provider value={contextValue}>
      <NavigationContainer key={refreshKey}>
        <Tab.Navigator
          screenOptions={({ route }) => ({
            headerShown: false,
            tabBarActiveTintColor: purple,
            tabBarInactiveTintColor: '#A4A1AF',
            tabBarStyle: styles.tabBar,
            tabBarLabelStyle: styles.tabBarLabel,
            tabBarIcon: ({ color, size, focused }) => {
              let iconName: keyof typeof Ionicons.glyphMap;

              if (route.name === 'Home') {
                iconName = focused ? 'home' : 'home-outline';
              } else if (route.name === 'Analytics') {
                iconName = focused ? 'stats-chart' : 'stats-chart-outline';
              } else if (route.name === 'Goals') {
                iconName = focused ? 'flag' : 'flag-outline';
              } else {
                iconName = focused ? 'settings' : 'settings-outline';
              }

              return <Ionicons name={iconName} size={size} color={color} />;
            },
          })}
        >
          <Tab.Screen
            name="Home"
            component={HomeScreen}
            options={{ tabBarLabel: translations[language].home }}
          />

          <Tab.Screen
            name="Analytics"
            component={AnalyticsScreen}
            options={{ tabBarLabel: translations[language].analytics }}
          />

          <Tab.Screen
            name="Goals"
            component={GoalsScreen}
            options={{ tabBarLabel: translations[language].goals }}
          />

          <Tab.Screen
            name="Settings"
            component={SettingsScreen}
            options={{ tabBarLabel: translations[language].settings }}
          />
        </Tab.Navigator>
      </NavigationContainer>
    </LanguageContext.Provider>
  );
}

export default function App() {
  return <AppContent />;
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: background,
  },

  loadingScreen: {
    flex: 1,
    backgroundColor: background,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 14,
  },

  loadingTitle: {
    fontSize: 23,
    fontWeight: '800',
    color: dark,
    marginBottom: 8,
  },

  header: {
    minHeight: 70,
    paddingHorizontal: 20,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: background,
  },

  headerTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 11,
  },

  logo: {
    width: 43,
    height: 43,
    borderRadius: 15,
    backgroundColor: purple,
    alignItems: 'center',
    justifyContent: 'center',
  },

  brandName: {
    fontSize: 18,
    fontWeight: '800',
    color: dark,
  },

  headerSubtitle: {
    fontSize: 12,
    color: muted,
    marginTop: 2,
  },

  headerSettingsButton: {
    width: 43,
    height: 43,
    borderRadius: 15,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#EEEAF7',
  },

  screenContent: {
    paddingHorizontal: 20,
    paddingBottom: 30,
  },

  balanceCard: {
    backgroundColor: purple,
    borderRadius: 25,
    padding: 22,
    marginBottom: 18,
    overflow: 'hidden',
  },

  balanceCardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  balanceLabel: {
    color: '#E5DEFF',
    fontSize: 13,
    marginBottom: 9,
  },

  balanceAmount: {
    fontSize: 29,
    fontWeight: '800',
    color: '#FFFFFF',
  },

  balanceIcon: {
    width: 52,
    height: 52,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.17)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  balanceDivider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.22)',
    marginVertical: 20,
  },

  balanceFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },

  balanceFooterItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
    flex: 1,
  },

  balanceFooterIcon: {
    width: 31,
    height: 31,
    borderRadius: 11,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  balanceFooterLabel: {
    color: '#E5DEFF',
    fontSize: 12,
    marginBottom: 4,
  },

  balanceFooterAmount: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },

  quickActions: {
    flexDirection: 'row',
    gap: 11,
    marginBottom: 25,
  },

  quickAction: {
    flex: 1,
    backgroundColor: cardBackground,
    borderRadius: 18,
    paddingVertical: 15,
    paddingHorizontal: 5,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#EFEDF5',
  },

  quickActionIcon: {
    width: 44,
    height: 44,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },

  incomeActionIcon: {
    backgroundColor: '#E6F8EF',
  },

  expenseActionIcon: {
    backgroundColor: '#FFF0F1',
  },

  goalActionIcon: {
    backgroundColor: '#F0EBFF',
  },

  quickActionText: {
    color: dark,
    fontSize: 12,
    fontWeight: '600',
  },

  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 7,
    marginBottom: 13,
  },

  sectionTitle: {
    color: dark,
    fontSize: 18,
    fontWeight: '800',
  },

  linkText: {
    color: purple,
    fontSize: 12,
    fontWeight: '700',
  },

  card: {
    backgroundColor: cardBackground,
    borderRadius: 21,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#EFEDF5',
  },

  transactionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F2F0F6',
    gap: 11,
  },

  transactionIcon: {
    width: 43,
    height: 43,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },

  transactionInfo: {
    flex: 1,
    minWidth: 0,
  },

  transactionTitle: {
    color: dark,
    fontSize: 14,
    fontWeight: '700',
  },

  transactionMeta: {
    color: muted,
    fontSize: 11,
    marginTop: 5,
  },

  transactionAmountContainer: {
    alignItems: 'flex-end',
    gap: 6,
  },

  transactionAmount: {
    fontSize: 12,
    fontWeight: '800',
  },

  deleteSmallButton: {
    padding: 2,
  },

  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 28,
  },

  emptyIcon: {
    width: 57,
    height: 57,
    borderRadius: 20,
    backgroundColor: '#F0EBFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },

  emptyText: {
    color: muted,
    fontSize: 13,
    textAlign: 'center',
  },

  loader: {
    marginVertical: 25,
  },

  primaryButton: {
    minHeight: 53,
    borderRadius: 17,
    backgroundColor: purple,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 9,
    paddingHorizontal: 18,
    marginBottom: 20,
  },

  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(23,20,36,0.42)',
    justifyContent: 'flex-end',
  },

  modalCard: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 27,
    borderTopRightRadius: 27,
    padding: 22,
    paddingBottom: 28,
  },

  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 21,
  },

  modalTitle: {
    color: dark,
    fontSize: 21,
    fontWeight: '800',
  },

  segmentedControl: {
    flexDirection: 'row',
    backgroundColor: '#F4F2F9',
    borderRadius: 14,
    padding: 4,
    marginBottom: 20,
  },

  segment: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 11,
  },

  segmentActiveExpense: {
    backgroundColor: '#FFE8EA',
  },

  segmentActiveIncome: {
    backgroundColor: '#DFF7E9',
  },

  segmentText: {
    color: muted,
    fontSize: 14,
    fontWeight: '700',
  },

  segmentTextActive: {
    color: dark,
  },

  inputLabel: {
    color: dark,
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 8,
  },

  input: {
    height: 50,
    backgroundColor: '#F8F7FB',
    borderWidth: 1,
    borderColor: '#EBE8F2',
    borderRadius: 14,
    paddingHorizontal: 14,
    color: dark,
    fontSize: 14,
    marginBottom: 17,
  },

  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 21,
  },

  categoryChip: {
    borderWidth: 1,
    borderColor: '#E9E6F0',
    borderRadius: 12,
    paddingVertical: 9,
    paddingHorizontal: 12,
    backgroundColor: '#FFFFFF',
  },

  categoryChipActive: {
    backgroundColor: '#F0EBFF',
    borderColor: purple,
  },

  categoryChipText: {
    fontSize: 12,
    color: muted,
    fontWeight: '600',
  },

  categoryChipTextActive: {
    color: purple,
  },

  cancelButton: {
    alignItems: 'center',
    paddingVertical: 11,
  },

  cancelButtonText: {
    color: muted,
    fontSize: 14,
    fontWeight: '700',
  },

  periodSelector: {
    flexDirection: 'row',
    backgroundColor: '#EBE8F4',
    borderRadius: 14,
    padding: 4,
    marginBottom: 17,
  },

  periodOption: {
    flex: 1,
    paddingVertical: 11,
    alignItems: 'center',
    borderRadius: 11,
  },

  periodOptionActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000000',
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },

  periodOptionText: {
    color: muted,
    fontSize: 12,
    fontWeight: '700',
  },

  periodOptionTextActive: {
    color: purple,
  },

  statCardsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },

  statCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 19,
    borderWidth: 1,
    padding: 15,
  },

  statIcon: {
    width: 39,
    height: 39,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 13,
  },

  statLabel: {
    color: muted,
    fontSize: 11,
    marginBottom: 7,
  },

  statValue: {
    fontSize: 15,
    fontWeight: '800',
  },

  cardTitle: {
    color: dark,
    fontSize: 16,
    fontWeight: '800',
    marginVertical: 10,
  },

  dynamicsRow: {
    gap: 18,
    paddingVertical: 12,
  },

  dynamicsItem: {
    gap: 8,
  },

  dynamicsLabel: {
    color: muted,
    fontSize: 12,
  },

  dynamicsTrack: {
    height: 8,
    backgroundColor: '#F0EEF5',
    borderRadius: 20,
    overflow: 'hidden',
  },

  dynamicsBar: {
    height: '100%',
    borderRadius: 20,
  },

  dynamicsAmount: {
    color: dark,
    fontSize: 12,
    fontWeight: '700',
  },

  netBalanceRow: {
    borderTopWidth: 1,
    borderTopColor: '#F0EEF5',
    paddingTop: 15,
    paddingBottom: 9,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  netBalanceLabel: {
    color: muted,
    fontSize: 13,
  },

  netBalanceValue: {
    fontSize: 16,
    fontWeight: '800',
  },

  categoryStat: {
    paddingVertical: 12,
    gap: 9,
  },

  categoryStatTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  categoryStatName: {
    color: dark,
    fontSize: 13,
    fontWeight: '600',
  },

  categoryStatAmount: {
    color: dark,
    fontSize: 12,
    fontWeight: '800',
  },

  goalsIntroCard: {
    backgroundColor: purple,
    borderRadius: 23,
    padding: 22,
    marginBottom: 18,
  },

  goalsIntroIcon: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 15,
  },

  goalsIntroTitle: {
    color: '#FFFFFF',
    fontSize: 21,
    fontWeight: '800',
  },

  goalsIntroText: {
    color: '#E5DEFF',
    fontSize: 13,
    marginTop: 7,
  },

  goalCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 21,
    padding: 17,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#EFEDF5',
  },

  goalCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 11,
    marginBottom: 17,
  },

  goalIcon: {
    width: 44,
    height: 44,
    borderRadius: 15,
    backgroundColor: '#F0EBFF',
    alignItems: 'center',
    justifyContent: 'center',
  },

  goalTitleContainer: {
    flex: 1,
  },

  goalTitle: {
    color: dark,
    fontSize: 15,
    fontWeight: '800',
  },

  goalProgressText: {
    color: muted,
    fontSize: 11,
    marginTop: 5,
  },

  goalProgressTrack: {
    height: 9,
    backgroundColor: '#F0EEF5',
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 16,
  },

  goalProgressFill: {
    height: '100%',
    backgroundColor: purple,
    borderRadius: 20,
  },

  goalAmounts: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 17,
  },

  goalTargetContainer: {
    alignItems: 'flex-end',
  },

  goalAmountLabel: {
    color: muted,
    fontSize: 11,
    marginBottom: 5,
  },

  goalAmountValue: {
    color: dark,
    fontSize: 14,
    fontWeight: '800',
  },

  goalContributeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: 13,
    backgroundColor: '#F3EFFF',
  },

  goalContributeText: {
    color: purple,
    fontSize: 13,
    fontWeight: '800',
  },

  settingsWelcome: {
    backgroundColor: purple,
    borderRadius: 23,
    padding: 22,
    alignItems: 'flex-start',
    marginBottom: 24,
  },

  settingsWelcomeIcon: {
    width: 49,
    height: 49,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },

  settingsWelcomeTitle: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '800',
  },

  settingsWelcomeDescription: {
    color: '#E5DEFF',
    fontSize: 13,
    marginTop: 7,
  },

  settingsSectionLabel: {
    color: muted,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1,
    marginBottom: 10,
    marginLeft: 3,
  },

  settingsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 21,
    padding: 17,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#EFEDF5',
  },

  settingsItemHeading: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 15,
  },

  settingsItemIcon: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: '#F0EBFF',
    alignItems: 'center',
    justifyContent: 'center',
  },

  settingsItemTextContainer: {
    flex: 1,
  },

  settingsItemTitle: {
    color: dark,
    fontSize: 14,
    fontWeight: '800',
  },

  settingsItemDescription: {
    color: muted,
    fontSize: 11,
    marginTop: 4,
  },

  settingsOptions: {
    gap: 8,
  },

  settingsOption: {
    minHeight: 45,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 13,
    paddingVertical: 11,
    borderRadius: 13,
    borderWidth: 1,
    borderColor: '#EFEDF5',
    backgroundColor: '#FFFFFF',
  },

  settingsOptionActive: {
    borderColor: purple,
    backgroundColor: '#F5F1FF',
  },

  settingsOptionText: {
    color: dark,
    fontSize: 13,
    fontWeight: '600',
  },

  settingsOptionTextActive: {
    color: purple,
    fontWeight: '800',
  },

  settingsDivider: {
    height: 1,
    backgroundColor: '#F0EEF5',
    marginVertical: 20,
  },

  currencyOptions: {
    gap: 8,
  },

  currencyOption: {
    minHeight: 45,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 13,
    paddingVertical: 11,
    borderRadius: 13,
    borderWidth: 1,
    borderColor: '#EFEDF5',
    backgroundColor: '#FFFFFF',
  },

  currencyNote: {
    color: muted,
    fontSize: 11,
    lineHeight: 17,
    marginTop: 12,
  },

  resetCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 21,
    borderWidth: 1,
    borderColor: '#FFE0E2',
    padding: 18,
    marginBottom: 20,
  },

  resetIcon: {
    width: 45,
    height: 45,
    borderRadius: 15,
    backgroundColor: '#FFF0F1',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 13,
  },

  resetTitle: {
    color: dark,
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 7,
  },

  resetDescription: {
    color: muted,
    fontSize: 12,
    lineHeight: 19,
    marginBottom: 17,
  },

  resetButton: {
    minHeight: 47,
    borderRadius: 14,
    backgroundColor: red,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },

  resetButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },

  appVersion: {
    textAlign: 'center',
    color: '#B0ADBA',
    fontSize: 11,
    marginTop: 3,
    marginBottom: 12,
  },

  tabBar: {
    height: 68,
    paddingTop: 8,
    paddingBottom: 8,
    backgroundColor: '#FFFFFF',
    borderTopColor: '#EFEDF5',
    borderTopWidth: 1,
    elevation: 0,
  },

  tabBarLabel: {
    fontSize: 10,
    fontWeight: '700',
    marginTop: 2,
  },
});