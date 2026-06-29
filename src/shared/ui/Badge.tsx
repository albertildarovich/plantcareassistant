import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, typography } from '@shared/ui/theme';

interface BadgeProps {
  label: string;
  variant?: 'success' | 'warning' | 'error' | 'info' | 'default';
  size?: 'small' | 'medium';
}

export const Badge: React.FC<BadgeProps> = ({
  label,
  variant = 'default',
  size = 'small',
}) => {
  const variantStyles = {
    success: { backgroundColor: colors.successLight, color: colors.success },
    warning: { backgroundColor: colors.warningLight, color: colors.warning },
    error: { backgroundColor: colors.errorLight, color: colors.error },
    info: { backgroundColor: colors.infoLight, color: colors.info },
    default: { backgroundColor: colors.gray100, color: colors.gray600 },
  };

  const currentVariant = variantStyles[variant];

  return (
    <View
      style={[
        styles.badge,
        size === 'small' ? styles.small : styles.medium,
        { backgroundColor: currentVariant.backgroundColor },
      ]}
    >
      <Text
        style={[
          styles.label,
          size === 'small' ? styles.smallText : styles.mediumText,
          { color: currentVariant.color },
        ]}
      >
        {label}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  small: {
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  medium: {
    paddingHorizontal: 12,
    paddingVertical: 5,
  },
  label: {
    fontWeight: '600',
  },
  smallText: {
    fontSize: 11,
  },
  mediumText: {
    fontSize: 13,
  },
});
