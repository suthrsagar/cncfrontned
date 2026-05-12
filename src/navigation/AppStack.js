import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Icon from 'react-native-vector-icons/FontAwesome5';
import { COLORS, SHADOWS } from '../theme/theme';

import ExploreScreen from '../screens/Explore/ExploreScreen';
import OrdersScreen from '../screens/Orders/OrdersScreen';
import SavedScreen from '../screens/Saved/SavedScreen';
import ProfileScreen from '../screens/Profile/ProfileScreen';

// Admin Screens
import AdminDashboardScreen from '../screens/Admin/AdminDashboardScreen';
import AdminOrdersScreen from '../screens/Admin/AdminOrdersScreen';
import AdminUsersScreen from '../screens/Admin/AdminUsersScreen';
import AdminAddPostScreen from '../screens/Admin/AdminAddPostScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

const CustomTabBarButton = ({ children, onPress, focused }) => (
  <TouchableOpacity
    style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}
    onPress={onPress}
    activeOpacity={0.7}
  >
    <View style={[styles.iconWrap, focused && styles.iconWrapActive]}>
      {children}
    </View>
    {focused && <View style={styles.activeDot} />}
  </TouchableOpacity>
);

const BottomTabs = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: styles.tabBar,
        tabBarHideOnKeyboard: true,
      }}
    >
      <Tab.Screen 
        name="Explore" 
        component={ExploreScreen} 
        options={{
          tabBarButton: (props) => (
            <CustomTabBarButton {...props} focused={props.accessibilityState?.selected}>
              <Icon name="compass" size={22} color={props.accessibilityState?.selected ? '#000' : COLORS.secondary} solid={!!props.accessibilityState?.selected} />
            </CustomTabBarButton>
          )
        }}
      />
      <Tab.Screen 
        name="Orders" 
        component={OrdersScreen} 
        options={{
          tabBarButton: (props) => (
            <CustomTabBarButton {...props} focused={props.accessibilityState?.selected}>
              <Icon name="box-open" size={22} color={props.accessibilityState?.selected ? '#000' : COLORS.secondary} solid={!!props.accessibilityState?.selected} />
            </CustomTabBarButton>
          )
        }}
      />
      <Tab.Screen 
        name="Saved" 
        component={SavedScreen} 
        options={{
          tabBarButton: (props) => (
            <CustomTabBarButton {...props} focused={props.accessibilityState?.selected}>
              <Icon name="bookmark" size={22} color={props.accessibilityState?.selected ? '#000' : COLORS.secondary} solid={!!props.accessibilityState?.selected} />
            </CustomTabBarButton>
          )
        }}
      />
      <Tab.Screen 
        name="Profile" 
        component={ProfileScreen} 
        options={{
          tabBarButton: (props) => (
            <CustomTabBarButton {...props} focused={props.accessibilityState?.selected}>
              <Icon name="user" size={22} color={props.accessibilityState?.selected ? '#000' : COLORS.secondary} solid={!!props.accessibilityState?.selected} />
            </CustomTabBarButton>
          )
        }}
      />
    </Tab.Navigator>
  );
};

const AppStack = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="MainTabs" component={BottomTabs} />
      <Stack.Screen name="AdminDashboard" component={AdminDashboardScreen} />
      <Stack.Screen name="AdminOrders" component={AdminOrdersScreen} />
      <Stack.Screen name="AdminUsers" component={AdminUsersScreen} />
      <Stack.Screen name="AdminAddPost" component={AdminAddPostScreen} />
      <Stack.Screen name="AdminSettings" component={require('../screens/Admin/AdminSettingsScreen').default} />
      <Stack.Screen name="AdminBanners" component={require('../screens/Admin/AdminBannersScreen').default} />
      <Stack.Screen name="AdminSupportChats" component={require('../screens/Admin/AdminSupportChatsScreen').default} />
      <Stack.Screen name="AdminChatRoom" component={require('../screens/Admin/AdminChatRoomScreen').default} />
      <Stack.Screen name="AdminOrderDetail" component={require('../screens/Admin/AdminOrderDetailScreen').default} />
      
      <Stack.Screen name="DesignDetails" component={require('../screens/Explore/DesignDetailsScreen').default} />
      <Stack.Screen name="CustomerSupport" component={require('../screens/Profile/CustomerSupportScreen').default} />
      <Stack.Screen name="OrderDetail" component={require('../screens/Orders/OrderDetailScreen').default} />
    </Stack.Navigator>
  );
};

const styles = StyleSheet.create({
  tabBar: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    elevation: 0,
    backgroundColor: COLORS.surface, // Use theme surface
    borderRadius: 40,
    height: 70,
    borderWidth: 1,
    borderColor: COLORS.surfaceLight,
    ...SHADOWS.dark,
    paddingHorizontal: 15,
    paddingBottom: 0,
  },
  iconWrap: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconWrapActive: {
    backgroundColor: COLORS.primary + '15', // 15% opacity gold background
    transform: [{ translateY: -4 }],
  },
  activeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.primary,
    position: 'absolute',
    bottom: 6,
    ...SHADOWS.glow
  }
});

export default AppStack;
