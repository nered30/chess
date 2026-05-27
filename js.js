/*
═══════════════════════════════════════════════════════════════════════════════
  CHESS GAME — OBFUSCATED BUILD
  Copyright (c) 2026 로드 (rod)
═══════════════════════════════════════════════════════════════════════════════

  본 소프트웨어는 아래 라이선스 중 어느 하나를 선택하여 사용할 수 있습니다.
  This software is multi-licensed; you may pick ANY of the following licenses.

─────────────────────────────────────────────────────────────────────────────
  [1] MIT License
─────────────────────────────────────────────────────────────────────────────
  Permission is hereby granted, free of charge, to any person obtaining a copy
  of this software and associated documentation files (the "Software"), to deal
  in the Software without restriction, including without limitation the rights
  to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
  copies of the Software, and to permit persons to whom the Software is
  furnished to do so, subject to the following conditions:
  The above copyright notice and this permission notice shall be included in
  all copies or substantial portions of the Software.
  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND.

─────────────────────────────────────────────────────────────────────────────
  [2] Apache License 2.0
─────────────────────────────────────────────────────────────────────────────
  Licensed under the Apache License, Version 2.0 (the "License"); you may not
  use this file except in compliance with the License. You may obtain a copy
  of the License at  http://www.apache.org/licenses/LICENSE-2.0
  Unless required by applicable law or agreed to in writing, software
  distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
  WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.

─────────────────────────────────────────────────────────────────────────────
  [3] GNU General Public License v3.0 (GPL-3.0)
─────────────────────────────────────────────────────────────────────────────
  This program is free software: you can redistribute it and/or modify it
  under the terms of the GNU General Public License as published by the Free
  Software Foundation, either version 3 of the License, or (at your option)
  any later version. See <https://www.gnu.org/licenses/>.

─────────────────────────────────────────────────────────────────────────────
  [4] GNU Lesser General Public License v3.0 (LGPL-3.0)
─────────────────────────────────────────────────────────────────────────────
  This library is free software; you can redistribute it and/or modify it
  under the terms of the GNU Lesser General Public License version 3.

─────────────────────────────────────────────────────────────────────────────
  [5] BSD 3-Clause License
─────────────────────────────────────────────────────────────────────────────
  Redistribution and use in source and binary forms, with or without
  modification, are permitted provided that the following conditions are met:
  1. Redistributions of source code must retain the above copyright notice.
  2. Redistributions in binary form must reproduce the copyright notice.
  3. Neither the name of the copyright holder nor the names of its
     contributors may be used to endorse or promote products derived from
     this software without specific prior written permission.

─────────────────────────────────────────────────────────────────────────────
  [6] BSD 2-Clause License
─────────────────────────────────────────────────────────────────────────────
  Redistribution and use in source and binary forms, with or without
  modification, are permitted provided that the conditions are met.

─────────────────────────────────────────────────────────────────────────────
  [7] Mozilla Public License 2.0 (MPL-2.0)
─────────────────────────────────────────────────────────────────────────────
  This Source Code Form is subject to the terms of the Mozilla Public License,
  v. 2.0. If a copy of the MPL was not distributed with this file, You can
  obtain one at  https://mozilla.org/MPL/2.0/

─────────────────────────────────────────────────────────────────────────────
  [8] ISC License
─────────────────────────────────────────────────────────────────────────────
  Permission to use, copy, modify, and/or distribute this software for any
  purpose with or without fee is hereby granted.

─────────────────────────────────────────────────────────────────────────────
  [9] The Unlicense (Public Domain Dedication)
─────────────────────────────────────────────────────────────────────────────
  This is free and unencumbered software released into the public domain.
  For more information, please refer to <http://unlicense.org>

─────────────────────────────────────────────────────────────────────────────
  [10] Creative Commons Attribution 4.0 (CC-BY-4.0)
─────────────────────────────────────────────────────────────────────────────
  This work is licensed under a Creative Commons Attribution 4.0 International
  License. To view a copy of this license, visit
  http://creativecommons.org/licenses/by/4.0/

─────────────────────────────────────────────────────────────────────────────
  [11] Creative Commons Zero (CC0-1.0)
─────────────────────────────────────────────────────────────────────────────
  To the extent possible under law, the author has waived all copyright and
  related or neighboring rights to this work.

─────────────────────────────────────────────────────────────────────────────
  [12] WTFPL (Do What The F*ck You Want To Public License) v2
─────────────────────────────────────────────────────────────────────────────
  Everyone is permitted to copy and distribute verbatim or modified copies of
  this license document, and changing it is allowed as long as the name is
  changed.
        DO WHAT THE F*CK YOU WANT TO PUBLIC LICENSE
                    Version 2, December 2004

─────────────────────────────────────────────────────────────────────────────
  [13] zlib License
─────────────────────────────────────────────────────────────────────────────
  This software is provided 'as-is', without any express or implied warranty.
  In no event will the authors be held liable for any damages arising from
  the use of this software.

─────────────────────────────────────────────────────────────────────────────
  [14] Boost Software License 1.0
─────────────────────────────────────────────────────────────────────────────
  Permission is hereby granted, free of charge, to any person or organization
  obtaining a copy of the software and accompanying documentation covered by
  this license to use, reproduce, display, distribute, execute, and transmit
  the Software.

─────────────────────────────────────────────────────────────────────────────
  [15] Artistic License 2.0
─────────────────────────────────────────────────────────────────────────────
  This package is licensed under the Artistic License 2.0.

  NOTE: 위 라이선스들은 일부 조항이 상호 충돌할 수 있으므로 실제 배포 시
        하나를 선택하여 사용하시기 바랍니다 (multi-licensing 선언).
═══════════════════════════════════════════════════════════════════════════════
*/

/* eslint-disable */
/* jshint ignore:start */
'use strict';

var _0xARR=["d2hpdGU=", "YmxhY2s=", "Sw==", "UQ==", "Ug==", "Qg==", "Tg==", "UA==", "4pmU", "4pmV", "4pmW", "4pmX", "4pmY", "4pmZ", "4pma", "4pmb", "4pmc", "4pmd", "4pme", "4pmf", "67CxIO2UjOugiOydtOyWtA==", "7Z2RIO2UjOugiOydtOyWtA==", "MA==", "Og==", "Y2hlc3Nib2FyZA==", "", "ZGl2", "Y2VsbCA=", "bGlnaHQ=", "ZGFyaw==", "Y2xpY2s=", "YWJjZGVmZ2g=", "ZmlsZS1sYWJlbHM=", "ZmlsZS1sYWJlbC1pdGVt", "cmFuay1sYWJlbHMtbGVmdA==", "cmFuay1sYWJlbHMtcmlnaHQ=", "cmFuay1sYWJlbC1pdGVt", "LnBpZWNlLC5tb3ZlLWRvdCwuY2FwdHVyZS1yaW5n", "c2VsZWN0ZWQ=", "bGFzdC1tb3Zl", "aW4tY2hlY2s=", "c3Bhbg==", "cGllY2Ug", "d2hpdGUtcA==", "YmxhY2stcA==", "Y2FwdHVyZS1yaW5n", "bW92ZS1kb3Q=", "ZS5wLg==", "Ty1P", "Ty1PLU8=", "cHJvbW90aW9uLWNob2ljZXM=", "YnV0dG9u", "cHJvbW8tYnRu", "cHJvbW90aW9uLW1vZGFs", "aGlkZGVu", "bm90YXRpb24tbGlzdA==", "Lm5vdGF0aW9uLXJvdw==", "Lm5vdGF0aW9uLWJsYWNr", "Lm5vdGF0aW9uLXdoaXRl", "PQ==", "Y20tY3Jvd24=", "Y20td2lubmVyLW5hbWU=", "IOyKueumrCE=", "Y20tc3ViLXRleHQ=", "7J2YIO2CueydtCDssrTtgazrqZTsnbTtirgg65CY7JeI7Iq164uI64ukLg==", "Y20tdG90YWwtbW92ZXM=", "7IiY", "Y20tZWxhcHNlZA==", "Y2hlY2ttYXRlLW1vZGFs", "7Iqk7YWM7J2866mU7J207Yq4IQ==", "wr0=", "7Iqk7YWM7J2866mU7J207Yq47J6F64uI64ukLiDrrLTsirnrtoDsnoXri4jri6Qu", "Iw==", "Z2FtZW92ZXItaWNvbg==", "Z2FtZW92ZXItdGl0bGU=", "Z2FtZW92ZXItc3Vi", "Z2FtZW92ZXItbW9kYWw=", "I2Y1Yzg0Mg==", "IzFhMWExYQ==", "I2Q5Nzc1Nw==", "IzRjYWY1MA==", "IzIxOTZmMw==", "I2U5MWU2Mw==", "I2ZmZmZmZg==", "Y29uZmV0dGktcGFydGljbGU=", "dnc=", "LTEycHg=", "cHg=", "NTAl", "MnB4", "cw==", "c3RhdHVzLWJhcg==", "Y2hlY2stc3RhdHVz", "d2hpdGUtY2FyZA==", "YWN0aXZlLXBsYXllcg==", "YmxhY2stY2FyZA==", "d2hpdGUtY2xvY2s=", "cnVubmluZw==", "YmxhY2stY2xvY2s=", "Y3VycmVudC1tb3ZlLW51bQ==", "eA==", "IA==", "Kw==", "bm90YXRpb24tcm93", "bm90YXRpb24tbnVt", "Lg==", "bm90YXRpb24td2hpdGU=", "bm90YXRpb24tYmxhY2s=", "bW92ZS1jb3VudC1sYWJlbA==", "d2hpdGUtY2FwdHVyZWQtcGllY2Vz", "YmxhY2stY2FwdHVyZWQtcGllY2Vz", "ZWxhcHNlZC10aW1l", "bG93LXRpbWU=", "7Iuc6rCEIOy0iOqzvCE=", "4o+x", "67O065Oc66W8IOywvuydhCDsiJgg7JeG7Iq164uI64ukLg==", "dW5kZWZpbmVk", "aHRtbDJjYW52YXMg65287J2067iM65+s66asIOuhnOuTnCDspJHsnoXri4jri6QuIOyeoOyLnCDtm4Qg64uk7IucIOyLnOuPhO2VtOyjvOyEuOyalC4=", "Lm1vdmUtZG90LC5jYXB0dXJlLXJpbmc=", "LmNlbGwuc2VsZWN0ZWQ=", "YQ==", "aW1hZ2UvcG5n", "7KCA7J6lIOykkSDsmKTrpZjqsIAg67Cc7IOd7ZaI7Iq164uI64ukOiA=", "Lm5vdGF0aW9uLW51bQ==", "ICA=", "Cg==", "7JWE7KeBIOq4sOuztOqwgCDsl4bsirXri4jri6Qu", "ZXh0cmEtcGduLWFyZWE=", "cGduLXRleHQtb3V0cHV0", "Y29weQ==", "ZXh0cmEtcGduLWJ0bg==", "c3Ryb25n", "4pyTIOuzteyCrCDsmYTro4wh", "IzJlN2QzMg==", "d2hpdGUtbmFtZQ==", "YmxhY2stbmFtZQ==", "d2hpdGUtZGlzcGxheS1uYW1l", "YmxhY2stZGlzcGxheS1uYW1l", "MOyImA==", "MeyImA==", "MDA6MDA=", "c3RhcnQtc2NyZWVu", "Z2FtZS1zY3JlZW4=", "ZXh0cmEtbW9kYWw=", "RE9NQ29udGVudExvYWRlZA==", "LnRpbWUtYnRu", "YWN0aXZl", "c3RhcnQtYnRu", "dW5kby1idG4=", "ZHJhdy1idG4=", "ZHJhdy1tb2RhbC1zdWI=", "ZHJhdy1tb2RhbA==", "ZHJhdy1hY2NlcHQ=", "66y07Iq567aA", "7JaR7Lih7J20IO2VqeydmO2VmOyXrCDrrLTsirnrtoDsnoXri4jri6Qu", "ZHJhdy1kZWNsaW5l", "cmVzaWduLWJ0bg==", "4pqR", "bmV3Z2FtZS1idG4=", "ZXh0cmEtYnRu", "ZXh0cmEtY2xvc2U=", "ZXh0cmEtcG5nLWJ0bg==", "cGduLXNlbGVjdC1hbGwtYnRu", "Y20tbmV3Z2FtZQ==", "Y20tbWVudQ==", "bW9kYWwtbmV3Z2FtZQ==", "bW9kYWwtbWVudQ==", "JHttb3ZlTnVtfQ==", "JHtkYXRlU3RyfQ==", "JHtwbGF5ZXJXaGl0ZX0=", "JHtwbGF5ZXJCbGFja30=", "JHtzZWxlY3RlZFRpbWV9"];
function _0xS(_0xidx){var _0xb=atob(_0xARR[_0xidx]);var _0xu=new Uint8Array(_0xb.length);for(var _0xi=0;_0xi<_0xb.length;_0xi++)_0xu[_0xi]=_0xb.charCodeAt(_0xi);return new TextDecoder('utf-8').decode(_0xu);}
var _0xDEAD={_0x1a2b:0xdeadbeef,_0x3c4d:0xcafebabe,_0x5e6f:0xfacefeed};
function _0x7a8b9c(_0xq){return((_0xq<<2)^0xff)&0xffff;}
function _0xb1c2d3(_0xe,_0xf){try{return _0xe+_0xf-0;}catch(_0x4e2){return 0;}}
function _0xe4f5a6(_0xg){var _0xh=[];for(var _0xi=0;_0xi<_0xg;_0xi++){_0xh.push((_0xi*0x42)^0x13);}return _0xh.length;}
var _0xJUNK=(function(){var _0xa=[];for(var _0xb=0;_0xb<8;_0xb++)_0xa.push((_0xb*7)^3);return _0xa;})();
function _0xshuffle(_0xx){if(typeof _0xx!=='number')return _0xx;return((_0xx<<1)>>>0)>>>1;}
function _0xnoop(){var _0x=Math.floor(Math.random()*1e9);return _0x*0;}
(function _0xinit(){var _0xq=_0xDEAD._0x1a2b^_0xDEAD._0x3c4d;_0xshuffle(_0xq);_0xe4f5a6(4);_0xb1c2d3(1,2);_0xnoop();})();


const _0xe4513eb = _0xS(0), _0x3781e7 = _0xS(1);
const _0x36da4d=_0xS(2), _0xbaf73=_0xS(3), _0x74916=_0xS(4), _0x611516=_0xS(5), _0xf785a4=_0xS(6), _0x762e0f=_0xS(7);

const _0x1ba00a = {
  white: { K:_0xS(8), Q:_0xS(9), R:_0xS(10), _0x3781e7:_0xS(11), N:_0xS(12), P:_0xS(13) },
  black: { K:_0xS(14), Q:_0xS(15), R:_0xS(16), _0x3781e7:_0xS(17), N:_0xS(18), P:_0xS(19) }
};

let _0xdfdce = [];
let _0xcbdc88  = _0xe4513eb;
let _0x85ac4f = null;
let _0xaf404c = [];
let _0x595bfae = [];
let _0xe872ea = [];
let _0x60148f = [];

let _0xe14e74  = { white:{kSide:true,qSide:true}, black:{kSide:true,qSide:true} };
let _0x4ec53c = null;
let _0x1a5d853 = null;

let _0xbb47f, _0xddeef, _0x7e0c44b, _0x7a5c72a = false;
let _0x13b39f = 0;

let _0xf1ca3 = _0xS(20), _0x66accdd = _0xS(21);
let _0x8cfb85b = 600;

let _0x02dff = null, _0x70fdbf6 = null;

const $ = id => document.getElementById(id);
const _0x8591e = (r,c) => `cell-${r}-${c}`;

try{_0xnoop();}catch(_0xerr){_0xb1c2d3(0,0);}

function _0x7b530d1(s) {
  return String(Math.floor(s/60)).padStart(2,_0xS(22))+_0xS(23)+String(s%60).padStart(2,_0xS(22));
}

if(_0xshuffle(0)){_0xe4f5a6(2);_0xnoop();}

function _0x9aedf() {
  const b = Array.from({length:8},()=>Array(8).fill(null));
  const order = [_0x74916,_0xf785a4,_0x611516,_0xbaf73,_0x36da4d,_0x611516,_0xf785a4,_0x74916];
  for(let c=0;c<8;c++){
    b[0][c]={color:_0x3781e7,type:order[c]};
    b[1][c]={color:_0x3781e7,type:_0x762e0f};
    b[6][c]={color:_0xe4513eb,type:_0x762e0f};
    b[7][c]={color:_0xe4513eb,type:order[c]};
  }
  return b;
}

if(_0xshuffle(0)){_0xe4f5a6(2);_0xnoop();}

function _0x80a921b() {
  const cb=$(_0xS(24));
  cb.innerHTML=_0xS(25);
  for(let r=0;r<8;r++){
    for(let c=0;c<8;c++){
      const cell=document.createElement(_0xS(26));
      cell.id=_0x8591e(r,c);
      cell.className=_0xS(27)+((r+c)%2===0?_0xS(28):_0xS(29));
      cell.dataset.r=r; cell.dataset.c=c;
      cell.addEventListener(_0xS(30),()=>_0xfbf01(r,c));
      cb.appendChild(cell);
    }
  }
}

if(_0xshuffle(0)){_0xe4f5a6(2);_0xnoop();}

function _0x974f599() {
  const files=_0xS(31);
  const fl=$(_0xS(32));
  fl.innerHTML=_0xS(25);
  for(let c=0;c<8;c++){
    const d=document.createElement(_0xS(26));
    d.className=_0xS(33);
    d.textContent=files[c];
    fl.appendChild(d);
  }
  [$(_0xS(34)),$(_0xS(35))].forEach(el=>{
    el.innerHTML=_0xS(25);
    for(let r=0;r<8;r++){
      const d=document.createElement(_0xS(26));
      d.className=_0xS(36);
      d.textContent=8-r;
      el.appendChild(d);
    }
  });
}

if(_0xshuffle(0)){_0xe4f5a6(2);_0xnoop();}

function _0x76c3f4() {
  for(let r=0;r<8;r++){
    for(let c=0;c<8;c++){
      const cell=document.getElementById(_0x8591e(r,c));
      cell.querySelectorAll(_0xS(37)).forEach(e=>e.remove());
      cell.classList.remove(_0xS(38),_0xS(39),_0xS(40));

      if(_0x02dff&&_0x02dff.r===r&&_0x02dff.c===c) cell.classList.add(_0xS(39));
      if(_0x70fdbf6  &&_0x70fdbf6.r  ===r&&_0x70fdbf6.c  ===c) cell.classList.add(_0xS(39));

      if(_0xdfdce[r][c]&&_0xdfdce[r][c].type===_0x36da4d&&_0xdfdce[r][c].color===_0xcbdc88){
        if(_0x0550dd(_0xcbdc88,_0xdfdce)) cell.classList.add(_0xS(40));
      }

      const p=_0xdfdce[r][c];
      if(p){
        const span=document.createElement(_0xS(41));
        span.className=_0xS(42)+(p.color===_0xe4513eb?_0xS(43):_0xS(44));
        span.textContent=_0x1ba00a[p.color][p.type];
        cell.appendChild(span);
      }
    }
  }

  if(_0x85ac4f){
    document.getElementById(_0x8591e(_0x85ac4f.r,_0x85ac4f.c)).classList.add(_0xS(38));
    _0xaf404c.forEach(({r,c})=>{
      const cell=document.getElementById(_0x8591e(r,c));
      if(_0xdfdce[r][c]&&_0xdfdce[r][c].color!==_0xcbdc88){
        const ring=document.createElement(_0xS(26));
        ring.className=_0xS(45);
        cell.appendChild(ring);
      } else {
        const dot=document.createElement(_0xS(26));
        dot.className=_0xS(46);
        cell.appendChild(dot);
      }
    });
  }
}

if(_0xshuffle(0)){_0xe4f5a6(2);_0xnoop();}

function _0xfbf01(r,c){
  if(!_0x7a5c72a||_0x1a5d853) return;
  const piece=_0xdfdce[r][c];

  if(_0x85ac4f){
    const move=_0xaf404c.find(m=>m.r===r&&m.c===c);
    if(move){
      _0x3bf0034(_0x85ac4f.r,_0x85ac4f.c,r,c);
      _0x85ac4f=null; _0xaf404c=[];
      _0x76c3f4(); return;
    }
    if(piece&&piece.color===_0xcbdc88){
      _0x85ac4f={r,c};
      _0xaf404c=_0x78d20c(r,c,_0xdfdce);
      _0x76c3f4(); return;
    }
    _0x85ac4f=null; _0xaf404c=[];
    _0x76c3f4(); return;
  }

  if(piece&&piece.color===_0xcbdc88){
    _0x85ac4f={r,c};
    _0xaf404c=_0x78d20c(r,c,_0xdfdce);
    _0x76c3f4();
  }
}

if(_0xshuffle(0)){_0xe4f5a6(2);_0xnoop();}

function _0x3bf0034(fr,fc,tr,tc){
  const piece=_0xdfdce[fr][fc];
  const captured=_0xdfdce[tr][tc];
  let specialNote=_0xS(25), epCaptured=null;

  _0x595bfae.push({
    _0xdfdce:JSON.parse(JSON.stringify(_0xdfdce)),
    _0xcbdc88,
    _0xe14e74:JSON.parse(JSON.stringify(_0xe14e74)),
    _0x4ec53c, _0x02dff, _0x70fdbf6,
    _0xe872ea:[..._0xe872ea],
    _0x60148f:[..._0x60148f]
  });

  let newEP=null;

  if(piece.type===_0x762e0f){
    const dir=piece.color===_0xe4513eb?-1:1;
    if(Math.abs(tr-fr)===2) newEP={r:fr+dir,c:fc};
    if(_0x4ec53c&&tr===_0x4ec53c.r&&tc===_0x4ec53c.c){
      epCaptured=_0xdfdce[fr][tc];
      _0xdfdce[fr][tc]=null;
      (piece.color===_0xe4513eb?_0xe872ea:_0x60148f).push(epCaptured);
      specialNote=_0xS(47);
    }
  }

  let castleSide=null;
  if(piece.type===_0x36da4d){
    const dc=tc-fc;
    if(dc===2) { _0xdfdce[fr][5]=_0xdfdce[fr][7]; _0xdfdce[fr][7]=null; castleSide=_0xS(48); }
    if(dc===-2){ _0xdfdce[fr][3]=_0xdfdce[fr][0]; _0xdfdce[fr][0]=null; castleSide=_0xS(49); }
    _0xe14e74[piece.color].kSide=false;
    _0xe14e74[piece.color].qSide=false;
  }
  if(piece.type===_0x74916){
    if(fc===0) _0xe14e74[piece.color].qSide=false;
    if(fc===7) _0xe14e74[piece.color].kSide=false;
  }

  if(captured) (piece.color===_0xe4513eb?_0xe872ea:_0x60148f).push(captured);

  _0xdfdce[tr][tc]=piece;
  _0xdfdce[fr][fc]=null;
  _0x4ec53c=newEP;
  _0x02dff={r:fr,c:fc};
  _0x70fdbf6  ={r:tr,c:tc};

  if(piece.type===_0x762e0f&&(tr===0||tr===7)){
    _0x1a5d853={r:tr,c:tc,color:piece.color};
    _0x2e9cc63(piece.color);
    _0x736075d(fr,fc,tr,tc,piece,captured||epCaptured,castleSide,specialNote,true);
    _0xc1d9f();
    _0xcbdc88=_0xcbdc88===_0xe4513eb?_0x3781e7:_0xe4513eb;
    _0x5aeb5();
    return;
  }

  _0x736075d(fr,fc,tr,tc,piece,captured||epCaptured,castleSide,specialNote,false);
  _0xc1d9f();
  _0xcbdc88=_0xcbdc88===_0xe4513eb?_0x3781e7:_0xe4513eb;
  _0x5aeb5();
  _0x1ee18bb();
}

try{_0xnoop();}catch(_0xerr){_0xb1c2d3(0,0);}

function _0x2e9cc63(color){
  const container=$(_0xS(50));
  container.innerHTML=_0xS(25);
  [_0xbaf73,_0x74916,_0x611516,_0xf785a4].forEach(type=>{
    const btn=document.createElement(_0xS(51));
    btn.className=_0xS(52);
    btn.textContent=_0x1ba00a[color][type];
    btn.addEventListener(_0xS(30),()=>_0xb8e7c5(type));
    container.appendChild(btn);
  });
  $(_0xS(53)).classList.remove(_0xS(54));
}

try{_0xnoop();}catch(_0xerr){_0xb1c2d3(0,0);}

function _0xb8e7c5(type){
  if(!_0x1a5d853) return;
  const {r,c,color}=_0x1a5d853;
  _0xdfdce[r][c]={color,type};
  _0x1a5d853=null;
  $(_0xS(53)).classList.add(_0xS(54));

  const rows=$(_0xS(55)).querySelectorAll(_0xS(56));
  if(rows.length>0){
    const lastRow=rows[rows.length-1];
    const cell=_0xcbdc88===_0xe4513eb
      ? lastRow.querySelector(_0xS(57))
      : lastRow.querySelector(_0xS(58));
    if(cell&&!cell.textContent.includes(_0xS(59))) cell.textContent+=(_0xS(59)+type);
  }

  _0x76c3f4();
  _0x1ee18bb();
}

if(_0xshuffle(0)){_0xe4f5a6(2);_0xnoop();}

function _0x78d20c(r,c,b){
  const piece=b[r][c];
  if(!piece) return [];
  return _0xd1db92(r,c,b).filter(({r:tr,c:tc})=>{
    return !_0x0550dd(piece.color, _0x8230d(r,c,tr,tc,b));
  });
}

try{_0xnoop();}catch(_0xerr){_0xb1c2d3(0,0);}

function _0xd1db92(r,c,b){
  const piece=b[r][c];
  if(!piece) return [];
  const {color,type}=piece;
  const moves=[];
  const opp=color===_0xe4513eb?_0x3781e7:_0xe4513eb;
  const inBounds=(r,c)=>r>=0&&r<8&&c>=0&&c<8;
  const isEmpty=(r,c)=>inBounds(r,c)&&!b[r][c];
  const isOpp=(r,c)=>inBounds(r,c)&&b[r][c]&&b[r][c].color===opp;
  const slide=(dr,dc)=>{
    let nr=r+dr,nc=c+dc;
    while(inBounds(nr,nc)){
      if(!b[nr][nc]){moves.push({r:nr,c:nc});}
      else if(isOpp(nr,nc)){moves.push({r:nr,c:nc});break;}
      else break;
      nr+=dr;nc+=dc;
    }
  };

  switch(type){
    case _0x36da4d:{
      [[-1,-1],[-1,0],[-1,1],[0,-1],[0,1],[1,-1],[1,0],[1,1]].forEach(([dr,dc])=>{
        const nr=r+dr,nc=c+dc;
        if(inBounds(nr,nc)&&(!b[nr][nc]||isOpp(nr,nc))) moves.push({r:nr,c:nc});
      });
      const rights=_0xe14e74[color];
      const base=color===_0xe4513eb?7:0;
      if(r===base&&c===4){
        if(rights.kSide&&isEmpty(base,5)&&isEmpty(base,6)
          &&!_0x0550dd(color,b)
          &&!_0x4840676(base,5,color,b)
          &&!_0x4840676(base,6,color,b))
          moves.push({r:base,c:6});
        if(rights.qSide&&isEmpty(base,3)&&isEmpty(base,2)&&isEmpty(base,1)
          &&!_0x0550dd(color,b)
          &&!_0x4840676(base,3,color,b)
          &&!_0x4840676(base,2,color,b))
          moves.push({r:base,c:2});
      }
      break;
    }
    case _0xbaf73: [[-1,-1],[-1,0],[-1,1],[0,-1],[0,1],[1,-1],[1,0],[1,1]].forEach(([dr,dc])=>slide(dr,dc)); break;
    case _0x74916:  [[-1,0],[1,0],[0,-1],[0,1]].forEach(([dr,dc])=>slide(dr,dc)); break;
    case _0x611516:[[-1,-1],[-1,1],[1,-1],[1,1]].forEach(([dr,dc])=>slide(dr,dc)); break;
    case _0xf785a4:
      [[-2,-1],[-2,1],[-1,-2],[-1,2],[1,-2],[1,2],[2,-1],[2,1]].forEach(([dr,dc])=>{
        const nr=r+dr,nc=c+dc;
        if(inBounds(nr,nc)&&(!b[nr][nc]||isOpp(nr,nc))) moves.push({r:nr,c:nc});
      });
      break;
    case _0x762e0f:{
      const dir=color===_0xe4513eb?-1:1;
      const start=color===_0xe4513eb?6:1;
      if(isEmpty(r+dir,c)) moves.push({r:r+dir,c});
      if(r===start&&isEmpty(r+dir,c)&&isEmpty(r+2*dir,c)) moves.push({r:r+2*dir,c});
      [-1,1].forEach(dc=>{
        if(isOpp(r+dir,c+dc)) moves.push({r:r+dir,c:c+dc});
        if(_0x4ec53c&&r+dir===_0x4ec53c.r&&c+dc===_0x4ec53c.c)
          moves.push({r:r+dir,c:c+dc});
      });
      break;
    }
  }
  return moves;
}

try{_0xnoop();}catch(_0xerr){_0xb1c2d3(0,0);}

function _0x8230d(fr,fc,tr,tc,b){
  const nb=b.map(row=>row.map(p=>p?{...p}:null));
  const piece=nb[fr][fc];
  if(piece.type===_0x762e0f&&_0x4ec53c&&tr===_0x4ec53c.r&&tc===_0x4ec53c.c)
    nb[fr][tc]=null;
  if(piece.type===_0x36da4d){
    if(tc-fc===2)  {nb[fr][5]=nb[fr][7];nb[fr][7]=null;}
    if(tc-fc===-2) {nb[fr][3]=nb[fr][0];nb[fr][0]=null;}
  }
  nb[tr][tc]=piece;
  nb[fr][fc]=null;
  return nb;
}

if(_0xshuffle(0)){_0xe4f5a6(2);_0xnoop();}

function _0xa0b8e95(color,b){
  for(let r=0;r<8;r++)
    for(let c=0;c<8;c++)
      if(b[r][c]&&b[r][c].type===_0x36da4d&&b[r][c].color===color) return {r,c};
  return null;
}

var _0xd7b665=function(){return _0xJUNK[0]^_0xJUNK[1];};

function _0x4840676(r,c,defendingColor,b){
  const atk=defendingColor===_0xe4513eb?_0x3781e7:_0xe4513eb;
  const savedEP=_0x4ec53c;
  _0x4ec53c=null;
  for(let rr=0;rr<8;rr++)
    for(let cc=0;cc<8;cc++){
      const p=b[rr][cc];
      if(p&&p.color===atk)
        if(_0xd1db92(rr,cc,b).some(m=>m.r===r&&m.c===c)){
          _0x4ec53c=savedEP;
          return true;
        }
    }
  _0x4ec53c=savedEP;
  return false;
}

try{_0xnoop();}catch(_0xerr){_0xb1c2d3(0,0);}

function _0x0550dd(color,b){
  const king=_0xa0b8e95(color,b);
  if(!king) return false;
  return _0x4840676(king.r,king.c,color,b);
}

try{_0xnoop();}catch(_0xerr){_0xb1c2d3(0,0);}

function _0x41009(color){
  for(let r=0;r<8;r++)
    for(let c=0;c<8;c++)
      if(_0xdfdce[r][c]&&_0xdfdce[r][c].color===color)
        if(_0x78d20c(r,c,_0xdfdce).length>0) return true;
  return false;
}

var _0xd7b665=function(){return _0xJUNK[0]^_0xJUNK[1];};

function _0x1ee18bb(){
  if(!_0x41009(_0xcbdc88)){
    if(_0x0550dd(_0xcbdc88,_0xdfdce)){
      const winner     = _0xcbdc88===_0xe4513eb ? _0x66accdd : _0xf1ca3;
      const loser      = _0xcbdc88===_0xe4513eb ? _0xf1ca3 : _0x66accdd;
      const winnerColor= _0xcbdc88===_0xe4513eb ? _0x3781e7 : _0xe4513eb;

      _0xe3218();
      _0x409f3f();
      _0x7a5c72a=false;

      $(_0xS(60)).textContent = _0x1ba00a[winnerColor][_0x36da4d];
      $(_0xS(61)).textContent = winner + _0xS(62);
      $(_0xS(63)).textContent = loser + _0xS(64);
      $(_0xS(65)).textContent = _0x595bfae.length + _0xS(66);
      $(_0xS(67)).textContent = _0x7b530d1(_0x13b39f);
      $(_0xS(68)).classList.remove(_0xS(54));

      setTimeout(()=>_0x14d21(), 100);
    } else {
      _0x635915(_0xS(69),_0xS(70),_0xS(71));
    }
  }
}

try{_0xnoop();}catch(_0xerr){_0xb1c2d3(0,0);}

function _0xe3218(){
  const rows=$(_0xS(55)).querySelectorAll(_0xS(56));
  if(!rows.length) return;
  const lastRow=rows[rows.length-1];
  const cell = _0xcbdc88===_0xe4513eb
    ? lastRow.querySelector(_0xS(57))
    : lastRow.querySelector(_0xS(58));
  if(cell&&cell.textContent&&!cell.textContent.endsWith(_0xS(72)))
    cell.textContent+=_0xS(72);
}

if(_0xshuffle(0)){_0xe4f5a6(2);_0xnoop();}

function _0x635915(title,icon,sub){
  _0x409f3f();
  _0x7a5c72a=false;
  $(_0xS(73)).textContent=icon;
  $(_0xS(74)).textContent=title;
  $(_0xS(75)).textContent=sub;
  $(_0xS(76)).classList.remove(_0xS(54));
}

if(_0xshuffle(0)){_0xe4f5a6(2);_0xnoop();}

function _0x14d21(){
  const colors=[_0xS(77),_0xS(78),_0xS(79),_0xS(80),_0xS(81),_0xS(82),_0xS(83)];
  const count=80;
  for(let i=0;i<count;i++){
    setTimeout(()=>{
      const p=document.createElement(_0xS(26));
      p.className=_0xS(84);
      p.style.left=Math.random()*100+_0xS(85);
      p.style.top=_0xS(86);
      p.style.background=colors[Math.floor(Math.random()*colors.length)];
      p.style.width=(6+Math.random()*8)+_0xS(87);
      p.style.height=(6+Math.random()*8)+_0xS(87);
      p.style.borderRadius=Math.random()>0.5?_0xS(88):_0xS(89);
      const dur=(1.8+Math.random()*1.8).toFixed(2);
      p.style.animationDuration=dur+_0xS(90);
      p.style.animationDelay=(Math.random()*0.5)+_0xS(90);
      document.body.appendChild(p);
      setTimeout(()=>p.remove(),(parseFloat(dur)+0.6)*1000);
    }, i*18);
  }
}

if(_0xshuffle(0)){_0xe4f5a6(2);_0xnoop();}

function _0x5aeb5(){
  const bar=$(_0xS(91));
  const name=_0xcbdc88===_0xe4513eb?_0xf1ca3:_0x66accdd;
  if(_0x0550dd(_0xcbdc88,_0xdfdce)){
    bar.textContent=`⚠ ${name}의 킹이 체크 상태입니다!`;
    bar.classList.add(_0xS(92));
  } else {
    bar.textContent=`${name}의 차례입니다`;
    bar.classList.remove(_0xS(92));
  }
  $(_0xS(93)).classList.toggle(_0xS(94),_0xcbdc88===_0xe4513eb);
  $(_0xS(95)).classList.toggle(_0xS(94),_0xcbdc88===_0x3781e7);
  $(_0xS(96)).classList.toggle(_0xS(97),_0xcbdc88===_0xe4513eb);
  $(_0xS(98)).classList.toggle(_0xS(97),_0xcbdc88===_0x3781e7);
  $(_0xS(99)).textContent=`${Math.ceil(_0x595bfae.length/2)}수`;
}

var _0xd7b665=function(){return _0xJUNK[0]^_0xJUNK[1];};

function _0x736075d(fr,fc,tr,tc,piece,captured,castleSide,specialNote,isPromotion){
  const files=_0xS(31);
  const toSq=files[tc]+(8-tr);
  let notation;
  if(castleSide){
    notation=castleSide;
  } else {
    const p=piece.type!==_0x762e0f?piece.type:_0xS(25);
    const cap=captured?_0xS(100):_0xS(25);
    const disambig=(piece.type===_0x762e0f&&captured)?files[fc]:_0xS(25);
    notation=disambig+p+cap+toSq+(specialNote?_0xS(101)+specialNote:_0xS(25));
  }
  const nextColor=piece.color===_0xe4513eb?_0x3781e7:_0xe4513eb;
  if(!isPromotion && _0x0550dd(nextColor,_0xdfdce)) notation+=_0xS(102);

  const list=$(_0xS(55));
  const moveNum=Math.ceil(_0x595bfae.length/2);
  const isWhiteMove=piece.color===_0xe4513eb;

  let row=list.querySelector(`[data-move=_0xS(167)]`);
  if(!row){
    row=document.createElement(_0xS(26));
    row.className=_0xS(103);
    row.dataset.move=moveNum;
    const num=document.createElement(_0xS(41));
    num.className=_0xS(104);
    num.textContent=moveNum+_0xS(105);
    const wCell=document.createElement(_0xS(41)); wCell.className=_0xS(106);
    const bCell=document.createElement(_0xS(41)); bCell.className=_0xS(107);
    row.appendChild(num); row.appendChild(wCell); row.appendChild(bCell);
    list.appendChild(row);
  }

  const target=isWhiteMove
    ? row.querySelector(_0xS(58))
    : row.querySelector(_0xS(57));
  target.textContent=notation;

  $(_0xS(108)).textContent=_0x595bfae.length+_0xS(66);
  list.scrollTop=list.scrollHeight;
}

if(_0xshuffle(0)){_0xe4f5a6(2);_0xnoop();}

function _0xc1d9f(){
  $(_0xS(109)).textContent=_0xe872ea.map(p=>_0x1ba00a.white[p.type]).join(_0xS(25));
  $(_0xS(110)).textContent=_0x60148f.map(p=>_0x1ba00a.black[p.type]).join(_0xS(25));
}

if(_0xshuffle(0)){_0xe4f5a6(2);_0xnoop();}

function _0x555496c(){
  if(_0x7e0c44b) clearInterval(_0x7e0c44b);
  _0x7e0c44b=setInterval(()=>{
    _0x13b39f++;
    $(_0xS(111)).textContent=_0x7b530d1(_0x13b39f);
    if(_0xcbdc88===_0xe4513eb) _0xbb47f--; else _0xddeef--;

    const wClock=$(_0xS(96)), bClock=$(_0xS(98));
    wClock.textContent=_0x7b530d1(_0xbb47f);
    bClock.textContent=_0x7b530d1(_0xddeef);
    wClock.classList.toggle(_0xS(112),_0xbb47f<=30&&_0xcbdc88===_0xe4513eb);
    bClock.classList.toggle(_0xS(112),_0xddeef<=30&&_0xcbdc88===_0x3781e7);

    if(_0xbb47f<=0){ _0x409f3f(); _0x635915(_0xS(113),_0xS(114),`${_0x66accdd} 플레이어가 시간 초과로 승리하였습니다.`); }
    else if(_0xddeef<=0){ _0x409f3f(); _0x635915(_0xS(113),_0xS(114),`${_0xf1ca3} 플레이어가 시간 초과로 승리하였습니다.`); }
  },1000);
}

if(_0xshuffle(0)){_0xe4f5a6(2);_0xnoop();}

function _0x409f3f(){ clearInterval(_0x7e0c44b); _0x7e0c44b=null; }

var _0xd7b665=function(){return _0xJUNK[0]^_0xJUNK[1];};

function _0xd71e4(){
  if(!_0x595bfae.length) return;
  const snap=_0x595bfae.pop();
  _0xdfdce=snap._0xdfdce; _0xcbdc88=snap._0xcbdc88;
  _0xe14e74=snap._0xe14e74;
  _0x4ec53c=snap._0x4ec53c;
  _0x02dff=snap._0x02dff; _0x70fdbf6=snap._0x70fdbf6;
  _0xe872ea=snap._0xe872ea; _0x60148f=snap._0x60148f;
  _0x85ac4f=null; _0xaf404c=[];

  const rows=$(_0xS(55)).querySelectorAll(_0xS(56));
  if(rows.length>0){
    const last=rows[rows.length-1];
    const bCell=last.querySelector(_0xS(57));
    if(bCell.textContent){ bCell.textContent=_0xS(25); }
    else { last.remove(); }
  }
  $(_0xS(108)).textContent=_0x595bfae.length+_0xS(66);
  $(_0xS(99)).textContent=`${Math.ceil(_0x595bfae.length/2)}수`;
  _0xc1d9f(); _0x5aeb5(); _0x76c3f4();
}

try{_0xnoop();}catch(_0xerr){_0xb1c2d3(0,0);}

function _0x53c1e(){
  const boardEl = document.getElementById(_0xS(24));
  if(!boardEl){ alert(_0xS(115)); return; }

  if(typeof html2canvas === _0xS(116)){
    alert(_0xS(117));
    return;
  }

  const dots = document.querySelectorAll(_0xS(118));
  dots.forEach(d => d.style.opacity = _0xS(22));
  const selCell = document.querySelector(_0xS(119));
  if(selCell) selCell.classList.remove(_0xS(38));

  html2canvas(boardEl, {
    scale: 2,
    useCORS: true,
    backgroundColor: null,
    logging: false
  }).then(canvas => {
    dots.forEach(d => d.style.opacity = _0xS(25));
    if(selCell) selCell.classList.add(_0xS(38));

    const now = new Date();
    const stamp = `${now.getFullYear()}${String(now.getMonth()+1).padStart(2,_0xS(22))}${String(now.getDate()).padStart(2,_0xS(22))}_${String(now.getHours()).padStart(2,_0xS(22))}${String(now.getMinutes()).padStart(2,_0xS(22))}`;
    const link = document.createElement(_0xS(120));
    link.download = `chess_${stamp}.png`;
    link.href = canvas.toDataURL(_0xS(121));
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }).catch(err => {
    dots.forEach(d => d.style.opacity = _0xS(25));
    if(selCell) selCell.classList.add(_0xS(38));
    console.error(err);
    alert(_0xS(122) + err.message);
  });
}

try{_0xnoop();}catch(_0xerr){_0xb1c2d3(0,0);}

function _0xc7b7fc(){
  const rows = document.getElementById(_0xS(55)).querySelectorAll(_0xS(56));
  if(!rows.length) return null;

  const now = new Date();
  const dateStr = `${now.getFullYear()}.${String(now.getMonth()+1).padStart(2,_0xS(22))}.${String(now.getDate()).padStart(2,_0xS(22))}`;
  let pgn = `[Date _0xS(168)]\n`;
  pgn += `[White _0xS(169)]\n`;
  pgn += `[Black _0xS(170)]\n`;
  pgn += `[TimeControl _0xS(171)]\n\n`;

  const parts = [];
  rows.forEach(row => {
    const num   = row.querySelector(_0xS(123)).textContent;
    const white = row.querySelector(_0xS(58)).textContent.trim();
    const black = row.querySelector(_0xS(57)).textContent.trim();
    let entry = num;
    if(white) entry += _0xS(101) + white;
    if(black) entry += _0xS(101) + black;
    parts.push(entry);
  });
  pgn += parts.join(_0xS(124)) + _0xS(125);
  return pgn;
}

try{_0xnoop();}catch(_0xerr){_0xb1c2d3(0,0);}

function _0xe7758(){
  const pgn = _0xc7b7fc();
  if(!pgn){ alert(_0xS(126)); return; }

  const pgnArea   = $(_0xS(127));
  const pgnOutput = $(_0xS(128));

  pgnOutput.value = pgn;
  pgnArea.classList.remove(_0xS(54));

  if(navigator.clipboard && window.isSecureContext){
    navigator.clipboard.writeText(pgn).then(()=>{
      _0x3f8a0();
    }).catch(()=>{
    });
  }
  else {
    try {
      pgnOutput.select();
      pgnOutput.setSelectionRange(0, 99999);
      const ok = document.execCommand(_0xS(129));
      if(ok) _0x3f8a0();
    } catch(e) {
    }
  }
}

var _0xd7b665=function(){return _0xJUNK[0]^_0xJUNK[1];};

function _0x3f8a0(){
  const btn = $(_0xS(130));
  const strong = btn.querySelector(_0xS(131));
  const orig = strong.textContent;
  strong.textContent = _0xS(132);
  btn.style.borderColor = _0xS(133);
  setTimeout(()=>{
    strong.textContent = orig;
    btn.style.borderColor = _0xS(25);
  }, 2000);
}

if(_0xshuffle(0)){_0xe4f5a6(2);_0xnoop();}

function _0xd74de2c(){
  _0xf1ca3=$(_0xS(134)).value.trim()||_0xS(20);
  _0x66accdd=$(_0xS(135)).value.trim()||_0xS(21);

  _0xdfdce=_0x9aedf();
  _0xcbdc88=_0xe4513eb; _0x85ac4f=null; _0xaf404c=[];
  _0x595bfae=[]; _0xe872ea=[]; _0x60148f=[];
  _0xe14e74={white:{kSide:true,qSide:true},black:{kSide:true,qSide:true}};
  _0x4ec53c=null; _0x1a5d853=null;
  _0x02dff=null; _0x70fdbf6=null; _0x13b39f=0;
  _0xbb47f=_0x8cfb85b; _0xddeef=_0x8cfb85b;

  $(_0xS(136)).textContent=_0xf1ca3;
  $(_0xS(137)).textContent=_0x66accdd;
  $(_0xS(96)).textContent=_0x7b530d1(_0xbb47f);
  $(_0xS(98)).textContent=_0x7b530d1(_0xddeef);
  $(_0xS(96)).classList.remove(_0xS(97),_0xS(112));
  $(_0xS(98)).classList.remove(_0xS(97),_0xS(112));
  $(_0xS(55)).innerHTML=_0xS(25);
  $(_0xS(108)).textContent=_0xS(138);
  $(_0xS(99)).textContent=_0xS(139);
  $(_0xS(111)).textContent=_0xS(140);
  $(_0xS(109)).textContent=_0xS(25);
  $(_0xS(110)).textContent=_0xS(25);
  $(_0xS(91)).textContent=`${_0xf1ca3}의 차례입니다`;
  $(_0xS(91)).classList.remove(_0xS(92));

  _0x80a921b(); _0x974f599(); _0x76c3f4(); _0x5aeb5();

  $(_0xS(141)).classList.add(_0xS(54));
  $(_0xS(142)).classList.remove(_0xS(54));
  _0x7a5c72a=true;
  _0x555496c();
}

try{_0xnoop();}catch(_0xerr){_0xb1c2d3(0,0);}

function _0x3a21661(){
  _0x409f3f(); _0x7a5c72a=false;
  $(_0xS(76)).classList.add(_0xS(54));
  $(_0xS(68)).classList.add(_0xS(54));
  $(_0xS(143)).classList.add(_0xS(54));
  $(_0xS(142)).classList.add(_0xS(54));
  $(_0xS(141)).classList.remove(_0xS(54));
}

document.addEventListener(_0xS(144),()=>{

  document.querySelectorAll(_0xS(145)).forEach(btn=>{
    btn.addEventListener(_0xS(30),()=>{
      document.querySelectorAll(_0xS(145)).forEach(b=>b.classList.remove(_0xS(146)));
      btn.classList.add(_0xS(146));
      _0x8cfb85b=parseInt(btn.dataset.time);
    });
  });

  $(_0xS(147)).addEventListener(_0xS(30), _0xd74de2c);
  $(_0xS(148)).addEventListener(_0xS(30),()=>{ if(_0x7a5c72a) _0xd71e4(); });

  $(_0xS(149)).addEventListener(_0xS(30),()=>{
    if(!_0x7a5c72a) return;
    const opp=_0xcbdc88===_0xe4513eb?_0x66accdd:_0xf1ca3;
    $(_0xS(150)).textContent=`${opp}에게 무승부를 제안합니다. 수락하시겠습니까?`;
    $(_0xS(151)).classList.remove(_0xS(54));
  });

  $(_0xS(152)).addEventListener(_0xS(30),()=>{
    $(_0xS(151)).classList.add(_0xS(54));
    _0x635915(_0xS(153),_0xS(70),_0xS(154));
  });

  $(_0xS(155)).addEventListener(_0xS(30),()=>{ $(_0xS(151)).classList.add(_0xS(54)); });

  $(_0xS(156)).addEventListener(_0xS(30),()=>{
    if(!_0x7a5c72a) return;
    const loser=_0xcbdc88===_0xe4513eb?_0xf1ca3:_0x66accdd;
    const winner=_0xcbdc88===_0xe4513eb?_0x66accdd:_0xf1ca3;
    _0x635915(`${loser} 기권`,_0xS(157),`${loser} 플레이어가 기권하여 ${winner} 플레이어가 승리하였습니다.`);
  });

  $(_0xS(158)).addEventListener(_0xS(30),()=>{
    _0x409f3f(); _0x7a5c72a=false;
    $(_0xS(142)).classList.add(_0xS(54));
    $(_0xS(141)).classList.remove(_0xS(54));
  });

  $(_0xS(159)).addEventListener(_0xS(30),()=>{
    $(_0xS(127)).classList.add(_0xS(54));
    $(_0xS(128)).value = _0xS(25);
    $(_0xS(143)).classList.remove(_0xS(54));
  });

  $(_0xS(160)).addEventListener(_0xS(30),()=>{
    $(_0xS(143)).classList.add(_0xS(54));
  });

  $(_0xS(143)).addEventListener(_0xS(30), e=>{
    if(e.target === $(_0xS(143))) $(_0xS(143)).classList.add(_0xS(54));
  });

  $(_0xS(161)).addEventListener(_0xS(30),()=>{
    $(_0xS(143)).classList.add(_0xS(54));
    setTimeout(_0x53c1e, 120);
  });

  $(_0xS(130)).addEventListener(_0xS(30), _0xe7758);

  $(_0xS(162)).addEventListener(_0xS(30),()=>{
    const ta = $(_0xS(128));
    ta.focus();
    ta.select();
    ta.setSelectionRange(0, 99999);
    try {
      document.execCommand(_0xS(129));
      _0x3f8a0();
    } catch(e){}
  });

  $(_0xS(163)).addEventListener(_0xS(30),()=>{
    $(_0xS(68)).classList.add(_0xS(54));
    _0xd74de2c();
  });
  $(_0xS(164)).addEventListener(_0xS(30),_0x3a21661);

  $(_0xS(165)).addEventListener(_0xS(30),()=>{ $(_0xS(76)).classList.add(_0xS(54)); _0xd74de2c(); });
  $(_0xS(166)).addEventListener(_0xS(30), _0x3a21661);
});
