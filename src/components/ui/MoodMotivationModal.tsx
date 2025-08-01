import React, { useState } from "react";
import {
  ActivityIndicator,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useMoodMotivation } from "../../hooks/useMoodMotivation";
import { useTranslation } from "../../hooks/useTranslation";
import { useUserName } from "../../store/useOnboardingStore";
import { Language } from "../../types";
import { useTheme } from "../../utils/ThemeContext";

interface MoodMotivationModalProps {
  isVisible: boolean;
  onClose: () => void;
}

export const MoodMotivationModal: React.FC<MoodMotivationModalProps> = ({
  isVisible,
  onClose,
}) => {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const userName = useUserName();
  const {
    isLoading,
    generatedMessage,
    error,
    generateMotivation,
    clearMessage,
  } = useMoodMotivation();

  const [selectedMood, setSelectedMood] = useState<string>("");
  const [selectedEnergy, setSelectedEnergy] = useState<string>("");
  const [selectedAffecting, setSelectedAffecting] = useState<string>("");

  const moods = ["happy", "sad", "anxious", "excited", "tired", "motivated"];
  const energyLevels = ["low", "medium", "high"];
  const affectingFactors = [
    "work",
    "relationships",
    "health",
    "goals",
    "family",
  ];

  const handleGenerate = async () => {
    if (!selectedMood || !selectedEnergy || !selectedAffecting) {
      return;
    }

    await generateMotivation({
      mood: selectedMood,
      energy: selectedEnergy,
      affecting: selectedAffecting,
      language: "tr" as Language, // Bu daha sonra user preferences'dan gelecek
      userName: userName || undefined, // Include user's name for personalization
    });
  };

  const handleClose = () => {
    clearMessage();
    setSelectedMood("");
    setSelectedEnergy("");
    setSelectedAffecting("");
    onClose();
  };

  const styles = StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: "rgba(0, 0, 0, 0.5)",
      justifyContent: "center",
      alignItems: "center",
    },
    container: {
      backgroundColor: theme.colors.background,
      borderRadius: 16,
      padding: 24,
      margin: 20,
      maxHeight: "80%",
      width: "90%",
    },
    title: {
      fontSize: 24,
      fontWeight: "bold",
      color: theme.colors.text,
      textAlign: "center",
      marginBottom: 20,
    },
    sectionTitle: {
      fontSize: 16,
      fontWeight: "600",
      color: theme.colors.text,
      marginTop: 16,
      marginBottom: 8,
    },
    optionContainer: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 8,
    },
    option: {
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    selectedOption: {
      backgroundColor: theme.colors.primary,
      borderColor: theme.colors.primary,
    },
    optionText: {
      color: theme.colors.text,
      fontSize: 14,
    },
    selectedOptionText: {
      color: theme.colors.background,
    },
    generateButton: {
      backgroundColor: theme.colors.primary,
      padding: 16,
      borderRadius: 12,
      marginTop: 24,
      alignItems: "center",
    },
    generateButtonDisabled: {
      backgroundColor: theme.colors.border,
    },
    generateButtonText: {
      color: theme.colors.background,
      fontSize: 16,
      fontWeight: "600",
    },
    messageContainer: {
      backgroundColor: theme.colors.background,
      padding: 16,
      borderRadius: 12,
      marginTop: 16,
    },
    messageText: {
      color: theme.colors.text,
      fontSize: 16,
      lineHeight: 24,
    },
    errorText: {
      color: theme.colors.error,
      fontSize: 14,
      textAlign: "center",
      marginTop: 8,
    },
    closeButton: {
      marginTop: 16,
      padding: 12,
      alignItems: "center",
    },
    closeButtonText: {
      color: theme.colors.primary,
      fontSize: 16,
    },
  });

  const isGenerateDisabled =
    !selectedMood || !selectedEnergy || !selectedAffecting;

  return (
    <Modal visible={isVisible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.container}>
          <ScrollView showsVerticalScrollIndicator={false}>
            <Text style={styles.title}>🧠 Mood-Based Motivation</Text>

            <Text style={styles.sectionTitle}>How are you feeling?</Text>
            <View style={styles.optionContainer}>
              {moods.map((mood) => (
                <TouchableOpacity
                  key={mood}
                  style={[
                    styles.option,
                    selectedMood === mood && styles.selectedOption,
                  ]}
                  onPress={() => setSelectedMood(mood)}
                >
                  <Text
                    style={[
                      styles.optionText,
                      selectedMood === mood && styles.selectedOptionText,
                    ]}
                  >
                    {mood}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.sectionTitle}>Energy Level?</Text>
            <View style={styles.optionContainer}>
              {energyLevels.map((energy) => (
                <TouchableOpacity
                  key={energy}
                  style={[
                    styles.option,
                    selectedEnergy === energy && styles.selectedOption,
                  ]}
                  onPress={() => setSelectedEnergy(energy)}
                >
                  <Text
                    style={[
                      styles.optionText,
                      selectedEnergy === energy && styles.selectedOptionText,
                    ]}
                  >
                    {energy}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.sectionTitle}>What's affecting you most?</Text>
            <View style={styles.optionContainer}>
              {affectingFactors.map((factor) => (
                <TouchableOpacity
                  key={factor}
                  style={[
                    styles.option,
                    selectedAffecting === factor && styles.selectedOption,
                  ]}
                  onPress={() => setSelectedAffecting(factor)}
                >
                  <Text
                    style={[
                      styles.optionText,
                      selectedAffecting === factor && styles.selectedOptionText,
                    ]}
                  >
                    {factor}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity
              style={[
                styles.generateButton,
                isGenerateDisabled && styles.generateButtonDisabled,
              ]}
              onPress={handleGenerate}
              disabled={isGenerateDisabled || isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color={theme.colors.background} />
              ) : (
                <Text style={styles.generateButtonText}>
                  Generate Motivation ✨
                </Text>
              )}
            </TouchableOpacity>

            {error && <Text style={styles.errorText}>{error}</Text>}

            {generatedMessage && (
              <View style={styles.messageContainer}>
                <Text style={styles.messageText}>{generatedMessage}</Text>
              </View>
            )}

            <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};
