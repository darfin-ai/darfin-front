import assert from 'node:assert/strict';
import { latestAuditOpinion } from './dartDerive.js';

// newest row is quarterly review with blank adtOpinion; older annual row has real opinion
const section = {
  rows: [
    { bsnsYear: '2026', adtOpinion: '' },
    { bsnsYear: '2025', adtOpinion: '적정의견' },
    { bsnsYear: '2024', adtOpinion: '적정의견' },
  ],
};

const picked = latestAuditOpinion(section);
assert.equal(picked.bsnsYear, '2025');
assert.equal(picked.adtOpinion, '적정의견');

// all blank → fall back to newest row
const noOpinion = latestAuditOpinion({
  rows: [
    { bsnsYear: '2026', adtOpinion: '' },
    { bsnsYear: '2025', adtOpinion: null },
  ],
});
assert.equal(noOpinion.bsnsYear, '2026');

console.log('dartDerive.test.js: ok');
