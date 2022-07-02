import "core-js/actual/array/flat-map";

import { Item, Location, myAscensions, Phylum, visitUrl } from "kolmafia";
import { $effect, $familiar, $item, $location, $monster, $phylum, Macro, property, Snapper } from "libram";
import { StringProperty } from "libram/dist/propertyTypes";
import { CombatStrategy } from "../combat";
import { Quest, step, Task } from "./structure";

const strategy = new CombatStrategy(true)
  .macro(
    new Macro().item($item`clumsiness bark`).repeat(),
    $monster`The Thorax`,
  )
  .macro(
    new Macro().item([$item`clumsiness bark`, $item`clumsiness bark`]).repeat(),
    $monster`The Bat in the Spats`,
  )
  .macro(
    new Macro().item([$item`dangerous jerkcicle`, $item`dangerous jerkcicle`]).repeat(),
    $monster`Mammon the Elephant`,
  )
  .macro(
    new Macro().while_(`!pastround 5`, new Macro().item([$item`dangerous jerkcicle`, $item`dangerous jerkcicle`])).attack().repeat(),
    $monster`The Large-Bellied Snitch`,
  )
  .macro(
    new Macro().if_(`gotjump`, new Macro().attack()).while_(`monsterhpabove 1`, new Macro().item($item`jar full of wind`).attack()).attack(),
    $monster`The Terrible Pinch`,
  )
  .macro(
    new Macro().item([$item`jar full of wind`, $item`jar full of wind`]).repeat(),
    $monster`Thug 1 and Thug 2`,
  );

type SubQuest = {
  name: string;
  quest: StringProperty;
  location: Location;
  item: Item;
  choices: { enableBosses: number, firstBoss: number, secondBoss: number },
  bossPhylum: Phylum;
};

const subquests: SubQuest[] = [
  {
    name: "Clumsiness",
    quest: "questClumsinessGrove",
    location: $location`The Clumsiness Grove`,
    item: $item`clumsiness bark`,
    choices: { enableBosses: 560, firstBoss: 561, secondBoss: 563 },
    bossPhylum: $phylum`beast`,
  },
  {
    name: "Glacier",
    quest: "questGlacierOfJerks",
    location: $location`The Glacier of Jerks`,
    item: $item`dangerous jerkcicle`,
    choices: { enableBosses: 567, firstBoss: 568, secondBoss: 569 },
    bossPhylum: $phylum`beast`,
  },
  {
    name: "Maelstrom",
    quest: "questMaelstromOfLovers",
    location: $location`The Maelstrom of Lovers`,
    item: $item`jar full of wind`,
    choices: { enableBosses: 564, firstBoss: 565, secondBoss: 566 },
    bossPhylum: $phylum`humanoid`,
  }
];

const disFactory = (subquest: SubQuest): Task[] => ([
  {
    name: `Enable ${subquest.name} Bosses`,
    after: [],
    ready: () => property.getNumber("lastThingWithNoNameDefeated") < myAscensions(),
    acquire: [{ item: subquest.item, num: 25 }],
    choices: { [subquest.choices.enableBosses]: 1 },
    completed: () => step(subquest.quest) >= 0,
    do: subquest.location,
    effects: [$effect`Dis Abled`],
    limit: { soft: 30 },
    outfit: { modifier: "-combat" },
  },
  {
    name: `Enable First ${subquest.name} Boss`,
    after: [`Enable ${subquest.name} Bosses`],
    acquire: [{ item: subquest.item, num: 25 }],
    choices: { [subquest.choices.firstBoss]: 1 },
    completed: () => step(subquest.quest) >= 1,
    do: subquest.location,
    effects: [$effect`Dis Abled`],
    limit: { soft: 5 },
    outfit: { modifier: "-combat" },
  },
  {
    name: `Hunt First ${subquest.name} Boss`,
    after: [`Enable First ${subquest.name} Boss`],
    acquire: [{ item: subquest.item, num: 30 }],
    combat: strategy,
    completed: () => step(subquest.quest) >= 2,
    do: subquest.location,
    effects: [$effect`Dis Abled`, ...(subquest.bossPhylum === $phylum`beast` ? [$effect`A Beastly Odor`] : [])],
    limit: { soft: 5 },
    outfit: { familiar: $familiar`Red-Nosed Snapper` },
    prepare: () => Snapper.trackPhylum(subquest.bossPhylum),
  },
  {
    name: `Enable Second ${subquest.name} Boss`,
    after: [`Hunt First ${subquest.name} Boss`],
    acquire: [{ item: subquest.item, num: 25 }],
    choices: { [subquest.choices.secondBoss]: 1 },
    completed: () => step(subquest.quest) >= 3,
    do: subquest.location,
    effects: [$effect`Dis Abled`],
    limit: { soft: 5 },
    outfit: { modifier: "-combat" },
  },
  {
    name: `Hunt Second ${subquest.name} Boss`,
    after: [`Enable Second ${subquest.name} Boss`],
    acquire: [{ item: subquest.item, num: 30 }],
    combat: strategy,
    completed: () => step(subquest.quest) === 999,
    do: subquest.location,
    effects: [$effect`Dis Abled`, ...(subquest.bossPhylum === $phylum`beast` ? [$effect`A Beastly Odor`] : [])],
    limit: { soft: 5 },
    outfit: { familiar: $familiar`Red-Nosed Snapper` },
    prepare: () => Snapper.trackPhylum(subquest.bossPhylum),
  },
]);

const tasks = subquests.map(disFactory);
const orderedTasks = [
  // Get all the boss NCs
  tasks[0][0],
  tasks[0][1],
  tasks[1][0],
  tasks[1][1],
  tasks[2][0],
  tasks[2][1],
  // Fight first beast bossess
  tasks[0][2],
  tasks[1][2],
  // Unlock second beast bossess
  tasks[0][3],
  tasks[1][3],
  // Fight second beast bossess
  tasks[0][4],
  tasks[1][4],
  // Unlock and fight humanoid bosses
  tasks[2][2],
  tasks[2][3],
  tasks[2][4],
];

export const DisQuest: Quest = {
  name: "Suburbs of Dis",
  tasks: [
    ...orderedTasks,
    {
      name: "Boss",
      after: subquests.map(subquest => `Hunt Second ${subquest.name} Boss`),
      completed: () => property.getNumber("lastThingWithNoNameDefeated") === myAscensions(),
      do: () => visitUrl("suburbandis.php?action=dothis&pwd"),
      combat: new CombatStrategy(true).killHard(),
      limit: { tries: 1 },
    },
  ],
};

