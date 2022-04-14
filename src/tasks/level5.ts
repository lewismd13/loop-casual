import { myLevel, myPrimestat, use, visitUrl } from "kolmafia";
import { $effects, $item, $location, $monster, $stat, have } from "libram";
import { CombatStrategy } from "../combat";
import { Quest, step } from "./structure";

export const KnobQuest: Quest = {
  name: "Knob",
  tasks: [
    {
      name: "Start",
      after: [],
      ready: () => myLevel() >= 5,
      completed: () => step("questL05Goblin") >= 0,
      do: () => visitUrl("council.php"),
      limit: { tries: 1 },
      freeaction: true,
    },
    {
      name: "Prep Free Guild Unlock",
      after: [],
      ready: () => myPrimestat() === $stat`muscle`,
      completed: () => step("questG09Muscle") >= 0,
      do: () => visitUrl("guild.php?place=challenge"),
      choices: { 543: 1 },
      limit: { tries: 1 },
    },
    {
      name: "Outskirts",
      after: [],
      completed: () => have($item`Knob Goblin encryption key`) || step("questL05Goblin") > 0,
      do: $location`The Outskirts of Cobb's Knob`,
      choices: { 111: 3, 113: 2, 118: 1 },
      limit: { tries: 11 },
      delay: 10,
    },
    {
      name: "Open Knob",
      after: ["Start", "Outskirts"],
      completed: () => step("questL05Goblin") >= 1,
      do: () => use($item`Cobb's Knob map`),
      limit: { tries: 1 },
      freeaction: true,
    },
    {
      name: "King",
      after: ["Open Knob"],
      acquire: [
        { item: $item`Knob Goblin harem veil` },
        { item: $item`Knob Goblin harem pants` },
        { item: $item`Knob Goblin perfume` },
      ],
      completed: () => step("questL05Goblin") === 999,
      do: $location`Throne Room`,
      combat: new CombatStrategy(true).kill($monster`Knob Goblin King`),
      effects: $effects`Knob Goblin Perfume`,
      limit: { tries: 1 },
    },
    {
      name: "Unlock Guild",
      after: [],
      ready: () => have($item`11-inch knob sausage`),
      completed: () => step("questG09Muscle") === 999,
      do: () => visitUrl("guild.php?place=challenge"),
      limit: { tries: 1 },
    },
  ],
};
