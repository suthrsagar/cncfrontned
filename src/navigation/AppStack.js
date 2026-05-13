import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Icon from 'react-native-vector-icons/FontAwesome5';
import Animated, { useSharedValue, useAnimatedStyle, withSpring, withTiming } from 'react-native-reanimated';
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

const CustomTabBarButton = ({ children, onPress, focused }) => {
  const scale = useSharedValue(1);
  const translateY = useSharedValue(0);
  const opacity = useSharedValue(0);

  React.useEffect(() => {
    if (focused) {
      scale.value = withSpring(1.15, { damping: 10, stiffness: 200 });
      translateY.value = withSpring(-12, { damping: 10, stiffness: 200 });
      opacity.value = withTiming(1, { duration: 200 });
    } else {
      scale.value = withSpring(1, { damping: 12, stiffness: 150 });
      translateY.value = withSpring(0, { damping: 12, stiffness: 150 });
      opacity.value = withTiming(0, { duration: 200 });
    }
  }, [focused]);

  const animatedIconWrapStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { scale: scale.value },
        { translateY: translateY.value }
      ],
      backgroundColor: focused ? COLORS.primary : 'transparent',
      shadowColor: COLORS.primary,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: focused ? 0.6 : 0,
      shadowRadius: 8,
      elevation: focused ? 8 : 0,
    };
  });

  const animatedDotStyle = useAnimatedStyle(() => {
    return {
      opacity: opacity.value,
      transform: [{ scale: opacity.value }]
    };
  });

  return (
    <TouchableOpacity
      style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}
      onPress={onPress}
      activeOpacity={1}
    >
      <Animated.View style={[styles.iconWrap, animatedIconWrapStyle]}>
        {children}
      </Animated.View>
      <Animated.View style={[styles.activeDot, animatedDotStyle]} />
    </TouchableOpacity>
  );
};

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
              <Icon name="compass" size={20} color={props.accessibilityState?.selected ? '#fff' : COLORS.secondary} solid={!!props.accessibilityState?.selected} />
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
              <Icon name="box-open" size={20} color={props.accessibilityState?.selected ? '#fff' : COLORS.secondary} solid={!!props.accessibilityState?.selected} />
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
              <Icon name="bookmark" size={20} color={props.accessibilityState?.selected ? '#fff' : COLORS.secondary} solid={!!props.accessibilityState?.selected} />
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
              <Icon name="user" size={20} color={props.accessibilityState?.selected ? '#fff' : COLORS.secondary} solid={!!props.accessibilityState?.selected} />
            </CustomTabBarButton>
          )
        }}
      />
    </Tab.Navigator>
  );
};

const AppStack = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
        presentation: 'card',
        animationDuration: 300
      }}
    >
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
      <Stack.Screen name="AdminNotifications" component={require('../screens/Admin/AdminNotificationsScreen').default} />

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
  activeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.primary,
    position: 'absolute',
    bottom: -5,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 8,
    elevation: 5,
  }
});

export default AppStack;
