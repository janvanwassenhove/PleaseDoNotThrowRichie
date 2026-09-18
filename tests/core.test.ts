import {describe,it,expect} from 'vitest';import {ballistic,G} from '../src/core';
describe('launch maths',()=>{it('reaches its target',()=>{const a={x:0,y:1,z:0},b={x:2,y:14,z:30},t=2,v=ballistic(a,b,t);expect(a.y+v.y*t-G*t*t/2).toBeCloseTo(b.y);expect(v.z*t).toBe(30)})});
