// Types for the hunt-data shape used by the original demo (window.HUNT_DATA).
// Only the fields the hunt screen reads are typed strictly; the rest stay open.

export type ChallengeType = 'location' | 'multiple_choice' | 'photo';

export interface Challenge {
  challengeId: string;
  locationId?: string;
  type: ChallengeType;
  name: string;
  question?: string;
  points: number;
  answers?: string[];
  correctAnswer?: string;
  lat?: number;
  long?: number;
  challengeList?: string[];
}

export interface HuntLocation {
  locationId: string;
  name: string;
  address: string;
  lat: number;
  long: number;
  description: string;
  challengeList: string[];
  /** Points for checking in at this location. */
  points: number;
  /** Check-in points + all challenge points. */
  totalLocationPoints: number;
  /** File name under assets/images, or "" for none. */
  photoLarge: string;
}

export interface HuntData {
  group: {
    info: {
      groupId: string;
      teamName: string;
      huntType: string;
      classic_hunt: boolean;
      score: number;
      rankPercentile: number;
      groupPhoto: string;
      huntStarted: boolean;
      huntIntroDone: boolean;
      players: Record<string, unknown>;
    };
  };
  event: { info: Record<string, unknown> };
  app_info: Record<string, unknown>;
  user: { info: { userId: string } };
  playerChallenges: { playerChallengeData: Record<string, unknown> };
  location: { region: { latitude: number; longitude: number } };
  game_v2: {
    timerStart: number;
    timerLimitMinutes: number;
    locationId: string;
    currentLocationId: string;
    locationList: string[];
    classicChallengeList: string[];
    locations: Record<string, HuntLocation>;
    allChallenges: Record<string, Challenge>;
  };
}
