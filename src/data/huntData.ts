// Hunt content for the demo. Same shape as the original Lets-Roam-Hunt-Demo/hunt-data.js
// (window.HUNT_DATA), extended to 6 stops around Denver Central Library.
// - "library" is unchanged from the original; the other 5 stops are dummy data.
// - The hunt screen lists LOCATIONS ONLY (hunt > locations > challenges), so the
//   three original standalone challenges are kept under "_unused_*" for reference.
// - Each location: check-in 100 pts + its challenges = totalLocationPoints.
// Edit freely: the UI is driven entirely by this file.
import type { HuntData } from './types';

const huntData: HuntData = {
  "group": {
    "info": {
      "groupId": "offline-demo",
      "teamName": "The Roaming Crew",
      "huntType": "scavaHunt",
      "classic_hunt": true,
      "score": 0,
      "rankPercentile": 50,
      "groupPhoto": "team.jpg",
      "huntStarted": true,
      "huntIntroDone": true,
      "players": {}
    }
  },
  "event": {
    "info": {}
  },
  "app_info": {},
  "user": {
    "info": {
      "userId": "demo"
    }
  },
  "playerChallenges": {
    "playerChallengeData": {}
  },
  "location": {
    "region": {
      "latitude": 39.7371,
      "longitude": -104.987
    }
  },
  "game_v2": {
    "timerStart": 1,
    "timerLimitMinutes": 90,
    "locationId": "library",
    "currentLocationId": "library",
    "locationList": [
      "library",
      "artmuseum",
      "mint",
      "civiccenter",
      "capitol",
      "historycolorado"
    ],
    "classicChallengeList": [
      "library",
      "artmuseum",
      "mint",
      "civiccenter",
      "capitol",
      "historycolorado"
    ],
    "locations": {
      "library": {
        "locationId": "library",
        "name": "Denver Central Library",
        "address": "10 W 14th Avenue Parkway, Denver, CO",
        "lat": 39.7371,
        "long": -104.987,
        "description": "Explore the details of the library together. Look closely at the entrance and the architecture to find the answers to these challenges.",
        "challengeList": [
          "columns",
          "symbol",
          "teamphoto"
        ],
        "points": 100,
        "totalLocationPoints": 400,
        "photoLarge": "library.jpg"
      },
      "artmuseum": {
        "locationId": "artmuseum",
        "name": "Denver Art Museum",
        "address": "100 W 14th Avenue Parkway, Denver, CO",
        "lat": 39.7373,
        "long": -104.9893,
        "description": "Just across the plaza, the museum's angular Hamilton Building looks ready to take off. Circle the outside and the sculptures around it.",
        "challengeList": [
          "dam_cladding",
          "dam_architect",
          "dam_sweep"
        ],
        "points": 100,
        "totalLocationPoints": 400,
        "photoLarge": ""
      },
      "mint": {
        "locationId": "mint",
        "name": "U.S. Mint at Denver",
        "address": "320 W Colfax Avenue, Denver, CO",
        "lat": 39.7397,
        "long": -104.9922,
        "description": "Billions of coins start life inside these walls. Take a look at the facade and think like a coin collector.",
        "challengeList": [
          "mint_mark",
          "mint_facade",
          "mint_pose"
        ],
        "points": 100,
        "totalLocationPoints": 400,
        "photoLarge": ""
      },
      "civiccenter": {
        "locationId": "civiccenter",
        "name": "Civic Center Park",
        "address": "101 W 14th Avenue, Denver, CO",
        "lat": 39.7394,
        "long": -104.9876,
        "description": "Denver's front lawn, framed by the Capitol on one side and the City and County Building on the other. Find the statues and the open-air stage.",
        "challengeList": [
          "cc_theater",
          "cc_statue",
          "cc_stage"
        ],
        "points": 100,
        "totalLocationPoints": 400,
        "photoLarge": ""
      },
      "capitol": {
        "locationId": "capitol",
        "name": "Colorado State Capitol",
        "address": "200 E Colfax Avenue, Denver, CO",
        "lat": 39.7393,
        "long": -104.9848,
        "description": "Climb the west steps and look up. This is where the Mile High City earns its name.",
        "challengeList": [
          "cap_dome",
          "cap_mile",
          "cap_view",
          "cap_steps"
        ],
        "points": 100,
        "totalLocationPoints": 500,
        "photoLarge": ""
      },
      "historycolorado": {
        "locationId": "historycolorado",
        "name": "History Colorado Center",
        "address": "1200 N Broadway, Denver, CO",
        "lat": 39.7359,
        "long": -104.9873,
        "description": "The last stop tells the story of the whole state. Look for clues in the building and the plaza out front.",
        "challengeList": [
          "hc_street",
          "hc_portrait",
          "hc_finale"
        ],
        "points": 100,
        "totalLocationPoints": 400,
        "photoLarge": ""
      }
    },
    "allChallenges": {
      "library": {
        "challengeId": "library",
        "locationId": "library",
        "type": "location",
        "name": "Denver Central Library",
        "lat": 39.7371,
        "long": -104.987,
        "points": 100,
        "challengeList": [
          "columns",
          "symbol",
          "teamphoto"
        ]
      },
      "artmuseum": {
        "challengeId": "artmuseum",
        "locationId": "artmuseum",
        "type": "location",
        "name": "Denver Art Museum",
        "lat": 39.7373,
        "long": -104.9893,
        "points": 100,
        "challengeList": [
          "dam_cladding",
          "dam_architect",
          "dam_sweep"
        ]
      },
      "mint": {
        "challengeId": "mint",
        "locationId": "mint",
        "type": "location",
        "name": "U.S. Mint at Denver",
        "lat": 39.7397,
        "long": -104.9922,
        "points": 100,
        "challengeList": [
          "mint_mark",
          "mint_facade",
          "mint_pose"
        ]
      },
      "civiccenter": {
        "challengeId": "civiccenter",
        "locationId": "civiccenter",
        "type": "location",
        "name": "Civic Center Park",
        "lat": 39.7394,
        "long": -104.9876,
        "points": 100,
        "challengeList": [
          "cc_theater",
          "cc_statue",
          "cc_stage"
        ]
      },
      "capitol": {
        "challengeId": "capitol",
        "locationId": "capitol",
        "type": "location",
        "name": "Colorado State Capitol",
        "lat": 39.7393,
        "long": -104.9848,
        "points": 100,
        "challengeList": [
          "cap_dome",
          "cap_mile",
          "cap_view",
          "cap_steps"
        ]
      },
      "historycolorado": {
        "challengeId": "historycolorado",
        "locationId": "historycolorado",
        "type": "location",
        "name": "History Colorado Center",
        "lat": 39.7359,
        "long": -104.9873,
        "points": 100,
        "challengeList": [
          "hc_street",
          "hc_portrait",
          "hc_finale"
        ]
      },
      "columns": {
        "challengeId": "columns",
        "locationId": "library",
        "type": "multiple_choice",
        "name": "Grand Entrance",
        "question": "How many columns frame the entrance?",
        "points": 100,
        "answers": [
          "Two",
          "Four",
          "Six"
        ],
        "correctAnswer": "Four"
      },
      "symbol": {
        "challengeId": "symbol",
        "locationId": "library",
        "type": "multiple_choice",
        "name": "Look Above",
        "question": "Which symbol appears above the doorway?",
        "points": 100,
        "answers": [
          "A book",
          "An anchor",
          "A crown"
        ],
        "correctAnswer": "A book"
      },
      "teamphoto": {
        "challengeId": "teamphoto",
        "locationId": "library",
        "type": "photo",
        "name": "Living Bookshelf",
        "question": "Pose as a living bookshelf with your team.",
        "points": 100
      },
      "dam_cladding": {
        "challengeId": "dam_cladding",
        "locationId": "artmuseum",
        "type": "multiple_choice",
        "name": "Shiny Skin",
        "question": "What metal covers the angular Hamilton Building?",
        "points": 100,
        "answers": [
          "Copper",
          "Titanium",
          "Aluminum"
        ],
        "correctAnswer": "Titanium"
      },
      "dam_architect": {
        "challengeId": "dam_architect",
        "locationId": "artmuseum",
        "type": "multiple_choice",
        "name": "Who Drew This?",
        "question": "Which architect designed the Hamilton Building?",
        "points": 100,
        "answers": [
          "Daniel Libeskind",
          "Frank Gehry",
          "Zaha Hadid"
        ],
        "correctAnswer": "Daniel Libeskind"
      },
      "dam_sweep": {
        "challengeId": "dam_sweep",
        "locationId": "artmuseum",
        "type": "photo",
        "name": "Clean Sweep",
        "question": "Find the giant dustpan sculpture and sweep your team into it.",
        "points": 100
      },
      "mint_mark": {
        "challengeId": "mint_mark",
        "locationId": "mint",
        "type": "multiple_choice",
        "name": "Mint Mark",
        "question": "Which letter marks coins made here?",
        "points": 100,
        "answers": [
          "M",
          "C",
          "D"
        ],
        "correctAnswer": "D"
      },
      "mint_facade": {
        "challengeId": "mint_facade",
        "locationId": "mint",
        "type": "multiple_choice",
        "name": "Built To Last",
        "question": "Which style best describes the Mint's facade?",
        "points": 100,
        "answers": [
          "Italian Renaissance",
          "Art Deco",
          "Modernist"
        ],
        "correctAnswer": "Italian Renaissance"
      },
      "mint_pose": {
        "challengeId": "mint_pose",
        "locationId": "mint",
        "type": "photo",
        "name": "Freshly Minted",
        "question": "Stack your team like a roll of shiny new coins.",
        "points": 100
      },
      "cc_theater": {
        "challengeId": "cc_theater",
        "locationId": "civiccenter",
        "type": "multiple_choice",
        "name": "Center Stage",
        "question": "What kind of theater sits in the park?",
        "points": 100,
        "answers": [
          "Greek amphitheater",
          "Opera house",
          "Drive-in"
        ],
        "correctAnswer": "Greek amphitheater"
      },
      "cc_statue": {
        "challengeId": "cc_statue",
        "locationId": "civiccenter",
        "type": "photo",
        "name": "Saddle Up",
        "question": "Find the bronze horse and rider statue and copy the pose.",
        "points": 100
      },
      "cc_stage": {
        "challengeId": "cc_stage",
        "locationId": "civiccenter",
        "type": "photo",
        "name": "Standing Ovation",
        "question": "Take the stage and give the park your best curtain call.",
        "points": 100
      },
      "cap_dome": {
        "challengeId": "cap_dome",
        "locationId": "capitol",
        "type": "multiple_choice",
        "name": "Golden Top",
        "question": "What makes the Capitol dome shine?",
        "points": 100,
        "answers": [
          "Gold leaf",
          "Brass paint",
          "Copper sheet"
        ],
        "correctAnswer": "Gold leaf"
      },
      "cap_mile": {
        "challengeId": "cap_mile",
        "locationId": "capitol",
        "type": "photo",
        "name": "Mile High",
        "question": "Find the step marked one mile above sea level and stand on it together.",
        "points": 100
      },
      "cap_view": {
        "challengeId": "cap_view",
        "locationId": "capitol",
        "type": "multiple_choice",
        "name": "Look West",
        "question": "What do you see on the horizon from the west steps?",
        "points": 100,
        "answers": [
          "The Rocky Mountains",
          "The ocean",
          "A desert"
        ],
        "correctAnswer": "The Rocky Mountains"
      },
      "cap_steps": {
        "challengeId": "cap_steps",
        "locationId": "capitol",
        "type": "photo",
        "name": "Law Makers",
        "question": "Pass a (made-up) law as a team and announce it from the steps.",
        "points": 100
      },
      "hc_street": {
        "challengeId": "hc_street",
        "locationId": "historycolorado",
        "type": "multiple_choice",
        "name": "Main Drag",
        "question": "Which street does the museum's address sit on?",
        "points": 100,
        "answers": [
          "Broadway",
          "Colfax",
          "Lincoln"
        ],
        "correctAnswer": "Broadway"
      },
      "hc_portrait": {
        "challengeId": "hc_portrait",
        "locationId": "historycolorado",
        "type": "photo",
        "name": "Pioneer Portrait",
        "question": "Recreate a stiff, old-timey family portrait. No smiling allowed.",
        "points": 100
      },
      "hc_finale": {
        "challengeId": "hc_finale",
        "locationId": "historycolorado",
        "type": "photo",
        "name": "Victory Lap",
        "question": "Celebrate finishing the hunt with your biggest team cheer.",
        "points": 100
      },
      "_unused_clock": {
        "challengeId": "clock",
        "type": "multiple_choice",
        "name": "Clock Tower",
        "question": "How many faces does the clock have?",
        "points": 100,
        "answers": [
          "Two",
          "Four",
          "Six"
        ],
        "correctAnswer": "Four"
      },
      "_unused_photo": {
        "challengeId": "photo",
        "type": "photo",
        "name": "Team Photo",
        "question": "Take a photo of your team striking your best explorer poses.",
        "points": 200
      },
      "_unused_statue": {
        "challengeId": "statue",
        "type": "multiple_choice",
        "name": "A Closer Look",
        "question": "What material is the statue made from?",
        "points": 100,
        "answers": [
          "Bronze",
          "Wood",
          "Glass"
        ],
        "correctAnswer": "Bronze"
      }
    }
  }
};

export default huntData;
