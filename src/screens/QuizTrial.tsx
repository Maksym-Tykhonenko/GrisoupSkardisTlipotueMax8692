import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { GildedButton } from '../components/GildedButton';
import { DuneCard } from '../components/DuneCard';
import { palette, spacing, typography } from '../theme';
import { sanitizeCopy } from '../utils/textSafe';

export type QuizItem = {
  id: string;
  question: string;
  answer: boolean;
};

type Result = {
  correct: number;
  total: number;
  earned: number;
  accuracy: number;
};

type Props = {
  data: QuizItem[];
  onShare: (title: string, body: string) => void;
  onComplete: (result: Result) => void;
  lastResult?: Result | null;
  bestResult?: Result | null;
};

const QUESTION_TIME = 14;

export const QuizTrial = ({ data, onShare, onComplete, lastResult, bestResult }: Props) => {
  const [phase, setPhase] = useState<'intro' | 'question' | 'result'>('intro');
  const [index, setIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [timer, setTimer] = useState(QUESTION_TIME);
  const [result, setResult] = useState<Result | null>(null);
  const tick = useRef<ReturnType<typeof setInterval> | null>(null);

  const questions = useMemo(() => {
    const shuffled = [...data].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, 5);
  }, [data]);

  useEffect(() => {
    if (phase !== 'question') return;
    if (tick.current) clearInterval(tick.current);
    tick.current = setInterval(() => {
      setTimer((prev) => {
        if (prev <= 1) {
          clearInterval(tick.current as ReturnType<typeof setInterval>);
          handleAnswer(false, true);
          return QUESTION_TIME;
        }
        return prev - 1;
      });
    }, 1000);
    return () => {
      if (tick.current) clearInterval(tick.current);
    };
  }, [phase, index]);

  const handleAnswer = (value: boolean, fromTimeout = false) => {
    const current = questions[index];
    const isCorrect = fromTimeout ? false : current ? current.answer === value : false;
    if (!fromTimeout) {
      if (tick.current) clearInterval(tick.current);
    }
    if (isCorrect) {
      setScore((prev) => prev + 1);
    }
    if (index + 1 >= questions.length) {
      const correct = isCorrect ? score + 1 : score;
      const total = questions.length;
      const earned = correct * 3;
      const accuracy = Math.round((correct / total) * 100);
      const payload = { correct, total, earned, accuracy };
      setResult(payload);
      setPhase('result');
      onComplete(payload);
    } else {
      setIndex((prev) => prev + 1);
      setTimer(QUESTION_TIME);
    }
  };

  const startQuiz = () => {
    setPhase('question');
    setIndex(0);
    setScore(0);
    setTimer(QUESTION_TIME);
  };

  return (
    <View style={styles.root}>
      {phase === 'intro' ? (
        <View style={styles.center}>
          <Text style={styles.title}>Desert Quiz</Text>
          <Text style={styles.subtitle}>Answer 5 true-or-false questions before time runs out.</Text>
          {lastResult ? (
            <Text style={styles.lastScore}>
              Latest result: {lastResult.correct}/{lastResult.total} • {lastResult.accuracy}%
            </Text>
          ) : null}
          {bestResult ? (
            <Text style={styles.lastScore}>
              Best accuracy: {bestResult.accuracy}%
            </Text>
          ) : null}
          <GildedButton label="Begin" onPress={startQuiz} style={styles.cta} />
        </View>
      ) : null}

      {phase === 'question' ? (
        <DuneCard style={styles.quizCard}>
          <Text style={styles.timer}>Time: {timer}s</Text>
          <Text style={styles.question}>{sanitizeCopy(questions[index]?.question || '')}</Text>
          <View style={styles.answerRow}>
            <Pressable onPress={() => handleAnswer(true)} style={styles.answerBtn}>
              <Text style={styles.answerText}>True</Text>
            </Pressable>
            <Pressable onPress={() => handleAnswer(false)} style={styles.answerBtnAlt}>
              <Text style={styles.answerTextAlt}>False</Text>
            </Pressable>
          </View>
        </DuneCard>
      ) : null}

      {phase === 'result' && result ? (
        <View style={styles.center}>
          <Text style={styles.title}>Results</Text>
          <Text style={styles.subtitle}>Accuracy: {result.accuracy}%</Text>
          <Text style={styles.subtitle}>Correct: {result.correct}/{result.total}</Text>
          <Text style={styles.subtitle}>Earned: {result.earned} pyramids</Text>
          <View style={styles.resultActions}>
            <GildedButton
              label="Share"
              onPress={() =>
                onShare(
                  'Desert Quiz',
                  `I scored ${result.correct}/${result.total} and earned ${result.earned} pyramids!`
                )
              }
            />
            <Pressable onPress={startQuiz} style={styles.secondaryButton}>
              <Text style={styles.secondaryText}>Retry</Text>
            </Pressable>
          </View>
        </View>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    padding: spacing.lg,
    justifyContent: 'center',
  },
  center: {
    alignItems: 'center',
    gap: spacing.md,
  },
  title: {
    color: palette.cream,
    ...typography.title,
  },
  subtitle: {
    color: palette.sand,
    ...typography.body,
  },
  lastScore: {
    color: palette.goldSoft,
    ...typography.caption,
  },
  cta: {
    marginTop: spacing.lg,
  },
  quizCard: {
    gap: spacing.lg,
  },
  timer: {
    color: palette.goldSoft,
    ...typography.caption,
  },
  question: {
    color: palette.cream,
    ...typography.h3,
  },
  answerRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  answerBtn: {
    flex: 1,
    paddingVertical: spacing.md,
    borderRadius: 18,
    backgroundColor: palette.goldSoft,
    alignItems: 'center',
  },
  answerBtnAlt: {
    flex: 1,
    paddingVertical: spacing.md,
    borderRadius: 18,
    backgroundColor: palette.duneLight,
    borderWidth: 1,
    borderColor: palette.mistStrong,
    alignItems: 'center',
  },
  answerText: {
    color: palette.ink,
    ...typography.h3,
  },
  answerTextAlt: {
    color: palette.cream,
    ...typography.h3,
  },
  resultActions: {
    marginTop: spacing.md,
    gap: spacing.md,
    alignItems: 'center',
  },
  secondaryButton: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.xl,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: palette.goldSoft,
  },
  secondaryText: {
    color: palette.goldSoft,
    ...typography.caption,
  },
});
