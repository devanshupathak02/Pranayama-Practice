import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';

export type RootStackParamList = {
  Home: undefined;
  RoutineDetail: { routineId: string };
  ActiveSession: undefined;
  History: undefined;
  Settings: undefined;
};

export type HomeScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'Home'
>;

export type RoutineDetailScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'RoutineDetail'
>;

export type ActiveSessionScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'ActiveSession'
>;

export type HistoryScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'History'
>;

export type SettingsScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'Settings'
>;

export type HomeScreenRouteProp = RouteProp<RootStackParamList, 'Home'>;
export type RoutineDetailScreenRouteProp = RouteProp<
  RootStackParamList,
  'RoutineDetail'
>;
export type ActiveSessionScreenRouteProp = RouteProp<
  RootStackParamList,
  'ActiveSession'
>;
export type HistoryScreenRouteProp = RouteProp<RootStackParamList, 'History'>;
export type SettingsScreenRouteProp = RouteProp<RootStackParamList, 'Settings'>;
