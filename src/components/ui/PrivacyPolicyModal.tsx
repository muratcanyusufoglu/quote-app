import React from "react";
import {
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { IconSymbol } from "../../../components/ui/IconSymbol";
import { APP_CONFIG } from "../../constants/config";
import { useTheme } from "../../utils/ThemeContext";

interface PrivacyPolicyModalProps {
  visible: boolean;
  onClose: () => void;
}

export function PrivacyPolicyModal({
  visible,
  onClose,
}: PrivacyPolicyModalProps) {
  const { theme } = useTheme();

  const styles = StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: "rgba(0, 0, 0, 0.5)",
      justifyContent: "center",
      alignItems: "center",
    },
    container: {
      backgroundColor: theme.colors.surface,
      borderRadius: 16,
      margin: 20,
      maxHeight: "80%",
      width: "90%",
    },
    header: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      padding: 20,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    title: {
      fontSize: 20,
      fontWeight: "700",
      color: theme.colors.text,
    },
    closeButton: {
      padding: 8,
    },
    content: {
      flex: 1,
    },
    scrollView: {
      padding: 20,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: "600",
      color: theme.colors.text,
      marginTop: 20,
      marginBottom: 10,
    },
    paragraph: {
      fontSize: 14,
      lineHeight: 20,
      color: theme.colors.textSecondary,
      marginBottom: 12,
    },
    bulletPoint: {
      fontSize: 14,
      lineHeight: 20,
      color: theme.colors.textSecondary,
      marginBottom: 8,
      marginLeft: 16,
    },
    footer: {
      padding: 20,
      borderTopWidth: 1,
      borderTopColor: theme.colors.border,
    },
    footerText: {
      fontSize: 12,
      color: theme.colors.textTertiary,
      textAlign: "center",
    },
  });

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.title}>Privacy Policy</Text>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <IconSymbol
                name="xmark"
                size={20}
                color={theme.colors.textSecondary}
              />
            </TouchableOpacity>
          </View>

          <View style={styles.content}>
            <ScrollView
              style={styles.scrollView}
              showsVerticalScrollIndicator={false}
            >
              <Text style={styles.paragraph}>
                Last updated: {new Date().toLocaleDateString()}
              </Text>

              <Text style={styles.sectionTitle}>1. Information We Collect</Text>
              <Text style={styles.paragraph}>
                Aurora collects minimal information to provide you with the
                best experience:
              </Text>
              <Text style={styles.bulletPoint}>
                • Usage analytics (anonymous)
              </Text>
              <Text style={styles.bulletPoint}>
                • App preferences and settings
              </Text>
              <Text style={styles.bulletPoint}>
                • Purchase information (via RevenueCat)
              </Text>
              <Text style={styles.bulletPoint}>
                • Device information for optimization
              </Text>

              <Text style={styles.sectionTitle}>
                2. How We Use Your Information
              </Text>
              <Text style={styles.paragraph}>
                We use collected information to:
              </Text>
              <Text style={styles.bulletPoint}>
                • Improve app performance and features
              </Text>
              <Text style={styles.bulletPoint}>
                • Provide personalized quote recommendations
              </Text>
              <Text style={styles.bulletPoint}>
                • Process premium subscriptions
              </Text>
              <Text style={styles.bulletPoint}>
                • Send relevant notifications (if enabled)
              </Text>

              <Text style={styles.sectionTitle}>3. Data Sharing</Text>
              <Text style={styles.paragraph}>
                We do not sell, trade, or rent your personal information to
                third parties. We may share information with:
              </Text>
              <Text style={styles.bulletPoint}>
                • Service providers (Firebase, RevenueCat)
              </Text>
              <Text style={styles.bulletPoint}>
                • Legal authorities when required by law
              </Text>

              <Text style={styles.sectionTitle}>4. Data Security</Text>
              <Text style={styles.paragraph}>
                We implement appropriate security measures to protect your
                information against unauthorized access, alteration, disclosure,
                or destruction.
              </Text>

              <Text style={styles.sectionTitle}>5. Your Rights</Text>
              <Text style={styles.paragraph}>You have the right to:</Text>
              <Text style={styles.bulletPoint}>
                • Access your personal data
              </Text>
              <Text style={styles.bulletPoint}>• Request data deletion</Text>
              <Text style={styles.bulletPoint}>• Opt-out of analytics</Text>
              <Text style={styles.bulletPoint}>
                • Contact us with privacy concerns
              </Text>

              <Text style={styles.sectionTitle}>6. Children's Privacy</Text>
              <Text style={styles.paragraph}>
                Our app is not intended for children under 13. We do not
                knowingly collect personal information from children under 13.
              </Text>

              <Text style={styles.sectionTitle}>7. Changes to This Policy</Text>
              <Text style={styles.paragraph}>
                We may update this privacy policy from time to time. We will
                notify you of any changes by posting the new policy in the app.
              </Text>

              <Text style={styles.sectionTitle}>8. Contact Us</Text>
              <Text style={styles.paragraph}>
                If you have any questions about this Privacy Policy, please
                contact us at:
              </Text>
              <Text style={styles.paragraph}>
                Email: {APP_CONFIG.SUPPORT_EMAIL}
                {"\n"}
                Website: {APP_CONFIG.PRIVACY_POLICY_URL}
              </Text>
            </ScrollView>
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>
              Aurora: Quotes & Affirmations{"\n"}
              Version {APP_CONFIG.VERSION}
            </Text>
          </View>
        </View>
      </View>
    </Modal>
  );
}
