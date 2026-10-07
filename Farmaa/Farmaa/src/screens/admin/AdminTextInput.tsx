import React from 'react';
import { TextInput, TextInputProps, StyleSheet } from 'react-native';

/** Visible on light admin form backgrounds */
export const ADMIN_PLACEHOLDER_COLOR = '#6B7280';

const defaultStyle = {
  color: '#111827',
};

export const AdminTextInput = ({
  style,
  placeholderTextColor,
  editable = true,
  ...props
}: TextInputProps) => (
  <TextInput
    {...props}
    placeholderTextColor={placeholderTextColor ?? ADMIN_PLACEHOLDER_COLOR}
    style={[defaultStyle, style]}
    editable={editable !== false}
  />
);

export default AdminTextInput;

export const adminInputStyle = StyleSheet.create({
  field: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: '#111827',
    backgroundColor: '#FFFFFF',
  },
  textArea: {
    minHeight: 88,
    textAlignVertical: 'top',
  },
  search: {
    flex: 1,
    fontSize: 14,
    color: '#111827',
    paddingVertical: 8,
  },
});
