// Legacy types — used by Scene/BrickModel until Phase 2 rewrites them
export interface BrickConfig {
  rowOffset: number
  rotation: [number, number, number]
  groupY: number
}

// SceneState will be expanded in Phase 2. Empty for now.
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface SceneState {}

export interface Moment {
  text: string
  scene: SceneState
  isSubstep: boolean
}

export const moments: Moment[] = [
  {
    isSubstep: false,
    text: 'Imagine a brick wall.',
    scene: {},
  },
  {
    isSubstep: true,
    text: "You're probably picturing something like this:",
    scene: {},
  },
  {
    isSubstep: false,
    text: 'Each *course*, or row, is made of bricks laid end-to-end.',
    scene: {},
  },
  {
    isSubstep: true,
    text: 'Each brick laid in this orientation is called a *stretcher*. Because of this, this pattern is called *stretcher bond*.',
    scene: {},
  },
  {
    isSubstep: false,
    text: 'Stretcher bond is often used in modern buildings as a facade. Behind the facade is a structural wall made of wood or reinforced concrete. That\'s what really holds the building up.',
    scene: {},
  },
  {
    isSubstep: false,
    text: 'In between the bricks and the structural wall, there\'s often a gap, sometimes filled with insulation or sometimes left empty. The gap provides moisture control and insulation. This is called a *cavity wall*.',
    scene: {},
  },
  {
    isSubstep: true,
    text: 'The bricks are connected to the structural wall with metal ties.',
    scene: {},
  },
  {
    isSubstep: false,
    text: 'But in traditional masonry, there were no cavities, no ties, and no reinforced concrete. A brick wall was really a brick wall.',
    scene: {},
  },
  {
    isSubstep: true,
    text: 'And a stretcher bond wall like this is too thin to stand on its own.',
    scene: {},
  },
  {
    isSubstep: false,
    text: 'To make a strong brick wall, you need multiple vertical layers, called *wythes*. You might start by building 2 wythes of stretchers right next to each other.',
    scene: {},
  },
  {
    isSubstep: true,
    text: "But these 2 wythes are only held together by mortar, so they'll split apart.",
    scene: {},
  },
  {
    isSubstep: false,
    text: "After a few courses of stretchers, we'll need something to bond the two wythes together.",
    scene: {},
  },
  {
    isSubstep: true,
    text: "We can solve this problem with more bricks! Let's try rotating some of our bricks so they lay across the two wythes, with their heads visible on the faces of the wall. These bricks are called *headers*.",
    scene: {},
  },
  {
    isSubstep: false,
    text: 'Sometimes, when the bricks are being fired, the heads are glazed or burnt. That lets the headers stand out.',
    scene: {},
  },
  {
    isSubstep: false,
    text: 'There are different ways to arrange the headers that bond together the wythes.',
    scene: {},
  },
  {
    isSubstep: true,
    text: "These different patterns are called *bonds*. Let's learn about some of them!",
    scene: {},
  },
  {
    isSubstep: false,
    text: "If a wall has a few courses of stretchers for each course of headers, it's called *American bond*. In America, this is also called *Common bond*.",
    scene: {},
  },
  {
    isSubstep: true,
    text: "This pattern is easy to build, but it's not very pretty.",
    scene: {},
  },
  {
    isSubstep: false,
    text: "If there's just 1 course of stretchers for each course of headers, it's called *English bond*. In England, this is also called *Common bond*.",
    scene: {},
  },
  {
    isSubstep: true,
    text: "People say this is one of the strongest bonds, but it looks very menacing to me.",
    scene: {},
  },
  {
    isSubstep: false,
    text: "Let's try offsetting every other course of stretchers by half a brick.",
    scene: {},
  },
  {
    isSubstep: true,
    text: 'Much prettier! Look how the mortar joints between the bricks form diagonal lines.',
    scene: {},
  },
  {
    isSubstep: true,
    text: 'This is called *English cross bond* or *Dutch bond*, depending on how the ends of the wall are finished.',
    scene: {},
  },
  {
    isSubstep: false,
    text: 'We don\'t have to use just stretchers or just headers in each course. What if we alternate them?',
    scene: {},
  },
  {
    isSubstep: true,
    text: "This is called *Flemish bond*. It's my favorite!",
    scene: {},
  },
  {
    isSubstep: false,
    text: "If each course has 2 stretchers for each header, it's called *Monk bond*.",
    scene: {},
  },
]
