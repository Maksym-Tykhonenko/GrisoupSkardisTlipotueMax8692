import React, { useEffect, useMemo, useState } from 'react';
import { Modal, Pressable, Share, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  BookOpen,
  Compass,
  Gem,
  Landmark,
  Layers,
  MapPinned,
} from 'lucide-react-native';
import { SandsShell } from './components/SandsShell';
import { GlowTabs } from './components/GlowTabs';
import { DuneFade } from './components/DuneFade';
import { GildedButton } from './components/GildedButton';
import { palette, spacing, typography } from './theme';
import { readJSON, writeJSON } from './utils/storage';
import { sanitizeCopy } from './utils/textSafe';
import { Loader } from './screens/Loader';
import { Onboarding } from './screens/Onboarding';
import { Stories } from './screens/Stories';
import { ExplorerMap } from './screens/ExplorerMap';
import { QuizTrial } from './screens/QuizTrial';
import { Places } from './screens/Places';
import { Collection } from './screens/Collection';
import { Walls } from './screens/Walls';

import storyData from '../gosrildiutaia/statti';
import factData from '../gosrildiutaia/ghafs';
import placeData from '../gosrildiutaia/plarcs';
import quizData from '../gosrildiutaia/twirsek';

const STORAGE = {
  onboarded: 'gs_onboarded',
  savedStories: 'gs_saved_stories',
  savedFacts: 'gs_saved_facts',
  savedPlaces: 'gs_saved_places',
  unlockedWalls: 'gs_unlocked_walls',
  pyramidBalance: 'gs_pyramid_balance',
  quizLast: 'gs_quiz_last',
  quizBest: 'gs_quiz_best',
};

const slides = [
  {
    id: 'slide-1',
    title: 'Welcome, Explorer',
    subtitle: 'Your desert guide awaits',
    description:
      'Discover curated historical stories and cultural highlights drawn from Egypt’s golden age.',
    image: require('../thosiganems/triofborsids/sargenli1.png'),
  },
  {
    id: 'slide-2',
    title: 'Historical Stories',
    subtitle: 'Read. Learn. Discover.',
    description:
      'Dive into detailed articles on ancient life, architecture, and cultural achievements.',
    image: require('../thosiganems/triofborsids/sargenli2.png'),
  },
  {
    id: 'slide-3',
    title: 'Interactive Map',
    subtitle: 'Tap to reveal facts',
    description:
      'Explore locations across Egypt and save your favorite discoveries as you travel.',
    image: require('../thosiganems/triofborsids/sargenli3.png'),
  },
  {
    id: 'slide-4',
    title: 'Desert Quiz',
    subtitle: 'Earn pyramid rewards',
    description:
      'Answer timed true-or-false questions to earn pyramids for unlocks.',
    image: require('../thosiganems/triofborsids/sargenli4.png'),
  },
  {
    id: 'slide-5',
    title: 'Places & Wallpapers',
    subtitle: 'Collect. Save. Share.',
    description:
      'Save notable places and unlock premium wallpapers for your device.',
    image: require('../thosiganems/triofborsids/sargenli5.png'),
  },
];

export const RootShell = () => {
  const [booting, setBooting] = useState(true);
  const [bootProgress, setBootProgress] = useState(0.2);
  const [onboarded, setOnboarded] = useState(false);

  const [activeTab, setActiveTab] = useState('stories');

  const [savedStories, setSavedStories] = useState([]);
  const [savedFacts, setSavedFacts] = useState([]);
  const [savedPlaces, setSavedPlaces] = useState([]);
  const [unlockedWalls, setUnlockedWalls] = useState([]);
  const [pyramidBalance, setPyramidBalance] = useState(0);
  const [quizLast, setQuizLast] = useState(null);
  const [quizBest, setQuizBest] = useState(null);

  const [infoMessage, setInfoMessage] = useState(null);

  useEffect(() => {
    let active = true;
    const load = async () => {
      const [
        storiesValue,
        factsValue,
        placesValue,
        wallsValue,
        balanceValue,
        quizValue,
        bestValue,
      ] = await Promise.all([
        readJSON(STORAGE.savedStories, []),
        readJSON(STORAGE.savedFacts, []),
        readJSON(STORAGE.savedPlaces, []),
        readJSON(STORAGE.unlockedWalls, []),
        readJSON(STORAGE.pyramidBalance, 0),
        readJSON(STORAGE.quizLast, null),
        readJSON(STORAGE.quizBest, null),
      ]);
      if (!active) return;
      setBootProgress(0.7);
      // Онбордінг показуємо при кожному запуску, тож збережений прапорець не читаємо.
      setSavedStories(storiesValue);
      setSavedFacts(factsValue);
      setSavedPlaces(placesValue);
      setUnlockedWalls(wallsValue);
      setPyramidBalance(balanceValue);
      setQuizLast(quizValue);
      setQuizBest(bestValue);
      setTimeout(() => {
        if (!active) return;
        setBootProgress(1);
        setBooting(false);
      }, 700);
    };
    load();
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    writeJSON(STORAGE.savedStories, savedStories);
  }, [savedStories]);
  useEffect(() => {
    writeJSON(STORAGE.savedFacts, savedFacts);
  }, [savedFacts]);
  useEffect(() => {
    writeJSON(STORAGE.savedPlaces, savedPlaces);
  }, [savedPlaces]);
  useEffect(() => {
    writeJSON(STORAGE.unlockedWalls, unlockedWalls);
  }, [unlockedWalls]);
  useEffect(() => {
    writeJSON(STORAGE.pyramidBalance, pyramidBalance);
  }, [pyramidBalance]);
  useEffect(() => {
    writeJSON(STORAGE.quizLast, quizLast);
  }, [quizLast]);
  useEffect(() => {
    writeJSON(STORAGE.quizBest, quizBest);
  }, [quizBest]);

  const storyItems = useMemo(() => storyData, []);
  const factItems = useMemo(() => factData, []);
  const placeItems = useMemo(() => placeData, []);

  const shareText = async (title, body) => {
    try {
      await Share.share({
        message: `${sanitizeCopy(title)}\n\n${sanitizeCopy(body)}`,
      });
    } catch {
      setInfoMessage('Sharing is not available right now.');
    }
  };

  const toggleSave = (list, setList, id) => {
    if (list.includes(id)) {
      setList(list.filter(item => item !== id));
    } else {
      setList([id, ...list]);
    }
  };

  const handleQuizComplete = result => {
    setQuizLast(result);
    setQuizBest(prev => {
      if (!prev) return result;
      return result.accuracy >= prev.accuracy ? result : prev;
    });
    setPyramidBalance(prev => prev + result.earned);
    setInfoMessage(`You earned ${result.earned} pyramids.`);
  };

  if (!onboarded) {
    return (
      <Onboarding
        slides={slides}
        onFinish={() => setOnboarded(true)}
        onSkip={() => setOnboarded(true)}
      />
    );
  }

  const tabs = [
    {
      key: 'stories',
      label: 'Stories',
      icon: isActive => (
        <BookOpen
          color={isActive ? palette.goldGlow : palette.sand}
          size={20}
        />
      ),
    },
    {
      key: 'map',
      label: 'Map',
      icon: isActive => (
        <MapPinned
          color={isActive ? palette.goldGlow : palette.sand}
          size={20}
        />
      ),
    },
    {
      key: 'quiz',
      label: 'Quiz',
      icon: isActive => (
        <Gem color={isActive ? palette.goldGlow : palette.sand} size={20} />
      ),
    },
    {
      key: 'places',
      label: 'Places',
      icon: isActive => (
        <Landmark
          color={isActive ? palette.goldGlow : palette.sand}
          size={20}
        />
      ),
    },
    {
      key: 'saved',
      label: 'Saved',
      icon: isActive => (
        <Layers color={isActive ? palette.goldGlow : palette.sand} size={20} />
      ),
    },
    {
      key: 'walls',
      label: 'Walls',
      icon: isActive => (
        <Compass color={isActive ? palette.goldGlow : palette.sand} size={20} />
      ),
    },
  ];

  return (
    <SandsShell>
      <DuneFade key={activeTab}>
        {activeTab === 'stories' ? (
          <Stories
            data={storyItems}
            saved={savedStories}
            onToggleSave={id => toggleSave(savedStories, setSavedStories, id)}
            onShare={(title, body) => shareText(title, body)}
          />
        ) : null}

        {activeTab === 'map' ? (
          <ExplorerMap
            data={factItems}
            saved={savedFacts}
            onToggleSave={id => toggleSave(savedFacts, setSavedFacts, id)}
            onShare={(title, body) => shareText(title, body)}
          />
        ) : null}

        {activeTab === 'quiz' ? (
          <QuizTrial
            data={quizData}
            onShare={(title, body) => shareText(title, body)}
            onComplete={handleQuizComplete}
            lastResult={quizLast}
            bestResult={quizBest}
          />
        ) : null}

        {activeTab === 'places' ? (
          <Places
            data={placeItems}
            saved={savedPlaces}
            onToggleSave={id => toggleSave(savedPlaces, setSavedPlaces, id)}
            onShare={(title, body) => shareText(title, body)}
          />
        ) : null}

        {activeTab === 'saved' ? (
          <Collection
            facts={factItems}
            places={placeItems}
            savedFacts={savedFacts}
            savedPlaces={savedPlaces}
            onRemoveFact={id => toggleSave(savedFacts, setSavedFacts, id)}
            onRemovePlace={id => toggleSave(savedPlaces, setSavedPlaces, id)}
          />
        ) : null}

        {activeTab === 'walls' ? (
          <Walls
            balance={pyramidBalance}
            unlocked={unlockedWalls}
            onUnlock={(id, cost) => {
              setUnlockedWalls(prev => [id, ...prev]);
              setPyramidBalance(prev => Math.max(0, prev - cost));
            }}
          />
        ) : null}
      </DuneFade>

      <SafeAreaView edges={['bottom']} style={styles.bottomBar}>
        <GlowTabs
          tabs={tabs}
          active={activeTab}
          onChange={key => setActiveTab(key)}
        />
      </SafeAreaView>

      <Modal visible={!!infoMessage} transparent animationType="fade">
        <Pressable
          style={styles.modalBackdrop}
          onPress={() => setInfoMessage(null)}
        >
          <View style={styles.messageCard}>
            <Text style={styles.messageText}>{infoMessage}</Text>
          </View>
        </Pressable>
      </Modal>
    </SandsShell>
  );
};

const styles = StyleSheet.create({
  bottomBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
  },
  messageCard: {
    backgroundColor: palette.dune,
    padding: spacing.lg,
    borderRadius: 18,
    width: '100%',
    maxWidth: 420,
    gap: spacing.sm,
  },
  messageText: {
    color: palette.cream,
    ...typography.body,
    textAlign: 'center',
  },
  modalTitle: {
    color: palette.goldGlow,
    ...typography.h3,
  },
  modalBody: {
    color: palette.cream,
    ...typography.body,
  },
  modalButton: {
    alignSelf: 'center',
  },
});
