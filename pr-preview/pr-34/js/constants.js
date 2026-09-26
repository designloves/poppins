// ── SAMPLE LISTS ──────────────────────────────────────────────────
export const SAMPLE_LISTS=[
  {id:"djur",from:"sv",to:"en",name:"Djur (Animals)",color:"rose",
    words:[{sv:"katt",en:"cat"},{sv:"hund",en:"dog"},{sv:"häst",en:"horse"},{sv:"fågel",en:"bird"},{sv:"kanin",en:"rabbit"},{sv:"räv",en:"fox"},{sv:"björn",en:"bear"},{sv:"ekorre",en:"squirrel"},{sv:"groda",en:"frog"},{sv:"fjäril",en:"butterfly"}]},
  {id:"mat",from:"sv",to:"en",name:"Mat (Food)",color:"butter",
    words:[{sv:"äpple",en:"apple"},{sv:"bröd",en:"bread"},{sv:"ost",en:"cheese"},{sv:"mjölk",en:"milk"},{sv:"smör",en:"butter"},{sv:"köttbullar",en:"meatballs"},{sv:"potatis",en:"potato"},{sv:"glass",en:"ice cream"},{sv:"kaka",en:"cookie"},{sv:"soppa",en:"soup"}]},
  {id:"skola",from:"sv",to:"en",name:"Skolan (School)",color:"sky",
    words:[{sv:"bok",en:"book"},{sv:"penna",en:"pen"},{sv:"lärare",en:"teacher"},{sv:"klassrum",en:"classroom"},{sv:"matematik",en:"math"},{sv:"rast",en:"recess"},{sv:"ryggsäck",en:"backpack"},{sv:"skrivbord",en:"desk"}]},
  {id:"kanslor",from:"sv",to:"en",name:"Känslor (Feelings)",color:"mint",
    words:[{sv:"glad",en:"happy"},{sv:"ledsen",en:"sad"},{sv:"arg",en:"angry"},{sv:"rädd",en:"scared"},{sv:"trött",en:"tired"},{sv:"förvånad",en:"surprised"}]},
];

export const COLOR_MAP={rose:"#FFB0C8",butter:"#F2EE5B",sky:"#8AD7FF",mint:"#A8F08C",pink:"#B583E8"};
export const CHARACTERS={cat:1,elephant:1,bear:1,bunny:1,frog:1,owl:1,lion:1,penguin:1,panda:1,unicorn:1,fox:1,jellyfish:1};
// A tint of each avatar's own color, blended into the app's cream
// background — kept light enough to keep every card/button (which stay
// on plain --paper) reading clearly on top of it.
export const AVATAR_TINTS={
  cat:"#F5EDE6", elephant:"#D4E6EC", bear:"#D2BEA8", bunny:"#F6DFDE",
  frog:"#D5E5C3", owl:"#E4D4E9", lion:"#F4DCB4", penguin:"#C6DFD8",
  panda:"#DFDED8", unicorn:"#EEE3EA", fox:"#F0D3B4", jellyfish:"#F0C1D9",
};
// A more saturated version of the same color, for the profile/login card.
export const AVATAR_PANEL={
  cat:"#FCDAE2", elephant:"#CBE6F5", bear:"#ECCAA9", bunny:"#FADBE2",
  frog:"#CCE4BC", owl:"#E1CDF0", lion:"#F8D7A7", penguin:"#B7DBD9",
  panda:"#D9D9D8", unicorn:"#F0E2F2", fox:"#F2CBA7", jellyfish:"#F2B1DA",
};
// The avatar's accent color — cascades to every primary button in the
// app (not just login), via the --accent/--accent-text CSS variables.
export const AVATAR_BUTTON={
  cat:"#FFB84D", elephant:"#B583E8", bear:"#A8F08C", bunny:"#FCA7C0",
  frog:"#F2EE5B", owl:"#F2EE5B", lion:"#D9691F", penguin:"#F2EE5B",
  panda:"#7CB342", unicorn:"#8AD7FF", fox:"#FFFFFF", jellyfish:"#E0399B",
};
export const AVATAR_BUTTON_TEXT={ jellyfish:"#fff" };
// Bump this whenever an avatar image file changes, so browsers/CDNs
// that cache images by URL (independent of how often the page reloads)
// are forced to fetch the new bytes instead of serving stale ones.
export const AVATAR_ASSET_VERSION=3;
