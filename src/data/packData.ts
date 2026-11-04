// Generated from packs.js and regional-prices.js by npm run sync:expo-data.

import type { Pool, PackTier, TicketRule } from "@/domain/types";

export const MONTHLY_DIA = 7060;

export const DIA_PER_PULL = 150;

export const OFFICIAL_TICKET_RULES: Record<Pool, TicketRule> = {
  "日卡池": {
    "initial": 10,
    "milestones": [
      {
        "every": 10,
        "reward": 1,
        "maxReward": 10
      }
    ]
  },
  "混池": {
    "initial": 10,
    "milestones": [
      {
        "at": 50,
        "reward": 5
      },
      {
        "at": 100,
        "reward": 5
      },
      {
        "at": 150,
        "reward": 5
      },
      {
        "at": 250,
        "reward": 5
      }
    ]
  },
  "月卡池": {
    "initial": 0,
    "milestones": [
      {
        "every": 5,
        "reward": 1,
        "from": 5,
        "to": 50
      },
      {
        "every": 10,
        "reward": 2,
        "from": 60,
        "to": 100
      }
    ]
  },
  "生日池": {
    "initial": 20,
    "milestones": []
  },
  "月卡復刻池": {
    "initial": 0,
    "milestones": [
      {
        "at": 10,
        "reward": 2
      },
      {
        "at": 20,
        "reward": 2
      },
      {
        "at": 30,
        "reward": 2
      },
      {
        "at": 40,
        "reward": 2
      },
      {
        "at": 50,
        "reward": 2
      },
      {
        "at": 75,
        "reward": 5
      },
      {
        "at": 100,
        "reward": 5
      }
    ]
  },
  "生日復刻池": {
    "initial": 0,
    "milestones": []
  },
  "混池復刻池": {
    "initial": 0,
    "milestones": [
      {
        "at": 50,
        "reward": 5
      },
      {
        "at": 100,
        "reward": 5
      },
      {
        "at": 150,
        "reward": 5
      }
    ]
  },
  "協會補給": {
    "initial": 0,
    "milestones": []
  },
  "其他": {
    "initial": 0,
    "milestones": []
  }
};

export const PACK_DATA: Record<Pool, PackTier[]> = {
  "日卡池": [
    {
      "tier": "一",
      "price": 15,
      "qty": 5,
      "packPulls": 1,
      "cumPulls": 5,
      "cumCost": 75,
      "per": 15
    },
    {
      "tier": "二",
      "price": 30,
      "qty": 5,
      "packPulls": 2,
      "cumPulls": 15,
      "cumCost": 225,
      "per": 15
    },
    {
      "tier": "三",
      "price": 150,
      "qty": 5,
      "packPulls": 6,
      "cumPulls": 45,
      "cumCost": 975,
      "per": 25
    },
    {
      "tier": "四",
      "price": 320,
      "qty": 5,
      "packPulls": 10,
      "cumPulls": 95,
      "cumCost": 2575,
      "per": 32
    },
    {
      "tier": "五",
      "price": 390,
      "qty": 3,
      "packPulls": 12,
      "cumPulls": 131,
      "cumCost": 3745,
      "per": 32.5
    },
    {
      "tier": "六",
      "price": 820,
      "qty": 10,
      "packPulls": 20,
      "cumPulls": 331,
      "cumCost": 11945,
      "per": 41
    },
    {
      "tier": "七",
      "price": 1690,
      "qty": 1,
      "packPulls": 40,
      "cumPulls": 371,
      "cumCost": 13635,
      "per": 42.25
    }
  ],
  "混池": [
    {
      "tier": "一",
      "price": 15,
      "qty": 5,
      "packPulls": 1,
      "cumPulls": 5,
      "cumCost": 75,
      "per": 15
    },
    {
      "tier": "二",
      "price": 30,
      "qty": 3,
      "packPulls": 2,
      "cumPulls": 11,
      "cumCost": 165,
      "per": 15
    },
    {
      "tier": "三",
      "price": 150,
      "qty": 5,
      "packPulls": 6,
      "cumPulls": 41,
      "cumCost": 915,
      "per": 25
    },
    {
      "tier": "四",
      "price": 320,
      "qty": 5,
      "packPulls": 10,
      "cumPulls": 91,
      "cumCost": 2515,
      "per": 32
    },
    {
      "tier": "五",
      "price": 390,
      "qty": 5,
      "packPulls": 12,
      "cumPulls": 151,
      "cumCost": 4465,
      "per": 32.5
    },
    {
      "tier": "六",
      "price": 590,
      "qty": 3,
      "packPulls": 16,
      "cumPulls": 199,
      "cumCost": 6235,
      "per": 36.88
    },
    {
      "tier": "七",
      "price": 820,
      "qty": 10,
      "packPulls": 20,
      "cumPulls": 399,
      "cumCost": 14435,
      "per": 41
    },
    {
      "tier": "八",
      "price": 1690,
      "qty": 1,
      "packPulls": 40,
      "cumPulls": 439,
      "cumCost": 16125,
      "per": 42.25
    }
  ],
  "月卡池": [
    {
      "tier": "一",
      "price": 15,
      "qty": 3,
      "packPulls": 1,
      "cumPulls": 3,
      "cumCost": 45,
      "per": 15
    },
    {
      "tier": "二",
      "price": 30,
      "qty": 3,
      "packPulls": 2,
      "cumPulls": 9,
      "cumCost": 135,
      "per": 15
    },
    {
      "tier": "三",
      "price": 150,
      "qty": 3,
      "packPulls": 6,
      "cumPulls": 27,
      "cumCost": 585,
      "per": 25
    },
    {
      "tier": "四",
      "price": 290,
      "qty": 2,
      "packPulls": 10,
      "cumPulls": 47,
      "cumCost": 1165,
      "per": 29
    },
    {
      "tier": "五",
      "price": 390,
      "qty": 2,
      "packPulls": 12,
      "cumPulls": 71,
      "cumCost": 1945,
      "per": 32.5
    },
    {
      "tier": "六",
      "price": 820,
      "qty": 10,
      "packPulls": 20,
      "cumPulls": 271,
      "cumCost": 10145,
      "per": 41
    },
    {
      "tier": "七",
      "price": 1490,
      "qty": 1,
      "packPulls": null,
      "cumPulls": 271,
      "cumCost": 11635,
      "per": null
    }
  ],
  "生日池": [
    {
      "tier": "一",
      "price": 15,
      "qty": 3,
      "packPulls": 1,
      "cumPulls": 3,
      "cumCost": 45,
      "per": 15
    },
    {
      "tier": "二",
      "price": 30,
      "qty": 3,
      "packPulls": 2,
      "cumPulls": 9,
      "cumCost": 135,
      "per": 15
    },
    {
      "tier": "三",
      "price": 150,
      "qty": 3,
      "packPulls": 6,
      "cumPulls": 27,
      "cumCost": 585,
      "per": 25
    },
    {
      "tier": "四",
      "price": 290,
      "qty": 2,
      "packPulls": 10,
      "cumPulls": 47,
      "cumCost": 1165,
      "per": 29
    },
    {
      "tier": "五",
      "price": 390,
      "qty": 2,
      "packPulls": 12,
      "cumPulls": 71,
      "cumCost": 1945,
      "per": 32.5
    },
    {
      "tier": "六",
      "price": 820,
      "qty": 10,
      "packPulls": 20,
      "cumPulls": 271,
      "cumCost": 10145,
      "per": 41
    },
    {
      "tier": "七",
      "price": 1490,
      "qty": 1,
      "packPulls": null,
      "cumPulls": 271,
      "cumCost": 11635,
      "per": null
    }
  ],
  "月卡復刻池": [
    {
      "tier": "一",
      "price": 30,
      "qty": 1,
      "packPulls": 2,
      "cumPulls": 2,
      "cumCost": 30,
      "per": 15
    },
    {
      "tier": "二",
      "price": 150,
      "qty": 1,
      "packPulls": 6,
      "cumPulls": 8,
      "cumCost": 180,
      "per": 25
    },
    {
      "tier": "三",
      "price": 320,
      "qty": 1,
      "packPulls": 10,
      "cumPulls": 18,
      "cumCost": 500,
      "per": 32
    },
    {
      "tier": "四",
      "price": 390,
      "qty": 3,
      "packPulls": 12,
      "cumPulls": 54,
      "cumCost": 1670,
      "per": 32.5
    },
    {
      "tier": "五",
      "price": 820,
      "qty": 10,
      "packPulls": 20,
      "cumPulls": 254,
      "cumCost": 9870,
      "per": 41
    }
  ],
  "生日復刻池": [
    {
      "tier": "一",
      "price": 30,
      "qty": 1,
      "packPulls": 2,
      "cumPulls": 2,
      "cumCost": 30,
      "per": 15
    },
    {
      "tier": "二",
      "price": 150,
      "qty": 1,
      "packPulls": 6,
      "cumPulls": 8,
      "cumCost": 180,
      "per": 25
    },
    {
      "tier": "三",
      "price": 320,
      "qty": 1,
      "packPulls": 10,
      "cumPulls": 18,
      "cumCost": 500,
      "per": 32
    },
    {
      "tier": "四",
      "price": 390,
      "qty": 3,
      "packPulls": 12,
      "cumPulls": 54,
      "cumCost": 1670,
      "per": 32.5
    },
    {
      "tier": "五",
      "price": 820,
      "qty": 10,
      "packPulls": 20,
      "cumPulls": 254,
      "cumCost": 9870,
      "per": 41
    }
  ],
  "混池復刻池": [
    {
      "tier": "一",
      "price": 30,
      "qty": 1,
      "packPulls": 2,
      "cumPulls": 2,
      "cumCost": 30,
      "per": 15,
      "source": "references/prices/混池復刻－台幣.PNG",
      "received": "2026-10-19"
    },
    {
      "tier": "二",
      "price": 150,
      "qty": 1,
      "packPulls": 6,
      "cumPulls": 8,
      "cumCost": 180,
      "per": 25,
      "source": "references/prices/混池復刻－台幣.PNG",
      "received": "2026-10-19"
    },
    {
      "tier": "三",
      "price": 320,
      "qty": 1,
      "packPulls": 10,
      "cumPulls": 18,
      "cumCost": 500,
      "per": 32,
      "source": "references/prices/混池復刻－台幣.PNG",
      "received": "2026-10-19"
    },
    {
      "tier": "四",
      "price": 390,
      "qty": 3,
      "packPulls": 12,
      "cumPulls": 54,
      "cumCost": 1670,
      "per": 32.5,
      "source": "references/prices/混池復刻－台幣.PNG",
      "received": "2026-10-19"
    },
    {
      "tier": "五",
      "price": 590,
      "qty": 3,
      "packPulls": 16,
      "cumPulls": 102,
      "cumCost": 3440,
      "per": 36.875,
      "source": "references/prices/混池復刻－台幣.PNG",
      "received": "2026-10-19"
    },
    {
      "tier": "六",
      "price": 820,
      "qty": 10,
      "packPulls": 20,
      "cumPulls": 302,
      "cumCost": 11640,
      "per": 41,
      "source": "references/prices/混池復刻－台幣.PNG",
      "received": "2026-10-19"
    }
  ],
  "協會補給": [
    {
      "tier": "Lv10",
      "price": 30,
      "packPulls": 2,
      "cumPulls": 2,
      "cumCost": 30,
      "per": 15
    },
    {
      "tier": "Lv15",
      "price": 150,
      "packPulls": 6,
      "cumPulls": 8,
      "cumCost": 180,
      "per": 25
    },
    {
      "tier": "Lv20",
      "price": 220,
      "packPulls": 8,
      "cumPulls": 16,
      "cumCost": 400,
      "per": 27.5
    },
    {
      "tier": "Lv25",
      "price": 320,
      "packPulls": 12,
      "cumPulls": 28,
      "cumCost": 720,
      "per": 26.67
    },
    {
      "tier": "Lv30",
      "price": 490,
      "packPulls": 15,
      "cumPulls": 43,
      "cumCost": 1210,
      "per": 32.67
    },
    {
      "tier": "Lv35",
      "price": 590,
      "packPulls": 20,
      "cumPulls": 63,
      "cumCost": 1800,
      "per": 29.5
    },
    {
      "tier": "Lv40",
      "price": 890,
      "packPulls": 30,
      "cumPulls": 93,
      "cumCost": 2690,
      "per": 29.67
    },
    {
      "tier": "Lv50",
      "price": 1490,
      "packPulls": 50,
      "cumPulls": 143,
      "cumCost": 4180,
      "per": 29.8
    },
    {
      "tier": "Lv60",
      "price": 1790,
      "packPulls": 60,
      "cumPulls": 203,
      "cumCost": 5970,
      "per": 29.83
    },
    {
      "tier": "Lv65",
      "price": 2990,
      "packPulls": 100,
      "cumPulls": 303,
      "cumCost": 8960,
      "per": 29.9
    }
  ],
  "其他": []
};

export const PACK_OTHER = [
  {
    "name": "周卡",
    "price": 220,
    "per": 31.4
  },
  {
    "name": "特別密約",
    "price": 320,
    "per": 26.6
  },
  {
    "name": "升級版特別密約（只計金券）",
    "price": 490,
    "per": 40.8
  }
];

export const REGIONAL_PACK_PRICES = [
  {
    "pool": "月卡復刻池",
    "tier": "一",
    "currency": "HKD",
    "twdPrice": 30,
    "price": 8,
    "source": "references/prices/月卡生日卡復刻池-港幣.JPG",
    "platform": "未提供",
    "received": "2026-10-07"
  },
  {
    "pool": "月卡復刻池",
    "tier": "二",
    "currency": "HKD",
    "twdPrice": 150,
    "price": 38,
    "source": "references/prices/月卡生日卡復刻池-港幣.JPG",
    "platform": "未提供",
    "received": "2026-10-07"
  },
  {
    "pool": "月卡復刻池",
    "tier": "三",
    "currency": "HKD",
    "twdPrice": 320,
    "price": 68,
    "source": "references/prices/月卡生日卡復刻池-港幣.JPG",
    "platform": "未提供",
    "received": "2026-10-07"
  },
  {
    "pool": "月卡復刻池",
    "tier": "四",
    "currency": "HKD",
    "twdPrice": 390,
    "price": 98,
    "source": "references/prices/月卡生日卡復刻池-港幣.JPG",
    "platform": "未提供",
    "received": "2026-10-07"
  },
  {
    "pool": "月卡復刻池",
    "tier": "五",
    "currency": "HKD",
    "twdPrice": 820,
    "price": 218,
    "source": "references/prices/月卡生日卡復刻池-港幣.JPG",
    "platform": "未提供",
    "received": "2026-10-07"
  },
  {
    "pool": "生日復刻池",
    "tier": "一",
    "currency": "HKD",
    "twdPrice": 30,
    "price": 8,
    "source": "references/prices/月卡生日卡復刻池-港幣.JPG",
    "platform": "未提供",
    "received": "2026-10-07"
  },
  {
    "pool": "生日復刻池",
    "tier": "二",
    "currency": "HKD",
    "twdPrice": 150,
    "price": 38,
    "source": "references/prices/月卡生日卡復刻池-港幣.JPG",
    "platform": "未提供",
    "received": "2026-10-07"
  },
  {
    "pool": "生日復刻池",
    "tier": "三",
    "currency": "HKD",
    "twdPrice": 320,
    "price": 68,
    "source": "references/prices/月卡生日卡復刻池-港幣.JPG",
    "platform": "未提供",
    "received": "2026-10-07"
  },
  {
    "pool": "生日復刻池",
    "tier": "四",
    "currency": "HKD",
    "twdPrice": 390,
    "price": 98,
    "source": "references/prices/月卡生日卡復刻池-港幣.JPG",
    "platform": "未提供",
    "received": "2026-10-07"
  },
  {
    "pool": "生日復刻池",
    "tier": "五",
    "currency": "HKD",
    "twdPrice": 820,
    "price": 218,
    "source": "references/prices/月卡生日卡復刻池-港幣.JPG",
    "platform": "未提供",
    "received": "2026-10-07"
  },
  {
    "pool": "混池",
    "tier": "一",
    "currency": "HKD",
    "twdPrice": 15,
    "price": 5,
    "source": "references/prices/混池-港幣.JPG",
    "platform": "未提供",
    "received": "2026-10-07"
  },
  {
    "pool": "混池",
    "tier": "二",
    "currency": "HKD",
    "twdPrice": 30,
    "price": 8,
    "source": "references/prices/混池-港幣.JPG",
    "platform": "未提供",
    "received": "2026-10-07"
  },
  {
    "pool": "混池",
    "tier": "三",
    "currency": "HKD",
    "twdPrice": 150,
    "price": 38,
    "source": "references/prices/混池-港幣.JPG",
    "platform": "未提供",
    "received": "2026-10-07"
  },
  {
    "pool": "混池",
    "tier": "四",
    "currency": "HKD",
    "twdPrice": 320,
    "price": 78,
    "source": "references/prices/混池-港幣.JPG",
    "platform": "未提供",
    "received": "2026-10-07"
  },
  {
    "pool": "混池",
    "tier": "五",
    "currency": "HKD",
    "twdPrice": 390,
    "price": 98,
    "source": "references/prices/混池-港幣.JPG",
    "platform": "未提供",
    "received": "2026-10-07"
  },
  {
    "pool": "混池",
    "tier": "六",
    "currency": "HKD",
    "twdPrice": 590,
    "price": 168,
    "source": "references/prices/混池-港幣.JPG",
    "platform": "未提供",
    "received": "2026-10-07"
  },
  {
    "pool": "混池",
    "tier": "七",
    "currency": "HKD",
    "twdPrice": 820,
    "price": 218,
    "source": "references/prices/混池-港幣.JPG",
    "platform": "未提供",
    "received": "2026-10-07"
  },
  {
    "pool": "混池",
    "tier": "八",
    "currency": "HKD",
    "twdPrice": 1690,
    "price": 428,
    "source": "references/prices/混池-港幣.JPG",
    "platform": "未提供",
    "received": "2026-10-07"
  },
  {
    "pool": "生日池",
    "tier": "一",
    "currency": "HKD",
    "twdPrice": 15,
    "price": 5,
    "source": "references/prices/生日池-港幣.JPG",
    "platform": "未提供",
    "received": "2026-10-19"
  },
  {
    "pool": "生日池",
    "tier": "二",
    "currency": "HKD",
    "twdPrice": 30,
    "price": 8,
    "source": "references/prices/生日池-港幣.JPG",
    "platform": "未提供",
    "received": "2026-10-19"
  },
  {
    "pool": "生日池",
    "tier": "三",
    "currency": "HKD",
    "twdPrice": 150,
    "price": 38,
    "source": "references/prices/生日池-港幣.JPG",
    "platform": "未提供",
    "received": "2026-10-19"
  },
  {
    "pool": "生日池",
    "tier": "四",
    "currency": "HKD",
    "twdPrice": 290,
    "price": 68,
    "source": "references/prices/生日池-港幣.JPG",
    "platform": "未提供",
    "received": "2026-10-19"
  },
  {
    "pool": "生日池",
    "tier": "五",
    "currency": "HKD",
    "twdPrice": 390,
    "price": 98,
    "source": "references/prices/生日池-港幣.JPG",
    "platform": "未提供",
    "received": "2026-10-19"
  },
  {
    "pool": "生日池",
    "tier": "六",
    "currency": "HKD",
    "twdPrice": 820,
    "price": 218,
    "source": "references/prices/生日池-港幣.JPG",
    "platform": "未提供",
    "received": "2026-10-19"
  },
  {
    "pool": "生日池",
    "tier": "七",
    "currency": "HKD",
    "twdPrice": 1490,
    "price": 368,
    "source": "references/prices/生日池-港幣.JPG",
    "platform": "未提供",
    "received": "2026-10-19"
  },
  {
    "pool": "月卡復刻池",
    "tier": "一",
    "currency": "MYR",
    "twdPrice": 30,
    "price": 4.9,
    "source": "references/prices/月卡生日卡復刻池-馬幣.jpg",
    "platform": "未提供",
    "received": "2026-10-07"
  },
  {
    "pool": "月卡復刻池",
    "tier": "二",
    "currency": "MYR",
    "twdPrice": 150,
    "price": 22.9,
    "source": "references/prices/月卡生日卡復刻池-馬幣.jpg",
    "platform": "未提供",
    "received": "2026-10-07"
  },
  {
    "pool": "月卡復刻池",
    "tier": "三",
    "currency": "MYR",
    "twdPrice": 320,
    "price": 39.9,
    "source": "references/prices/月卡生日卡復刻池-馬幣.jpg",
    "platform": "未提供",
    "received": "2026-10-07"
  },
  {
    "pool": "月卡復刻池",
    "tier": "四",
    "currency": "MYR",
    "twdPrice": 390,
    "price": 59.9,
    "source": "references/prices/月卡生日卡復刻池-馬幣.jpg",
    "platform": "未提供",
    "received": "2026-10-07"
  },
  {
    "pool": "月卡復刻池",
    "tier": "五",
    "currency": "MYR",
    "twdPrice": 820,
    "price": 124.9,
    "source": "references/prices/月卡生日卡復刻池-馬幣.jpg",
    "platform": "未提供",
    "received": "2026-10-07"
  },
  {
    "pool": "生日復刻池",
    "tier": "一",
    "currency": "MYR",
    "twdPrice": 30,
    "price": 4.9,
    "source": "references/prices/月卡生日卡復刻池-馬幣.jpg",
    "platform": "未提供",
    "received": "2026-10-07"
  },
  {
    "pool": "生日復刻池",
    "tier": "二",
    "currency": "MYR",
    "twdPrice": 150,
    "price": 22.9,
    "source": "references/prices/月卡生日卡復刻池-馬幣.jpg",
    "platform": "未提供",
    "received": "2026-10-07"
  },
  {
    "pool": "生日復刻池",
    "tier": "三",
    "currency": "MYR",
    "twdPrice": 320,
    "price": 39.9,
    "source": "references/prices/月卡生日卡復刻池-馬幣.jpg",
    "platform": "未提供",
    "received": "2026-10-07"
  },
  {
    "pool": "生日復刻池",
    "tier": "四",
    "currency": "MYR",
    "twdPrice": 390,
    "price": 59.9,
    "source": "references/prices/月卡生日卡復刻池-馬幣.jpg",
    "platform": "未提供",
    "received": "2026-10-07"
  },
  {
    "pool": "生日復刻池",
    "tier": "五",
    "currency": "MYR",
    "twdPrice": 820,
    "price": 124.9,
    "source": "references/prices/月卡生日卡復刻池-馬幣.jpg",
    "platform": "未提供",
    "received": "2026-10-07"
  },
  {
    "pool": "混池",
    "tier": "一",
    "currency": "MYR",
    "twdPrice": 15,
    "price": 1.9,
    "source": "references/prices/混池-馬幣.JPG",
    "platform": "未提供",
    "received": "2026-10-07"
  },
  {
    "pool": "混池",
    "tier": "二",
    "currency": "MYR",
    "twdPrice": 30,
    "price": 4.9,
    "source": "references/prices/混池-馬幣.JPG",
    "platform": "未提供",
    "received": "2026-10-07"
  },
  {
    "pool": "混池",
    "tier": "三",
    "currency": "MYR",
    "twdPrice": 150,
    "price": 22.9,
    "source": "references/prices/混池-馬幣.JPG",
    "platform": "未提供",
    "received": "2026-10-07"
  },
  {
    "pool": "混池",
    "tier": "四",
    "currency": "MYR",
    "twdPrice": 320,
    "price": 49.9,
    "source": "references/prices/混池-馬幣.JPG",
    "platform": "未提供",
    "received": "2026-10-07"
  },
  {
    "pool": "混池",
    "tier": "五",
    "currency": "MYR",
    "twdPrice": 390,
    "price": 59.9,
    "source": "references/prices/混池-馬幣.JPG",
    "platform": "未提供",
    "received": "2026-10-07"
  },
  {
    "pool": "混池",
    "tier": "六",
    "currency": "MYR",
    "twdPrice": 590,
    "price": 99.9,
    "source": "references/prices/混池-馬幣.JPG",
    "platform": "未提供",
    "received": "2026-10-07"
  },
  {
    "pool": "混池",
    "tier": "七",
    "currency": "MYR",
    "twdPrice": 820,
    "price": 124.9,
    "source": "references/prices/混池-馬幣.JPG",
    "platform": "未提供",
    "received": "2026-10-07"
  },
  {
    "pool": "混池",
    "tier": "八",
    "currency": "MYR",
    "twdPrice": 1690,
    "price": 249.9,
    "source": "references/prices/混池-馬幣.JPG",
    "platform": "未提供",
    "received": "2026-10-07"
  },
  {
    "pool": "生日池",
    "tier": "一",
    "currency": "MYR",
    "twdPrice": 15,
    "price": 1.9,
    "source": "references/prices/生日池-馬幣.JPG",
    "platform": "未提供",
    "received": "2026-10-19"
  },
  {
    "pool": "生日池",
    "tier": "二",
    "currency": "MYR",
    "twdPrice": 30,
    "price": 4.9,
    "source": "references/prices/生日池-馬幣.JPG",
    "platform": "未提供",
    "received": "2026-10-19"
  },
  {
    "pool": "生日池",
    "tier": "三",
    "currency": "MYR",
    "twdPrice": 150,
    "price": 22.9,
    "source": "references/prices/生日池-馬幣.JPG",
    "platform": "未提供",
    "received": "2026-10-19"
  },
  {
    "pool": "生日池",
    "tier": "四",
    "currency": "MYR",
    "twdPrice": 290,
    "price": 39.9,
    "source": "references/prices/生日池-馬幣.JPG",
    "platform": "未提供",
    "received": "2026-10-19"
  },
  {
    "pool": "生日池",
    "tier": "五",
    "currency": "MYR",
    "twdPrice": 390,
    "price": 59.9,
    "source": "references/prices/生日池-馬幣.JPG",
    "platform": "未提供",
    "received": "2026-10-19"
  },
  {
    "pool": "生日池",
    "tier": "六",
    "currency": "MYR",
    "twdPrice": 820,
    "price": 124.9,
    "source": "references/prices/生日池-馬幣.JPG",
    "platform": "未提供",
    "received": "2026-10-19"
  },
  {
    "pool": "生日池",
    "tier": "七",
    "currency": "MYR",
    "twdPrice": 1490,
    "price": 229.9,
    "source": "references/prices/生日池-馬幣.JPG",
    "platform": "未提供",
    "received": "2026-10-19"
  },
  {
    "pool": "協會補給",
    "tier": "Lv10",
    "currency": "HKD",
    "twdPrice": 30,
    "price": 8,
    "source": "references/prices/月卡生日卡復刻池-港幣.JPG",
    "platform": "未提供",
    "received": "2026-10-07"
  },
  {
    "pool": "協會補給",
    "tier": "Lv10",
    "currency": "MYR",
    "twdPrice": 30,
    "price": 4.9,
    "source": "references/prices/月卡生日卡復刻池-馬幣.jpg",
    "platform": "未提供",
    "received": "2026-10-07"
  }
];

export const REGIONAL_PACK_PRICE_REFERENCES = [
  {
    "pool": "日卡池",
    "tier": "一",
    "referencePool": "混池",
    "referenceTier": "一"
  },
  {
    "pool": "日卡池",
    "tier": "二",
    "referencePool": "混池",
    "referenceTier": "二"
  },
  {
    "pool": "日卡池",
    "tier": "三",
    "referencePool": "混池",
    "referenceTier": "三"
  },
  {
    "pool": "日卡池",
    "tier": "四",
    "referencePool": "混池",
    "referenceTier": "四"
  },
  {
    "pool": "日卡池",
    "tier": "五",
    "referencePool": "混池",
    "referenceTier": "五"
  },
  {
    "pool": "日卡池",
    "tier": "六",
    "referencePool": "混池",
    "referenceTier": "七"
  },
  {
    "pool": "日卡池",
    "tier": "七",
    "referencePool": "混池",
    "referenceTier": "八"
  },
  {
    "pool": "月卡池",
    "tier": "一",
    "referencePool": "生日池",
    "referenceTier": "一",
    "confirmed": true,
    "confirmedAt": "2026-10-24"
  },
  {
    "pool": "月卡池",
    "tier": "二",
    "referencePool": "生日池",
    "referenceTier": "二",
    "confirmed": true,
    "confirmedAt": "2026-10-24"
  },
  {
    "pool": "月卡池",
    "tier": "三",
    "referencePool": "生日池",
    "referenceTier": "三",
    "confirmed": true,
    "confirmedAt": "2026-10-24"
  },
  {
    "pool": "月卡池",
    "tier": "四",
    "referencePool": "生日池",
    "referenceTier": "四",
    "confirmed": true,
    "confirmedAt": "2026-10-24"
  },
  {
    "pool": "月卡池",
    "tier": "五",
    "referencePool": "生日池",
    "referenceTier": "五",
    "confirmed": true,
    "confirmedAt": "2026-10-24"
  },
  {
    "pool": "月卡池",
    "tier": "六",
    "referencePool": "生日池",
    "referenceTier": "六",
    "confirmed": true,
    "confirmedAt": "2026-10-24"
  },
  {
    "pool": "月卡池",
    "tier": "七",
    "referencePool": "生日池",
    "referenceTier": "七",
    "confirmed": true,
    "confirmedAt": "2026-10-24"
  },
  {
    "pool": "混池復刻池",
    "tier": "一",
    "referencePool": "混池",
    "referenceTier": "二",
    "confirmed": true,
    "confirmedAt": "2026-10-24"
  },
  {
    "pool": "混池復刻池",
    "tier": "二",
    "referencePool": "混池",
    "referenceTier": "三",
    "confirmed": true,
    "confirmedAt": "2026-10-24"
  },
  {
    "pool": "混池復刻池",
    "tier": "三",
    "referencePool": "混池",
    "referenceTier": "四",
    "confirmed": true,
    "confirmedAt": "2026-10-24"
  },
  {
    "pool": "混池復刻池",
    "tier": "四",
    "referencePool": "混池",
    "referenceTier": "五",
    "confirmed": true,
    "confirmedAt": "2026-10-24"
  },
  {
    "pool": "混池復刻池",
    "tier": "五",
    "referencePool": "混池",
    "referenceTier": "六",
    "confirmed": true,
    "confirmedAt": "2026-10-24"
  },
  {
    "pool": "混池復刻池",
    "tier": "六",
    "referencePool": "混池",
    "referenceTier": "七",
    "confirmed": true,
    "confirmedAt": "2026-10-24"
  }
];
