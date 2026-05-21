import React, { useMemo, useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  KeyboardTypeOptions,
  Image,
} from "react-native";
import leftArrow from '../../assets/images/arrow-left.png';
import { useNavigation } from "@react-navigation/native";

interface AddressForm {
  fullName: string;
  mobile: string;
  address: string;
  pinCode: string;
  city: string;
  state: string;
}

interface InputProps {
  label: string;
  placeholder: string;
  value: string;
  onChangeText: (text: string) => void;
  keyboardType?: KeyboardTypeOptions;
}


const Input: React.FC<InputProps> = ({
  label,
  placeholder,
  value,
  onChangeText,
  keyboardType = "default",
}) => {
  return (
    <View style={styles.inputWrapper}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={styles.input}
        placeholder={placeholder}
        value={value}
        onChangeText={onChangeText}
        keyboardType={keyboardType}
      />
    </View>
  );
};

const AddAddressScreen: React.FC = () => {
  const navigation = useNavigation();
  const [form, setForm] = useState<AddressForm>({
    fullName: "",
    mobile: "",
    address: "",
    pinCode: "",
    city: "",
    state: "",
  });

  const handleChange = (key: keyof AddressForm, value: string) => {
    setForm(prev => ({ ...prev, [key]: value }));
  };

  // ✅ Valid when all fields have values
  const isFormValid = useMemo<boolean>(() => {
    return Object.values(form).every(value => value.trim().length > 0);
  }, [form]);

  return (
    <ScrollView style={styles.container}>
        <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.goBack()}> 
                <Image source={leftArrow} style={{ width: 24, height: 24, }} />
            </TouchableOpacity>

            <Text style={styles.headerTitle}>Add Address</Text>
        </View>
      <Input
        label="Full Name"
        placeholder="Enter your full name"
        value={form.fullName}
        onChangeText={text => handleChange("fullName", text)}
      />

      <Input
        label="Mobile Number"
        placeholder="Enter mobile number"
        keyboardType="number-pad"
        value={form.mobile}
        onChangeText={text => handleChange("mobile", text)}
      />

      <Input
        label="Address"
        placeholder="Enter your address house number/ area name"
        value={form.address}
        onChangeText={text => handleChange("address", text)}
      />

      <Input
        label="Pin Code"
        placeholder="Enter your area pin code"
        keyboardType="number-pad"
        value={form.pinCode}
        onChangeText={text => handleChange("pinCode", text)}
      />

      <Input
        label="City"
        placeholder="Enter your city name"
        value={form.city}
        onChangeText={text => handleChange("city", text)}
      />

      <Input
        label="State"
        placeholder="Enter your state name"
        value={form.state}
        onChangeText={text => handleChange("state", text)}
      />

      <TouchableOpacity
        disabled={!isFormValid}
        style={[
          styles.button,
          { backgroundColor: isFormValid ? "#1E293B" : "#B0B0B0" },
        ]}
      >
        <Text style={styles.buttonText}>Add Address</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    padding: 16,
    marginTop: 60,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 3,
    paddingBottom: 15,
  },
headerTitle: {
    fontSize: 18,
    fontWeight: '500',
    color: '#1F2937',
    marginLeft: 10,

  },
  inputWrapper: {
    marginBottom: 14,
    marginLeft: 2,
  },

  label: {
    fontSize: 13,
    color: "#333",
    marginBottom: 6,
  },

  input: {
    height: 48,
    borderWidth: 1,
    borderColor: "#C5C9D3",
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 14,
    backgroundColor: "#F9FAFB",
    
  },

  button: {
    marginTop: 30,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    width: "50%",
    alignSelf: "center",
  },

  buttonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "600",
  },
});


export default AddAddressScreen;
