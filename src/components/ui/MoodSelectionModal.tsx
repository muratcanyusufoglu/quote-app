import { LinearGradient } from "expo-linear-gradient";
import React, { useState } from "react";
import {
  Animated,
  Dimensions,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useTranslation } from "../../hooks/useTranslation";
import { usePaywallSelectors } from "../../store/usePaywallStore";
import { useIsPremium } from "../../store/usePurchaseStore";
import { useTheme } from "../../utils/ThemeContext";

const { height: screenHeight } = Dimensions.get("window");

interface MoodSelectionModalProps {
  visible: boolean;
  onClose: () => void;
  onComplete: (moodResponse: {
    feeling: string;
    energy: string;
    affecting: string;
  }) => void;
}

interface Question {
  id: string;
  text: string;
  options: { emoji: string; value: string }[];
}

const questions: Question[] = [
  {
    id: "feeling",
    text: "question_feeling",
    options: [
      { emoji: "😊", value: "happy" },
      { emoji: "😌", value: "calm" },
      { emoji: "😐", value: "neutral" },
      { emoji: "😔", value: "sad" },
      { emoji: "😢", value: "very_sad" },
    ],
  },
  {
    id: "energy",
    text: "question_energy",
    options: [
      { emoji: "🔥", value: "very_energetic" },
      { emoji: "⚡", value: "energetic" },
      { emoji: "😴", value: "tired" },
      { emoji: "💤", value: "very_tired" },
    ],
  },
  {
    id: "affecting",
    text: "question_affecting",
    options: [
      { emoji: "💪", value: "motivation" },
      { emoji: "😰", value: "stress" },
      { emoji: "😤", value: "anger" },
      { emoji: "💭", value: "thoughts" },
      { emoji: "🌧️", value: "anxiety" },
      { emoji: "🎯", value: "goals" },
    ],
  },
];

export function MoodSelectionModal({
  visible,
  onClose,
  onComplete,
}: MoodSelectionModalProps) {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [responses, setResponses] = useState<{ [key: string]: string }>({});
  const [slideAnim] = useState(new Animated.Value(screenHeight));

  // Premium status and paywall
  const isPremium = useIsPremium();
  const { showPaywall } = usePaywallSelectors.actions();

  const currentQuestion = questions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === questions.length - 1;

  React.useEffect(() => {
    if (visible) {
      setCurrentQuestionIndex(0);
      setResponses({});
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        tension: 100,
        friction: 8,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: screenHeight,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [visible]);

  const handleOptionSelect = (option: { emoji: string; value: string }) => {
    const newResponses = { ...responses, [currentQuestion.id]: option.value };
    setResponses(newResponses);

    if (isLastQuestion) {
      // Check if this is the "goals" option and user is not premium
      if (!isPremium) {
        // Show paywall for non-premium users trying to access AI goals feature
        showPaywall("premium_feature");
        onClose(); // Close the mood modal
        return;
      }

      // All questions answered, complete the flow
      onComplete({
        feeling: newResponses.feeling,
        energy: newResponses.energy,
        affecting: newResponses.affecting,
      });
    } else {
      // Move to next question
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handleBack = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    } else {
      onClose();
    }
  };

  const styles = StyleSheet.create({
    modalOverlay: {
      flex: 1,
      backgroundColor: theme.colors.overlay,
      justifyContent: "flex-end",
    },
    modalContent: {
      backgroundColor: "transparent",
      borderTopLeftRadius: 24,
      borderTopRightRadius: 24,
      minHeight: screenHeight * 0.7,
      shadowColor: theme.colors.shadowColor,
      shadowOffset: {
        width: 0,
        height: -4,
      },
      shadowOpacity: 0.3,
      shadowRadius: 16,
      elevation: 12,
      overflow: "hidden",
      borderWidth: 0,
      borderColor: theme.colors.border,
    },
    handle: {
      width: 40,
      height: 4,
      backgroundColor: theme.colors.textSecondary,
      borderRadius: 2,
      alignSelf: "center",
      marginBottom: 20,
    },
    header: {
      alignItems: "center",
      marginBottom: 32,
    },
    title: {
      fontSize: 24,
      fontWeight: "bold",
      color: "#fff",
      marginBottom: 8,
      textAlign: "center",
    },
    subtitle: {
      fontSize: 16,
      color: "#fff",
      textAlign: "center",
    },
    questionContainer: {
      flex: 1,
      justifyContent: "center",
    },
    questionText: {
      fontSize: 20,
      fontWeight: "600",
      color: "#fff",
      textAlign: "center",
      marginBottom: 32,
    },
    optionsContainer: {
      flexDirection: "row",
      flexWrap: "wrap",
      justifyContent: "center",
      gap: 16,
    },
    optionButton: {
      width: 70,
      height: 80,
      borderRadius: 35,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: theme.colors.whiteOverlay10,
      borderWidth: 0,
      borderColor: theme.colors.border,
      shadowColor: theme.colors.shadowColor,
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
      paddingVertical: 8,
    },
    optionButtonSelected: {
      borderColor: theme.colors.brandYellow,
      backgroundColor: theme.colors.whiteOverlay10,
      shadowOpacity: 0.2,
      shadowRadius: 6,
      elevation: 4,
    },
    optionEmoji: {
      fontSize: 28,
      marginBottom: 2,
    },
    optionLabel: {
      fontSize: 10,
      color: "#fff",
      textAlign: "center",
      fontWeight: "500",
      opacity: 0.9,
    },
    progressContainer: {
      flexDirection: "row",
      justifyContent: "center",
      marginBottom: 24,
    },
    progressDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
      marginHorizontal: 4,
      backgroundColor: theme.colors.border,
    },
    progressDotActive: {
      backgroundColor: theme.colors.primary,
    },
    navigationContainer: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginTop: 32,
    },
    backButton: {
      paddingVertical: 12,
      paddingHorizontal: 20,
      borderRadius: 8,
      backgroundColor: theme.colors.primaryLight + "20",
      borderWidth: 1,
      borderColor: theme.colors.primaryLight + "40",
    },
    backButtonText: {
      fontSize: 16,
      color: "#fff",
      fontWeight: "500",
    },
    skipButton: {
      paddingVertical: 12,
      paddingHorizontal: 20,
      borderRadius: 8,
      backgroundColor: theme.colors.primaryLight + "20",
      borderWidth: 1,
      borderColor: theme.colors.primaryLight + "40",
    },
    skipButtonText: {
      fontSize: 16,
      color: "#fff",
      fontWeight: "600",
    },
    modalGradient: {
      flex: 1,
      paddingTop: 20,
      paddingBottom: 40,
      paddingHorizontal: 24,
      borderRadius: 24,
    },
  });

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
    >
      <TouchableOpacity
        style={styles.modalOverlay}
        activeOpacity={1}
        onPress={onClose}
      >
        <TouchableOpacity
          activeOpacity={1}
          onPress={() => {}} // Prevent modal from closing when tapping inside
        >
          <Animated.View
            style={[
              styles.modalContent,
              {
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            <LinearGradient
              colors={theme.colors.gradientColors as any}
              locations={theme.colors.gradientLocations as any}
              start={{ x: 0, y: 0 }}
              end={{ x: 0, y: 1 }}
              style={styles.modalGradient}
            >
              <View style={styles.handle} />

              <View style={styles.header}>
                <Text style={styles.title}>{t("mood_motivation.title")}</Text>
                <Text style={styles.subtitle}>
                  {t("mood_motivation.subtitle")}
                </Text>
              </View>

              <View style={styles.progressContainer}>
                {questions.map((_, index) => (
                  <View
                    key={index}
                    style={[
                      styles.progressDot,
                      index <= currentQuestionIndex && styles.progressDotActive,
                    ]}
                  />
                ))}
              </View>

              <View style={styles.questionContainer}>
                <Text style={styles.questionText}>
                  {t(`mood_motivation.${currentQuestion.text}` as any)}
                </Text>

                <View style={styles.optionsContainer}>
                  {currentQuestion.options.map((option) => (
                    <TouchableOpacity
                      key={option.value}
                      style={[
                        styles.optionButton,
                        responses[currentQuestion.id] === option.value &&
                          styles.optionButtonSelected,
                      ]}
                      onPress={() => handleOptionSelect(option)}
                      activeOpacity={0.7}
                    >
                      <Text style={styles.optionEmoji}>{option.emoji}</Text>
                      <Text style={styles.optionLabel}>
                        {t(`mood_motivation.emojis.${option.value}` as any)}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View style={styles.navigationContainer}>
                <TouchableOpacity
                  style={styles.backButton}
                  onPress={handleBack}
                >
                  <Text style={styles.backButtonText}>
                    {currentQuestionIndex === 0
                      ? t("common.cancel")
                      : t("common.back" as any)}
                  </Text>
                </TouchableOpacity>

                {!isLastQuestion && (
                  <TouchableOpacity
                    style={styles.skipButton}
                    onPress={() =>
                      setCurrentQuestionIndex(currentQuestionIndex + 1)
                    }
                  >
                    <Text style={styles.skipButtonText}>
                      {t("common.skip")}
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            </LinearGradient>
          </Animated.View>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
}
