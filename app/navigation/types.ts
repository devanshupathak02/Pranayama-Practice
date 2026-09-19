import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';

export type RootStackParamList = {
  Landing: undefined;
  Home: { initialTab?: 'pranayama' | 'yoga-nidra' } | undefined;
  RoutineDetail: { routineId: string };
  ActiveSession: undefined;
  History: undefined;
  Settings: undefined;
  RoutineBuilder: { routineId?: string };
};

export type LandingScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'Landing'
>;

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

export type RoutineBuilderScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'RoutineBuilder'
>;

export type LandingScreenRouteProp = RouteProp<RootStackParamList, 'Landing'>;
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
export type RoutineBuilderScreenRouteProp = RouteProp<
  RootStackParamList,
  'RoutineBuilder'
>;
