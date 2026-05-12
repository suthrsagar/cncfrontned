import React, { useState, useContext } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, SafeAreaView, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { AuthContext } from '../../context/AuthContext';
import { COLORS, SIZES } from '../../theme/theme';
import Icon from 'react-native-vector-icons/FontAwesome5';
import { useTranslation } from 'react-i18next';
import { useAlert } from '../../context/AlertContext';

const RegisterScreen = ({ navigation }) => {
  const { t } = useTranslation();
  const { showAlert } = useAlert();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const { register, isLoading } = useContext(AuthContext);

  const handleRegister = async () => {
    if (!name || !email || !phone || !password) {
      showAlert({ title: t('warning'), message: t('fill_required'), type: 'warning' });
      return;
    }
    try {
      await register(name, email, phone, password);
    } catch (e) {
      showAlert({ title: t('error'), message: e.response?.data?.message || e.message, type: 'error' });
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.inner}>
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <Icon name="arrow-left" size={20} color={COLORS.text} />
          </TouchableOpacity>

          <View style={styles.header}>
            <Text style={styles.title}>{t('register')}</Text>
            <Text style={styles.subtitle}>Join {t('brand_name')}</Text>
          </View>

          <View style={styles.form}>
            <View style={styles.inputContainer}>
              <Icon name="user" size={20} color={COLORS.secondary} style={styles.icon} />
              <TextInput
                style={styles.input}
                placeholder={t('name')}
                placeholderTextColor={COLORS.secondary}
                value={name}
                onChangeText={setName}
              />
            </View>

            <View style={styles.inputContainer}>
              <Icon name="envelope" size={20} color={COLORS.secondary} style={styles.icon} />
              <TextInput
                style={styles.input}
                placeholder={t('email')}
                placeholderTextColor={COLORS.secondary}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            <View style={styles.inputContainer}>
              <Icon name="phone" size={20} color={COLORS.secondary} style={styles.icon} />
              <TextInput
                style={styles.input}
                placeholder={t('phone')}
                placeholderTextColor={COLORS.secondary}
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
              />
            </View>

            <View style={styles.inputContainer}>
              <Icon name="lock" size={20} color={COLORS.secondary} style={styles.icon} />
              <TextInput
                style={styles.input}
                placeholder={t('password')}
                placeholderTextColor={COLORS.secondary}
                secureTextEntry
                value={password}
                onChangeText={setPassword}
              />
            </View>

            <TouchableOpacity style={styles.registerBtn} onPress={handleRegister} disabled={isLoading}>
              {isLoading ? <ActivityIndicator color="#000" /> : <Text style={styles.registerBtnText}>{t('register')}</Text>}
            </TouchableOpacity>

            <View style={styles.loginContainer}>
              <Text style={styles.loginText}>{t('already_have_account')} </Text>
              <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                <Text style={styles.loginLink}>{t('login')}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  inner: {
    flex: 1,
  },
  scroll: {
    padding: SIZES.padding * 2,
    flexGrow: 1,
    justifyContent: 'center',
  },
  backBtn: {
    position: 'absolute',
    top: 20,
    left: 20,
    zIndex: 10,
    padding: 10,
    backgroundColor: COLORS.surface,
    borderRadius: SIZES.radiusSm,
  },
  header: {
    marginTop: 60,
    marginBottom: 40,
  },
  title: {
    color: COLORS.text,
    fontSize: SIZES.fontXxl,
    fontWeight: 'bold',
  },
  subtitle: {
    color: COLORS.primary,
    fontSize: SIZES.fontLg,
    marginTop: 5,
  },
  form: {
    width: '100%',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: SIZES.radius,
    marginBottom: 20,
    paddingHorizontal: 20,
    borderWidth: 1,
    borderColor: COLORS.surfaceLight,
  },
  icon: {
    marginRight: 15,
  },
  input: {
    flex: 1,
    color: COLORS.text,
    paddingVertical: 18,
    fontSize: SIZES.fontMd,
  },
  registerBtn: {
    backgroundColor: COLORS.primary,
    padding: 18,
    borderRadius: SIZES.radius,
    alignItems: 'center',
    marginTop: 10,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  registerBtnText: {
    color: '#000',
    fontSize: SIZES.fontLg,
    fontWeight: 'bold',
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 30,
  },
  loginText: {
    color: COLORS.secondary,
    fontSize: SIZES.fontMd,
  },
  loginLink: {
    color: COLORS.primary,
    fontSize: SIZES.fontMd,
    fontWeight: 'bold',
  }
});

export default RegisterScreen;
