export const G=19,DT=1/60;
export const zones=[['REGISTRATION',0,0,4],['EXHIBITION FLOOR',0,0,31],['VOXXY GAP',0,0,60],['GRAND STAIRCASE',0,0,82],['BIGGY LAUNCH',0,6,116],['CINEMA CORRIDOR',0,13,150],['AUDITORIUM',0,13,184],['CROWD SURF',0,9.4,218]] as const;
export type Stats={time:number,hops:number,faceplants:number,throws:number,impacts:number,stairs:number,coffees:number,croissants:number,ejections:number};
export const stats=():Stats=>({time:0,hops:0,faceplants:0,throws:0,impacts:0,stairs:0,coffees:0,croissants:0,ejections:0});
export function ballistic(a:{x:number,y:number,z:number},b:{x:number,y:number,z:number},t:number){return{x:(b.x-a.x)/t,y:(b.y-a.y)/t+G*t/2,z:(b.z-a.z)/t}}
