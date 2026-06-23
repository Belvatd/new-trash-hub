export interface TreeStage {
  name: string
  minXp: number
  maxXp: number
  nextThreshold: number | null
  illustration: string
  dialogue: string
  colorClass: string
}

export const TREE_STAGES: TreeStage[] = [
  {
    name: "Tunas",
    minXp: 0,
    maxXp: 349,
    nextThreshold: 350,
    illustration: "/assets/illustration/tunas.svg",
    dialogue: "Ayo, kelola sampah dan tingkatkan pohon lestarimu!",
    colorClass: "bg-[#309C7A]", // Green color from theme
  },
  {
    name: "Tunas Remaja",
    minXp: 350,
    maxXp: 499,
    nextThreshold: 500,
    illustration: "/assets/illustration/tunas-remaja.svg",
    dialogue: "Hebat! Pohonmu terus bertumbuh.",
    colorClass: "bg-[#309C7A]",
  },
  {
    name: "Pohon Muda",
    minXp: 500,
    maxXp: 799,
    nextThreshold: 800,
    illustration: "/assets/illustration/pohon-muda.svg",
    dialogue: "Kamu sudah sampai setengah jalan!",
    colorClass: "bg-[#5B63E7]", // Indigoish color from screenshots
  },
  {
    name: "Pohon Remaja",
    minXp: 800,
    maxXp: 1499,
    nextThreshold: 1500,
    illustration: "/assets/illustration/pohon-remaja.svg",
    dialogue: "Siram lagi dong, sedikit lagi nih!",
    colorClass: "bg-[#5B63E7]",
  },
  {
    name: "Pohon Lestari",
    minXp: 1500,
    maxXp: Infinity,
    nextThreshold: null,
    illustration: "/assets/illustration/pohon-lestari.svg",
    dialogue: "Selamat! Pohon Lestari milikmu telah tumbuh subur.",
    colorClass: "bg-[#309C7A]",
  },
]

export function getTreeStage(xp: number): TreeStage {
  return TREE_STAGES.find((stage) => xp >= stage.minXp && xp <= stage.maxXp) || TREE_STAGES[0]
}
