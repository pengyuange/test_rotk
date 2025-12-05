export interface ReminderTime {
  hour: number;
  minute: number;
}

export interface ReminderSettings {
  morningTime: ReminderTime;
  eveningTime: ReminderTime;
  activeDays: number[];
  enabled: boolean;
}

export interface CheckInStatus {
  date: string;
  morningChecked: boolean;
  eveningChecked: boolean;
}

export type CheckInType = 'morning' | 'evening';
