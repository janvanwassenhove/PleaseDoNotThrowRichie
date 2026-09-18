// The sixty-second briefing behind HOW THIS WORKS on the title screen: the story and the
// goal, the four robots and what each is for, the exhibitors and their banners, and the
// guards. main.ts owns the state and the camera — every card is shot live in the venue, on
// whoever it talks about — this module owns the words.
export type Focus = 'story' | 'richie' | 'voxxy' | 'biggy' | 'droid' | 'expo' | 'guard' | 'stage';
/** `art` names textures to show as a strip in the card: the banners the card is about. */
export type Card = {focus: Focus; tag: string; title: string; body: string; keys: [string, string][]; art?: string[]};

/** `hop` is what the hop control is called on this device: SPACE, or the HOP button. */
export const cards = (hop: string, touch: boolean): Card[] => [
  {
    focus: 'story', tag: 'THE SITUATION', title: 'RICHIE HAS A KEYNOTE.',
    body: 'It starts in ten minutes, in Auditorium 8: upstairs, at the far end of Kinepolis. Richie is at registration. Richie has no legs, no wheels and no arms. <b>Get him onto the keynote stage.</b>',
    keys: [],
  },
  {
    focus: 'richie', tag: 'RICHIE', title: 'HE HOPS. THAT IS ALL HE DOES.',
    body: 'Aim, hold to charge, let go. His head sinks as the charge builds. He will land badly, tumble, and right himself a second later. Stuck, or off the edge of the world? Reset to the last of eight checkpoints. There are no lives to lose.',
    keys: touch ? [['STICK', 'aim'], ['HOP', 'hold to charge, release to hop'], ['R', 'back to checkpoint'], ['DRAG', 'look around']]
      : [['WASD', 'aim'], ['SPACE', 'hold to charge, release to hop'], ['R', 'back to checkpoint'], ['DRAG', 'look around'], ['WHEEL', 'zoom']],
  },
  {
    focus: 'voxxy', tag: 'VOXXY · PRECISION THROW', title: 'VOXXY THROWS. ACCURATELY.',
    body: 'Light, curious and quick on its feet. Where the floor runs out before the grand staircase, ask Voxxy: it picks Richie up and holds him overhead. Aim, wind up, release. The title of this game was only ever a suggestion.',
    keys: [['E', 'ask Voxxy'], [touch ? 'STICK' : 'A / D', 'aim the throw'], [hop, 'hold for power, release to throw']],
  },
  {
    focus: 'biggy', tag: 'BIGGY · MAXIMUM CHAOS', title: 'BIGGY HITS. VERY HARD.',
    body: 'Slow to start, hard to stop. The cinema level is seven metres above the foyer and there are no stairs for the legless. Ask Biggy, hold while he backs up for the run, and let go. WHAM. The longer the run-up, the higher the orbit.',
    keys: [['E', 'ask Biggy'], [hop, 'hold to back up, release for impact']],
  },
  {
    focus: 'droid', tag: 'DROID · QUESTIONABLE MACHINERY', title: 'DROID RUNS THE BUILDING.',
    body: 'Tall, weathered, and in charge of everything with a motor. In Auditorium 8, get Richie to the red recliner and ask. RECLINE. Nothing. RECLINE. Nothing. The third attempt is EJECT MODE, and Richie clears half the room.',
    keys: [['E', 'ask Droid, three times']],
  },
  {
    focus: 'expo', tag: 'THE EXHIBITION FLOOR', title: 'THE SPONSORS ARE SOLID OBJECTS.',
    body: 'Six stands sell robot gadgets nobody asked for, and Duke, the Java mascot, waves from a cardboard standee beside every one. Back walls and counters are real: hop into a stand, bounce off a banner, knock on a toaster with legs. They are also the best cover in the building.',
    keys: [], art: ['booth-2', 'booth-1', 'booth-3', 'booth-4', 'booth-5', 'booth-6', 'duke'],
  },
  {
    focus: 'guard', tag: 'SECURITY', title: 'SECURITY THROWS TOO. BACKWARDS.',
    body: 'Guards patrol the exhibition hall, the foyer and the corridor. The cone on the floor is what a guard can see. Cross it in plain sight and he gives chase, grabs Richie and throws him back a checkpoint. Booths, pillars and walls block the view: break the line of sight and he gives up.',
    keys: [],
  },
  {
    focus: 'stage', tag: 'THE FINISH', title: 'THEN JUMP INTO THE AUDIENCE.',
    body: 'There is no path to the stage, only the front rows. Land on them and the crowd passes Richie forward, throw by throw, until he arrives. Not elegantly. Eight golden tokens on the way are entirely optional, and therefore essential.',
    keys: [],
  },
];
