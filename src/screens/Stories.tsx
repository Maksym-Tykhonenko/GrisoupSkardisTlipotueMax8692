import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
    Animated,
    FlatList,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import { ArrowLeft, Bookmark, BookmarkCheck, Share2 } from 'lucide-react-native';
import { DuneCard } from '../components/DuneCard';
import { GildedButton } from '../components/GildedButton';
import { VistaHeader } from '../components/VistaHeader';
import { palette, spacing, typography } from '../theme';
import { sanitizeCopy } from '../utils/textSafe';

export type StoryItem = {
    id: string;
    title: string;
    content: string;
};

type Props = {
    data: StoryItem[];
    saved: string[];
    onToggleSave: (id: string) => void;
    onShare: (title: string, body: string) => void;
};

export const Stories = ({ data, saved, onToggleSave, onShare }: Props) => {
    const [active, setActive] = useState<StoryItem | null>(null);
    const [renderedActive, setRenderedActive] = useState<StoryItem | null>(null);
    const detailAnim = useRef(new Animated.Value(0)).current;

    const ordered = useMemo(() => {
        const pinned = data.filter((item) => saved.includes(item.id));
        const rest = data.filter((item) => !saved.includes(item.id));
        return [...pinned, ...rest];
    }, [data, saved]);

    useEffect(() => {
        if (active) {
            setRenderedActive(active);
            Animated.parallel([
                Animated.timing(detailAnim, {
                    toValue: 1,
                    duration: 260,
                    useNativeDriver: true,
                }),
            ]).start();
            return;
        }

        if (!renderedActive) return;

        Animated.parallel([
            Animated.timing(detailAnim, {
                toValue: 0,
                duration: 220,
                useNativeDriver: true,
            }),
        ]).start(({ finished }) => {
            if (finished) setRenderedActive(null);
        });
    }, [active, detailAnim, renderedActive]);

    const detailTranslate = detailAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [20, 0],
    });

    const handleBack = () => setActive(null);

    return (
        <View style={styles.root}>
            {renderedActive ? (
                <Animated.View
                    style={[
                        styles.detailScreen,
                        {
                            opacity: detailAnim,
                            transform: [{ translateY: detailTranslate }],
                        },
                    ]}
                >
                    <View style={styles.detailHeaderRow}>
                        <Pressable onPress={handleBack} style={styles.backButton}>
                            <ArrowLeft color={palette.goldGlow} size={18} />
                            <Text style={styles.backText}>Back</Text>
                        </Pressable>
                        <View style={styles.backSpacer} />
                    </View>
                    <ScrollView
                        style={styles.detailScroll}
                        contentContainerStyle={styles.detailContent}
                        showsVerticalScrollIndicator={false}
                    >
                        <VistaHeader
                            image={require('../../thosiganems/triofborsids/sargenli2.png')}
                            title={sanitizeCopy(renderedActive.title)}
                            subtitle="Egypt Stories"
                        />
                        <Text style={styles.detailText}>{sanitizeCopy(renderedActive.content)}</Text>
                        <View style={styles.detailActions}>
                            <Pressable
                                onPress={() => onToggleSave(renderedActive.id)}
                                style={styles.actionButton}
                            >
                                {saved.includes(renderedActive.id) ? (
                                    <BookmarkCheck color={palette.goldGlow} size={18} />
                                ) : (
                                    <Bookmark color={palette.sand} size={18} />
                                )}
                                <Text style={styles.actionText}>{saved.includes(renderedActive.id) ? 'Saved' : 'Save'}</Text>
                            </Pressable>
                            <Pressable
                                onPress={() => onShare(renderedActive.title, renderedActive.content)}
                                style={styles.actionButton}
                            >
                                <Share2 color={palette.sand} size={18} />
                                <Text style={styles.actionText}>Share</Text>
                            </Pressable>
                        </View>
                        <GildedButton label="Back to Stories" onPress={handleBack} style={styles.closeButton} />
                    </ScrollView>
                </Animated.View>
            ) : (
                <FlatList
                    data={ordered}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={styles.list}
                    ListHeaderComponent={() => (
                        <View style={styles.header}>
                            <Text style={styles.title}>Egypt Stories</Text>
                            <Text style={styles.subtitle}>Curated history and culture highlights.</Text>
                        </View>
                    )}
                    renderItem={({ item, index }) => {
                        const isSaved = saved.includes(item.id);
                        return (
                            <DuneCard
                                onPress={() => setActive(item)}
                                style={[styles.card, index === 0 && styles.featured]}
                            >
                                <Text style={styles.cardTitle}>{sanitizeCopy(item.title)}</Text>
                                <Text style={styles.cardBody} numberOfLines={4}>
                                    {sanitizeCopy(item.content)}
                                </Text>
                                <View style={styles.cardActions}>
                                    <Pressable onPress={() => onToggleSave(item.id)} style={styles.iconButton}>
                                        {isSaved ? (
                                            <BookmarkCheck color={palette.goldGlow} size={20} />
                                        ) : (
                                            <Bookmark color={palette.sand} size={20} />
                                        )}
                                    </Pressable>
                                    <Pressable
                                        onPress={() => onShare(item.title, item.content)}
                                        style={styles.iconButton}
                                    >
                                        <Share2 color={palette.sand} size={20} />
                                    </Pressable>
                                </View>
                            </DuneCard>
                        );
                    }}
                />
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    root: {
        flex: 1,
    },
    detailScreen: {
        flex: 1,
        padding: spacing.lg,
        gap: spacing.md,
    },
    detailHeaderRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    backButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 999,
        backgroundColor: palette.duneLight,
        borderWidth: 1,
        borderColor: palette.mistStrong,
    },
    backText: {
        color: palette.goldGlow,
        ...typography.caption,
    },
    backSpacer: {
        width: 32,
    },
    detailScroll: {
        flex: 1,
    },
    detailContent: {
        gap: spacing.lg,
        paddingBottom: spacing.xxl * 5,
    },
    detailText: {
        color: palette.cream,
        ...typography.body,
    },
    detailActions: {
        flexDirection: 'row',
        gap: spacing.md,
    },
    actionButton: {
        flex: 1,
        minHeight: 46,
        borderRadius: 16,
        backgroundColor: palette.duneLight,
        borderWidth: 1,
        borderColor: palette.mistStrong,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
    },
    actionText: {
        color: palette.sand,
        ...typography.caption,
    },
    list: {
        padding: spacing.lg,
        paddingBottom: 120,
        gap: spacing.md,
    },
    header: {
        marginBottom: spacing.md,
    },
    title: {
        color: palette.cream,
        ...typography.title,
    },
    subtitle: {
        color: palette.sand,
        ...typography.body,
    },
    card: {
        gap: spacing.sm,
    },
    featured: {
        borderColor: palette.goldSoft,
        backgroundColor: 'rgba(32,22,12,0.85)',
    },
    cardTitle: {
        color: palette.goldGlow,
        ...typography.h3,
    },
    cardBody: {
        color: palette.cream,
        ...typography.body,
    },
    cardActions: {
        flexDirection: 'row',
        gap: spacing.md,
    },
    iconButton: {
        padding: spacing.sm,
        backgroundColor: palette.duneLight,
        borderRadius: 14,
    },
    closeButton: {
        alignSelf: 'stretch',
    },
});
