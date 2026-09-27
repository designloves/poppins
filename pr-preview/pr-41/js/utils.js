import { CHARACTERS, AVATAR_ASSET_VERSION } from './constants.js';

export function esc(s){
  return String(s==null?"":s)
    .replace(/&/g,"&amp;").replace(/</g,"&lt;")
    .replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#39;");
}

export function shuffle(arr){
  const a=[...arr];
  for(let i=a.length-1;i>0;i--){
    const j=Math.floor(Math.random()*(i+1));
    [a[i],a[j]]=[a[j],a[i]];
  }
  return a;
}

export function avatarButtonInner(kind,diameter){
  const src=`avatars/${CHARACTERS[kind]?kind:"cat"}.png?v=${AVATAR_ASSET_VERSION}`;
  return `<img src="${src}" alt="${kind}" style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);width:122%;max-width:122%;height:auto;display:block;" />`;
}

export function splitPasteLine(line){
  const m=line.match(/^(.+?)\s*[=\-–→:\t]+\s*(.+)$/);
  if(m)return[m[1].trim(),m[2].trim()];
  const parts=line.split(/\s{2,}/);
  if(parts.length===2)return[parts[0].trim(),parts[1].trim()];
  return null;
}
export function parsePasteText(text,pair){
  const lines=text.split("\n").map(l=>l.trim()).filter(Boolean);
  const out=[];
  for(const line of lines){
    const parts=splitPasteLine(line);
    if(parts)out.push({[pair.from]:parts[0],[pair.to]:parts[1]});
  }
  return out;
}

// Best-effort language guess from diacritics/marks — not real language
// detection, just enough to pre-fill the From/To pickers on a strong
// signal. Never fully trustworthy (e.g. unaccented text gives no signal
// at all), so it only nudges the pickers, which the user can override.
export function guessLangCode(text){
  if(/[üÜß]/.test(text))return "de";
  if(/[åäöÅÄÖ]/.test(text))return "sv";
  if(/[ñÑ¿¡]/.test(text))return "es";
  if(/[çÇœŒàâêëîïôûÀÂÊËÎÏÔÛ]/.test(text))return "fr";
  if(/[áéíóúÁÉÍÓÚ]/.test(text))return "es";
  return null;
}
export function guessPairFromText(text){
  const lines=text.split("\n").map(l=>l.trim()).filter(Boolean);
  let leftGuess=null,rightGuess=null;
  for(const line of lines){
    const parts=splitPasteLine(line); if(!parts)continue;
    if(!leftGuess)leftGuess=guessLangCode(parts[0]);
    if(!rightGuess)rightGuess=guessLangCode(parts[1]);
    if(leftGuess&&rightGuess)break;
  }
  if(leftGuess&&rightGuess&&leftGuess!==rightGuess)return{from:leftGuess,to:rightGuess};
  if(leftGuess&&!rightGuess)return{from:leftGuess,to:leftGuess==="en"?"sv":"en"};
  if(rightGuess&&!leftGuess)return{from:rightGuess==="en"?"sv":"en",to:rightGuess};
  return null;
}

// One word per line (no "word = translation" separator) means the user
// wants auto-translation rather than pasted pairs.
export function looksLikeSingleWords(text){
  const lines=text.split("\n").map(l=>l.trim()).filter(Boolean);
  if(!lines.length)return false;
  return !splitPasteLine(lines[0]);
}
