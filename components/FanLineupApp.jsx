"use client";

import { useState, useEffect, useRef } from "react";

// ─── TEAM CONFIG ─────────────────────────────────────────────────────────────
const TEAM_CONFIG = {
  besiktas: {
    id: 549,
    logo: "https://media.api-sports.io/football/teams/549.png",
    name: "BEŞİKTAŞ",
    primary: "#000000",
    secondary: "#FFFFFF",
    accent: "#E0E0E0",
    gradient: "linear-gradient(135deg, #1a1a1a 0%, #000000 100%)",
    badge: "⚫",
    leagueId: 203,
  },
  fenerbahce: {
    id: 611,
    logo: "https://media.api-sports.io/football/teams/611.png",
    name: "Fenerbahçe",
    primary: "#003087",
    secondary: "#FFCB00",
    accent: "#FFCB00",
    gradient: "linear-gradient(135deg, #001a4d 0%, #003087 100%)",
    badge: "🟡",
    leagueId: 203,
  },
  galatasaray: {
    id: 645,
    logo: "https://media.api-sports.io/football/teams/645.png",
    name: "Galatasaray",
    primary: "#CC0000",
    secondary: "#FF8C00",
    accent: "#FF8C00",
    gradient: "linear-gradient(135deg, #8B0000 0%, #CC0000 100%)",
    badge: "🔴",
    leagueId: 203,
  },
  trabzonspor: {
    id: 998,
    logo: "https://media.api-sports.io/football/teams/998.png",
    name: "Trabzonspor",
    primary: "#702082",
    secondary: "#0057A8",
    accent: "#00BFFF",
    gradient: "linear-gradient(135deg, #4a0057 0%, #702082 100%)",
    badge: "🟣",
    leagueId: 203,
  },
};

// ─── TÜM DİZİLİŞLER ──────────────────────────────────────────────────────────
const FORMATIONS = {
  "4-2-3-1": [
    { slot:"GK",   label:"GK",  row:1, col:3 },
    { slot:"RB",   label:"RB",  row:2, col:5 },
    { slot:"CB1",  label:"CB",  row:2, col:4 },
    { slot:"CB2",  label:"CB",  row:2, col:2 },
    { slot:"LB",   label:"LB",  row:2, col:1 },
    { slot:"CDM1", label:"CDM", row:3, col:4 },
    { slot:"CDM2", label:"CDM", row:3, col:2 },
    { slot:"RW",   label:"RW",  row:4, col:5 },
    { slot:"CAM",  label:"CAM", row:4, col:3 },
    { slot:"LW",   label:"LW",  row:4, col:1 },
    { slot:"ST",   label:"ST",  row:5, col:3 },
  ],
  "4-3-3": [
    { slot:"GK",  label:"GK", row:1, col:3 },
    { slot:"RB",  label:"RB", row:2, col:5 },
    { slot:"CB1", label:"CB", row:2, col:4 },
    { slot:"CB2", label:"CB", row:2, col:2 },
    { slot:"LB",  label:"LB", row:2, col:1 },
    { slot:"CM1", label:"CM", row:3, col:5 },
    { slot:"CM2", label:"CM", row:3, col:3 },
    { slot:"CM3", label:"CM", row:3, col:1 },
    { slot:"RW",  label:"RW", row:5, col:5 },
    { slot:"ST",  label:"ST", row:5, col:3 },
    { slot:"LW",  label:"LW", row:5, col:1 },
  ],
  "4-4-2": [
    { slot:"GK",  label:"GK", row:1, col:3 },
    { slot:"RB",  label:"RB", row:2, col:5 },
    { slot:"CB1", label:"CB", row:2, col:4 },
    { slot:"CB2", label:"CB", row:2, col:2 },
    { slot:"LB",  label:"LB", row:2, col:1 },
    { slot:"RM",  label:"RM", row:3, col:5 },
    { slot:"CM1", label:"CM", row:3, col:4 },
    { slot:"CM2", label:"CM", row:3, col:2 },
    { slot:"LM",  label:"LM", row:3, col:1 },
    { slot:"ST1", label:"ST", row:5, col:4 },
    { slot:"ST2", label:"ST", row:5, col:2 },
  ],
  "3-5-2": [
    { slot:"GK",   label:"GK",  row:1, col:3 },
    { slot:"CB1",  label:"CB",  row:2, col:4 },
    { slot:"CB2",  label:"CB",  row:2, col:3 },
    { slot:"CB3",  label:"CB",  row:2, col:2 },
    { slot:"WBR",  label:"WB",  row:3, col:5 },
    { slot:"CM1",  label:"CM",  row:3, col:4 },
    { slot:"CM2",  label:"CM",  row:3, col:3 },
    { slot:"CM3",  label:"CM",  row:3, col:2 },
    { slot:"WBL",  label:"WB",  row:3, col:1 },
    { slot:"ST1",  label:"ST",  row:5, col:4 },
    { slot:"ST2",  label:"ST",  row:5, col:2 },
  ],
  "5-3-2": [
    { slot:"GK",   label:"GK",  row:1, col:3 },
    { slot:"RWB",  label:"WB",  row:2, col:5 },
    { slot:"CB1",  label:"CB",  row:2, col:4 },
    { slot:"CB2",  label:"CB",  row:2, col:3 },
    { slot:"CB3",  label:"CB",  row:2, col:2 },
    { slot:"LWB",  label:"WB",  row:2, col:1 },
    { slot:"CM1",  label:"CM",  row:3, col:4 },
    { slot:"CM2",  label:"CM",  row:3, col:3 },
    { slot:"CM3",  label:"CM",  row:3, col:2 },
    { slot:"ST1",  label:"ST",  row:5, col:4 },
    { slot:"ST2",  label:"ST",  row:5, col:2 },
  ],
};

function getPositionKey(apiPosition) {
  const map = {
    "Goalkeeper": "GK",
    "Defender": "CB",
    "Midfielder": "CM",
    "Attacker": "ST",
  };
  return map[apiPosition] || "CM";
}

function getCandidatesForSlot(players, slot) {
  const slotMap = {
    GK:  ["GK"],
    RB:  ["CB"], LB: ["CB"], CB1: ["CB"], CB2: ["CB"], CB3: ["CB"],
    RWB: ["CB"], LWB: ["CB"], WBR: ["CB"], WBL: ["CB"],
    CDM1:["CM"], CDM2:["CM"],
    CM1: ["CM"], CM2: ["CM"], CM3: ["CM"],
    RM:  ["CM"], LM: ["CM"],
    RW:  ["ST","CM"], LW: ["ST","CM"],
    CAM: ["CM"],
    ST:  ["ST"], ST1:["ST"], ST2:["ST"],
  };
  const allowed = slotMap[slot] || [];
  return players.filter(p => allowed.includes(p.positionKey));
}

function getInitials(name) {
  const parts = name.split(" ");
  if (parts.length >= 2) return parts[0][0] + parts[parts.length - 1][0];
  return name.slice(0, 2);
}

function formatCountdown(kickoff) {
  const diff = kickoff - Date.now();
  if (diff <= 0) return "MAÇTA";
  const h = Math.floor(diff / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  const s = Math.floor((diff % 60000) / 1000);
  if (h > 0) return `${h}s ${m}d`;
  return `${m}d ${s}sn`;
}

// ─── OY DEPOSU ────────────────────────────────────────────────────────────────
const VoteStore = {
  votes: {},
  userVotes: {},

  init(teamKey) {
    if (!this.votes[teamKey]) this.votes[teamKey] = {};
    if (!this.userVotes[teamKey]) {
      try {
        const s = sessionStorage.getItem(`uv_${teamKey}`);
        this.userVotes[teamKey] = s ? JSON.parse(s) : {};
      } catch { this.userVotes[teamKey] = {}; }
    }
  },

  cast(teamKey, slot, playerId) {
    this.init(teamKey);
    if (this.userVotes[teamKey][slot]) return false;
    if (!this.votes[teamKey][slot]) this.votes[teamKey][slot] = {};
    this.votes[teamKey][slot][playerId] = (this.votes[teamKey][slot][playerId] || 0) + 1;
    this.userVotes[teamKey][slot] = playerId;
    try { sessionStorage.setItem(`uv_${teamKey}`, JSON.stringify(this.userVotes[teamKey])); } catch {}
    return true;
  },

  getSlotVotes(teamKey, slot) {
    this.init(teamKey);
    return this.votes[teamKey]?.[slot] || {};
  },

  getUserVote(teamKey, slot) {
    this.init(teamKey);
    return this.userVotes[teamKey]?.[slot] || null;
  },

  getTotal(teamKey, slot) {
    return Object.values(this.getSlotVotes(teamKey, slot)).reduce((a, b) => a + b, 0);
  },

  getWinner(teamKey, slot) {
    const v = this.getSlotVotes(teamKey, slot);
    if (!Object.keys(v).length) return null;
    return Object.entries(v).sort((a, b) => b[1] - a[1])[0][0];
  },

  seedDemo(teamKey, players) {
    this.init(teamKey);
    if (this.votes[teamKey] && Object.keys(this.votes[teamKey]).length > 0) return;
    try {
      const stored = localStorage.getItem('demo_' + teamKey);
      if (stored) { this.votes[teamKey] = JSON.parse(stored); return; }
    } catch {}
    FORMATIONS["4-2-3-1"].forEach(pos => {
      const candidates = getCandidatesForSlot(players, pos.slot).filter(p => !p.injured && !p.suspended);
      if (!candidates.length) return;
      if (!this.votes[teamKey][pos.slot]) this.votes[teamKey][pos.slot] = {};
      candidates.forEach((p, i) => {
        this.votes[teamKey][pos.slot][p.id] = Math.max(50, 500 - i * 130);
      });
    });
    try { localStorage.setItem('demo_' + teamKey, JSON.stringify(this.votes[teamKey])); } catch {}
  },
};

// ─── CSS ──────────────────────────────────────────────────────────────────────
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@400;500;600;700&family=Space+Mono:wght@700&display=swap');
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
body{font-family:'DM Sans',sans-serif;background:#08090d;color:#fff;}
.app{min-height:100vh;}
.home{min-height:100vh;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:40px 20px;background:#0c0c0e;}
.home-eyebrow{font-family:'Space Mono',monospace;font-size:10px;letter-spacing:5px;color:rgba(255,255,255,.25);margin-bottom:24px;text-align:center;}
.home-title{font-family:'Bebas Neue',cursive;font-size:clamp(64px,12vw,120px);letter-spacing:2px;text-align:center;line-height:.9;color:#fff;margin-bottom:6px;}
.home-title span{color:rgba(255,255,255,.15);}
.home-sub{font-family:'Space Mono',monospace;font-size:11px;letter-spacing:3px;color:rgba(255,255,255,.3);margin-bottom:64px;text-align:center;}
.team-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:1px;max-width:640px;width:100%;border:1px solid rgba(255,255,255,.06);border-radius:16px;overflow:hidden;}
@media(max-width:480px){.team-grid{grid-template-columns:1fr;}}
.team-card{position:relative;cursor:pointer;padding:28px 24px;display:flex;align-items:center;justify-content:space-between;background:#111114;transition:background .2s;}
.team-card:hover{background:#18181c;}
.team-card+.team-card{border-top:1px solid rgba(255,255,255,.06);}
.team-card:nth-child(odd){border-right:1px solid rgba(255,255,255,.06);}
.team-card-left{display:flex;align-items:center;gap:14px;}
.team-card-dot{width:10px;height:10px;border-radius:50%;flex-shrink:0;}
.team-card-logo{width:48px;height:48px;object-fit:contain;flex-shrink:0;filter:drop-shadow(0 2px 8px rgba(0,0,0,.4));}
.team-card-name{font-family:'Bebas Neue',cursive;font-size:22px;letter-spacing:2px;color:#fff;line-height:1;}
.team-card-meta{font-family:'Space Mono',monospace;font-size:9px;letter-spacing:1px;color:rgba(255,255,255,.3);margin-top:3px;}
.team-card-arrow{font-size:16px;color:rgba(255,255,255,.15);transition:color .2s,transform .2s;}
.team-card:hover .team-card-arrow{color:rgba(255,255,255,.5);transform:translateX(4px);}
.header{padding:16px 20px;display:flex;align-items:center;justify-content:space-between;border-bottom:1px solid rgba(255,255,255,.07);position:sticky;top:0;z-index:100;backdrop-filter:blur(20px);background:rgba(8,9,13,.85);}
.back-btn{background:rgba(255,255,255,.07);border:1px solid rgba(255,255,255,.1);color:#fff;padding:8px 16px;border-radius:8px;cursor:pointer;font-family:'DM Sans',sans-serif;font-size:13px;transition:background .15s;}
.back-btn:hover{background:rgba(255,255,255,.12);}
.header-center h2{font-family:'Bebas Neue',cursive;font-size:20px;letter-spacing:2px;text-align:center;}
.header-center p{font-size:11px;color:rgba(255,255,255,.45);text-align:center;margin-top:1px;}
.countdown{background:rgba(255,255,255,.07);border:1px solid rgba(255,255,255,.12);border-radius:8px;padding:7px 12px;text-align:center;}
.countdown-val{font-family:'Space Mono',monospace;font-size:13px;font-weight:700;letter-spacing:1px;}
.countdown-lbl{font-size:8px;letter-spacing:2px;text-transform:uppercase;color:rgba(255,255,255,.4);margin-top:1px;}
.tabs{display:flex;gap:6px;justify-content:center;padding:14px 16px;}
.tab{font-family:'Space Mono',monospace;font-size:10px;letter-spacing:2px;text-transform:uppercase;padding:7px 16px;border-radius:8px;border:1px solid rgba(255,255,255,.1);background:transparent;color:rgba(255,255,255,.4);cursor:pointer;transition:all .15s;}
.tab.active{background:rgba(255,255,255,.1);color:#fff;border-color:rgba(255,255,255,.2);}
.loading{display:flex;flex-direction:column;align-items:center;justify-content:center;padding:80px 20px;gap:16px;}
.spinner{width:40px;height:40px;border:3px solid rgba(255,255,255,.1);border-top-color:rgba(255,255,255,.6);border-radius:50%;animation:spin .8s linear infinite;}
@keyframes spin{to{transform:rotate(360deg);}}
.loading p{font-family:'Space Mono',monospace;font-size:11px;letter-spacing:2px;color:rgba(255,255,255,.4);}
.pitch-wrap{display:flex;flex-direction:column;align-items:center;padding:16px;gap:12px;}
.formation-lbl{font-family:'Space Mono',monospace;font-size:10px;letter-spacing:3px;text-transform:uppercase;color:rgba(255,255,255,.35);}
.pitch{position:relative;width:100%;max-width:520px;aspect-ratio:7/10;border-radius:8px;overflow:hidden;box-shadow:0 8px 40px rgba(0,0,0,.5);}
.pitch-bg{position:absolute;inset:0;background:repeating-linear-gradient(0deg,#2d7a3a 0px,#2d7a3a 46px,#339944 46px,#339944 92px);}
.pitch-lines{position:absolute;inset:0;border:3px solid rgba(255,255,255,.3);border-radius:6px;}
.pitch-mid{position:absolute;left:0;right:0;top:50%;height:2px;background:rgba(255,255,255,.3);}
.pitch-circle{position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);width:76px;height:76px;border:2px solid rgba(255,255,255,.3);border-radius:50%;}
.pitch-pen-t{position:absolute;left:50%;transform:translateX(-50%);width:52%;height:18%;border:2px solid rgba(255,255,255,.3);top:0;border-top:none;border-radius:0 0 4px 4px;}
.pitch-pen-b{position:absolute;left:50%;transform:translateX(-50%);width:52%;height:18%;border:2px solid rgba(255,255,255,.3);bottom:0;border-bottom:none;border-radius:4px 4px 0 0;}
.pitch-slots{position:absolute;inset:0;display:grid;grid-template-rows:repeat(5,1fr);grid-template-columns:repeat(6,1fr);padding:6px;}
.pitch-slot{display:flex;align-items:center;justify-content:center;cursor:pointer;}
.slot-bubble{display:flex;flex-direction:column;align-items:center;gap:3px;transition:transform .15s;}
.slot-bubble:hover{transform:scale(1.1);}
.slot-avatar{width:42px;height:42px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-family:'Space Mono',monospace;font-size:9px;font-weight:700;border:2px solid rgba(255,255,255,.25);position:relative;box-shadow:0 3px 10px rgba(0,0,0,.5);overflow:hidden;transition:border-color .2s,box-shadow .2s;}
.slot-avatar.voted{border-color:#FFD700;box-shadow:0 0 14px rgba(255,215,0,.5);}
.slot-avatar.has-winner{border-color:rgba(255,255,255,.5);}
.slot-ring{position:absolute;inset:-2px;border-radius:50%;opacity:.8;}
.slot-initials{position:relative;z-index:1;font-size:9px;}
.slot-name{font-size:8px;font-weight:700;text-align:center;max-width:52px;line-height:1.2;text-shadow:0 1px 4px rgba(0,0,0,.9);}
.slot-pos{font-family:'Space Mono',monospace;font-size:7px;letter-spacing:1px;background:rgba(0,0,0,.5);padding:1px 4px;border-radius:3px;color:rgba(255,255,255,.6);}
.overlay{position:fixed;inset:0;background:rgba(0,0,0,.75);backdrop-filter:blur(8px);z-index:200;display:flex;align-items:flex-end;justify-content:center;padding:16px;}
@media(min-width:600px){.overlay{align-items:center;}}
.modal{background:#131318;border:1px solid rgba(255,255,255,.1);border-radius:20px 20px 14px 14px;width:100%;max-width:440px;max-height:82vh;overflow-y:auto;animation:slideUp .22s ease;}
@keyframes slideUp{from{transform:translateY(40px);opacity:0;}to{transform:translateY(0);opacity:1;}}
.modal-head{padding:18px 20px 14px;border-bottom:1px solid rgba(255,255,255,.07);display:flex;align-items:center;justify-content:space-between;position:sticky;top:0;background:#131318;border-radius:20px 20px 0 0;z-index:1;}
.modal-title{font-family:'Bebas Neue',cursive;font-size:22px;letter-spacing:2px;}
.modal-sub{font-size:11px;color:rgba(255,255,255,.4);margin-top:2px;}
.modal-close{width:30px;height:30px;border-radius:50%;border:1px solid rgba(255,255,255,.12);background:transparent;color:#fff;cursor:pointer;font-size:14px;display:flex;align-items:center;justify-content:center;}
.modal-body{padding:14px 20px 20px;}
.player-opt{display:flex;align-items:center;gap:12px;padding:12px;border-radius:12px;border:1px solid transparent;cursor:pointer;transition:background .15s,border-color .15s;margin-bottom:8px;}
.player-opt:hover:not(.disabled):not(.my-vote){background:rgba(255,255,255,.05);border-color:rgba(255,255,255,.1);}
.player-opt.my-vote{border-color:#FFD700;background:rgba(255,215,0,.07);}
.player-opt.disabled{opacity:.4;cursor:not-allowed;}
.player-opt.selected{border-color:rgba(255,255,255,.3);background:rgba(255,255,255,.07);}
.opt-avatar{width:46px;height:46px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-family:'Space Mono',monospace;font-size:11px;font-weight:700;flex-shrink:0;border:2px solid rgba(255,255,255,.15);}
.opt-info{flex:1;min-width:0;}
.opt-name{font-weight:600;font-size:14px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
.opt-meta{display:flex;align-items:center;gap:6px;margin-top:3px;flex-wrap:wrap;}
.opt-num{font-family:'Space Mono',monospace;font-size:10px;color:rgba(255,255,255,.4);}
.badge{font-size:10px;padding:2px 6px;border-radius:4px;font-weight:600;letter-spacing:.5px;text-transform:uppercase;}
.badge-inj{background:rgba(220,50,50,.2);color:#ff6b6b;border:1px solid rgba(220,50,50,.3);}
.badge-sus{background:rgba(255,140,0,.2);color:#ffa500;border:1px solid rgba(255,140,0,.3);}
.badge-me{font-size:10px;color:#FFD700;}
.bar-wrap{margin-top:6px;}
.bar-track{height:3px;background:rgba(255,255,255,.07);border-radius:2px;overflow:hidden;}
.bar-fill{height:100%;border-radius:2px;transition:width .4s ease;}
.bar-info{display:flex;justify-content:space-between;margin-bottom:3px;}
.bar-pct{font-family:'Space Mono',monospace;font-size:9px;color:rgba(255,255,255,.4);}
.vote-btn{width:100%;padding:13px;border-radius:10px;border:none;font-family:'Bebas Neue',cursive;font-size:18px;letter-spacing:2px;cursor:pointer;margin-top:14px;transition:transform .15s,box-shadow .15s;}
.vote-btn:hover:not(:disabled){transform:translateY(-2px);box-shadow:0 8px 24px rgba(0,0,0,.4);}
.vote-btn:disabled{opacity:.35;cursor:not-allowed;}
.results{padding:24px 16px;max-width:760px;margin:0 auto;}
.results-title{font-family:'Bebas Neue',cursive;font-size:clamp(32px,6vw,56px);letter-spacing:3px;text-align:center;margin-bottom:4px;}
.results-sub{text-align:center;color:rgba(255,255,255,.4);font-family:'Space Mono',monospace;font-size:10px;letter-spacing:2px;text-transform:uppercase;margin-bottom:28px;}
.xi-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(170px,1fr));gap:12px;}
.xi-card{background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.09);border-radius:12px;padding:14px;display:flex;align-items:center;gap:10px;}
.xi-avatar{width:44px;height:44px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-family:'Space Mono',monospace;font-size:11px;font-weight:700;flex-shrink:0;}
.xi-pos{font-family:'Space Mono',monospace;font-size:9px;letter-spacing:1px;color:rgba(255,255,255,.4);text-transform:uppercase;}
.xi-name{font-weight:700;font-size:13px;line-height:1.3;}
.xi-votes{font-family:'Space Mono',monospace;font-size:9px;color:rgba(255,255,255,.35);margin-top:2px;}
.toast{position:fixed;bottom:24px;left:50%;transform:translateX(-50%);background:#1a1a24;border:1px solid rgba(255,255,255,.12);border-radius:12px;padding:11px 18px;font-size:13px;z-index:999;animation:toastIn .2s ease;white-space:nowrap;}
@keyframes toastIn{from{transform:translateX(-50%) translateY(14px);opacity:0;}to{transform:translateX(-50%) translateY(0);opacity:1;}}
.toast.success{border-color:rgba(50,205,100,.4);color:#50dd80;}
.toast.error{border-color:rgba(220,50,50,.4);color:#ff6b6b;}
.lock-banner{background:rgba(255,100,0,.1);border:1px solid rgba(255,100,0,.25);border-radius:8px;padding:8px 14px;font-family:'Space Mono',monospace;font-size:11px;color:#ffaa60;text-align:center;margin:0 16px;}
.formation-picker{display:flex;gap:6px;justify-content:center;padding:0 16px 12px;flex-wrap:wrap;}
.f-btn{font-family:'Space Mono',monospace;font-size:10px;letter-spacing:1px;padding:5px 12px;border-radius:6px;border:1px solid rgba(255,255,255,.1);background:transparent;color:rgba(255,255,255,.35);cursor:pointer;transition:all .15s;}
.f-btn.active{background:rgba(255,255,255,.1);color:#fff;border-color:rgba(255,255,255,.25);}
.f-btn:hover{color:rgba(255,255,255,.7);}
::-webkit-scrollbar{width:3px;}
::-webkit-scrollbar-thumb{background:rgba(255,255,255,.12);border-radius:2px;}
`;

// ─── ANA COMPONENT ────────────────────────────────────────────────────────────
export default function FanLineupApp() {
  const [page, setPage] = useState("home");
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [tab, setTab] = useState("vote");
  const [players, setPlayers] = useState([]);
  const [nextMatch, setNextMatch] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [modal, setModal] = useState(null);
  const [toast, setToast] = useState(null);
  const [countdown, setCountdown] = useState("");
  const [, forceUpdate] = useState(0);
  const [formation, setFormation] = useState("4-2-3-1");
  const timerRef = useRef(null);

  useEffect(() => {
    const s = document.createElement("style");
    s.textContent = CSS;
    document.head.appendChild(s);
    return () => s.remove();
  }, []);

  useEffect(() => {
    if (!nextMatch) return;
    const tick = () => setCountdown(formatCountdown(nextMatch.kickoff));
    tick();
    timerRef.current = setInterval(tick, 1000);
    return () => clearInterval(timerRef.current);
  }, [nextMatch]);

  async function loadTeamData(teamKey) {
    setLoading(true);
    setError(null);
    const cfg = TEAM_CONFIG[teamKey];

    try {
      const [squadRes, injuryRes, fixtureRes] = await Promise.all([
        fetch(`/api/squad?team=${cfg.id}`),
        fetch(`/api/injuries?team=${cfg.id}&league=${cfg.leagueId}`),
        fetch(`/api/fixture?team=${cfg.id}`),
      ]);

      const squadData = await squadRes.json();
      const injuryData = await injuryRes.json();
      const fixtureData = await fixtureRes.json();

      const injuryMap = {};
      (injuryData.injuries || []).forEach(i => { injuryMap[i.playerId] = i; });

      const processedPlayers = (squadData.players || []).map(p => ({
        id: p.id,
        name: p.name,
        number: p.number,
        position: p.position,
        positionKey: getPositionKey(p.position),
        photo: p.photo,
        injured: injuryMap[p.id]?.type === "Injury",
        suspended: injuryMap[p.id]?.type === "Suspension",
        injuryReason: injuryMap[p.id]?.reason || null,
      }));

      setPlayers(processedPlayers);

      if (fixtureData.fixture) {
        setNextMatch({
          kickoff: new Date(fixtureData.fixture.kickoff),
          opponent: fixtureData.fixture.opponent,
          venue: fixtureData.fixture.venue,
        });
      }

      VoteStore.seedDemo(teamKey, processedPlayers);

    } catch (e) {
      setError("API bağlantısı kurulamadı. API key'ini kontrol et.");
    }

    setLoading(false);
  }

  function selectTeam(key) {
    setSelectedTeam(key);
    setTab("vote");
    setPage("match");
    loadTeamData(key);
  }

  function showToast(msg, type) {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 2500);
  }

  const cfg = selectedTeam ? TEAM_CONFIG[selectedTeam] : null;
  const locked = nextMatch ? nextMatch.kickoff <= new Date() : false;

  if (page === "home") {
    return (
      <div className="app">
        <div className="home">
          <div className="home-eyebrow">SÜPER LİG · 2025 / 26</div>
          <div className="home-title">Fan<span>/</span>XI</div>
          <div className="home-sub">BAŞLANGIÇ 11'İNİ SEÇ · OY VER</div>
          <div className="team-grid">
            {Object.entries(TEAM_CONFIG).map(([key, t]) => (
              <div key={key} className="team-card" onClick={() => selectTeam(key)}>
                <div className="team-card-left">
                  <img className="team-card-logo" src={t.logo} alt={t.name} />
                  <div>
                    <div className="team-card-name">{t.name}</div>
                    <div className="team-card-meta">Kadroyu gör · Oy ver</div>
                  </div>
                </div>
                <div className="team-card-arrow">→</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="app">
      <div className="header">
        <button className="back-btn" onClick={() => setPage("home")}>← Geri</button>
        <div className="header-center">
          <h2 style={{ color: cfg.accent }}>{cfg.name}</h2>
          <p>{nextMatch ? `vs ${nextMatch.opponent} · ${nextMatch.venue}` : "Maç yükleniyor..."}</p>
        </div>
        <div className="countdown">
          <div className="countdown-val" style={{ color: locked ? "#ff6b6b" : cfg.accent }}>
            {nextMatch ? countdown : "—"}
          </div>
          <div className="countdown-lbl">{locked ? "Kapandı" : "KO"}</div>
        </div>
      </div>

      <div className="tabs">
        {[["vote", "⚽ Oy Ver"], ["results", "🏆 Fan XI"]].map(([t, lbl]) => (
          <button key={t} className={`tab ${tab === t ? "active" : ""}`} onClick={() => setTab(t)}>{lbl}</button>
        ))}
      </div>

      {loading && (
        <div className="loading">
          <div className="spinner" />
          <p>Kadro yükleniyor...</p>
        </div>
      )}

      {error && (
        <div style={{ margin: 20, padding: 16, background: "rgba(220,50,50,.1)", border: "1px solid rgba(220,50,50,.3)", borderRadius: 10, color: "#ff6b6b", fontFamily: "Space Mono,monospace", fontSize: 12 }}>
          ⚠️ {error}
        </div>
      )}

      {tab === "vote" && !loading && !error && (
        <div style={{display:"flex",gap:6,justifyContent:"center",padding:"0 16px 10px",flexWrap:"wrap"}}>
          {Object.keys(FORMATIONS).map(f => (
            <button key={f} onClick={() => setFormation(f)} style={{fontFamily:"Space Mono,monospace",fontSize:10,letterSpacing:1,padding:"5px 12px",borderRadius:6,border:formation===f?"1px solid rgba(255,255,255,.3)":"1px solid rgba(255,255,255,.1)",background:formation===f?"rgba(255,255,255,.1)":"transparent",color:formation===f?"#fff":"rgba(255,255,255,.35)",cursor:"pointer"}}>{f}</button>
          ))}
        </div>
      )}
      {!loading && !error && tab === "vote" && (
        <div className="pitch-wrap">
          <div className="formation-lbl">{formation}</div>
          {locked && <div className="lock-banner">🔒 Oylama kilitlendi — Maç başladı</div>}
          <div className="pitch">
            <div className="pitch-bg" />
            <div className="pitch-lines" />
            <div className="pitch-mid" />
            <div className="pitch-circle" />
            <div className="pitch-pen-t" />
            <div className="pitch-pen-b" />
            <div className="pitch-slots">
              {FORMATIONS[formation].map(pos => {
                const candidates = getCandidatesForSlot(players, pos.slot);
                const winnerId = VoteStore.getWinner(selectedTeam, pos.slot);
                const winner = candidates.find(p => String(p.id) === String(winnerId));
                const userVoteId = VoteStore.getUserVote(selectedTeam, pos.slot);
                const userVotedPlayer = candidates.find(p => String(p.id) === String(userVoteId));
                const display = userVotedPlayer || winner;
                const total = VoteStore.getTotal(selectedTeam, pos.slot);
                const wVotes = winnerId ? (VoteStore.getSlotVotes(selectedTeam, pos.slot)[winnerId] || 0) : 0;
                const pct = total > 0 ? Math.round(wVotes / total * 100) : 0;

                return (
                  <div
                    key={pos.slot}
                    className="pitch-slot"
                    style={{ gridRow: 6 - pos.row, gridColumn: pos.col }}
                    onClick={() => !locked && setModal(pos)}
                  >
                    <div className="slot-bubble">
                      <div
                        className={`slot-avatar ${userVoteId ? "voted" : ""} ${winner ? "has-winner" : ""}`}
                        style={{ background: cfg.gradient }}
                      >
                        {display && (
                          <div
                            className="slot-ring"
                            style={{ background: `conic-gradient(${cfg.accent} ${pct * 3.6}deg, transparent ${pct * 3.6}deg)` }}
                          />
                        )}
                        {display?.photo
                          ? <img src={display.photo} alt={display.name} style={{ width:"100%", height:"100%", objectFit:"cover", position:"relative", zIndex:1, borderRadius:"50%" }} onError={e => { e.target.style.display="none"; e.target.nextSibling.style.display="flex"; }} />
                          : null}
                        <span className="slot-initials" style={{ display: display?.photo ? "none" : "flex" }}>
                          {display ? getInitials(display.name) : <span style={{ color: "rgba(255,255,255,.2)", fontSize: 14 }}>+</span>}
                        </span>
                      </div>
                      <span className="slot-name">{display ? display.name.split(" ").pop() : pos.label}</span>
                      <span className="slot-pos">{pos.label}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          <div style={{ fontSize: 10, color: "rgba(255,255,255,.3)", fontFamily: "Space Mono,monospace", textAlign: "center" }}>
            Pozisyona tıkla → Oyuncu seç → Oy ver
          </div>
        </div>
      )}

      {!loading && !error && tab === "results" && (
        <div className="results">
          <div className="results-title">Fan Starting XI</div>
          <div className="results-sub">{cfg.name} · {formation}</div>
          <div className="xi-grid">
            {FORMATIONS[formation].map(pos => {
              const candidates = getCandidatesForSlot(players, pos.slot);
              const winnerId = VoteStore.getWinner(selectedTeam, pos.slot);
              const winner = candidates.find(p => String(p.id) === String(winnerId));
              const total = VoteStore.getTotal(selectedTeam, pos.slot);
              const wVotes = winnerId ? (VoteStore.getSlotVotes(selectedTeam, pos.slot)[winnerId] || 0) : 0;
              return (
                <div key={pos.slot} className="xi-card">
                  <div className="xi-avatar" style={{ background: cfg.gradient, border: `2px solid ${cfg.accent}` }}>
                    {winner ? getInitials(winner.name) : "?"}
                  </div>
                  <div>
                    <div className="xi-pos">{pos.label}</div>
                    <div className="xi-name">{winner ? winner.name : "Oy yok"}</div>
                    {winner && <div className="xi-votes">{wVotes}/{total} oy ({total > 0 ? Math.round(wVotes / total * 100) : 0}%)</div>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {modal && (
        <VoteModal
          pos={modal}
          players={players}
          teamKey={selectedTeam}
          cfg={cfg}
          locked={locked}
          onClose={() => setModal(null)}
          onVoted={(ok) => {
            setModal(null);
            forceUpdate(n => n + 1);
            showToast(ok ? "✅ Oyunuz kaydedildi!" : "⚠️ Bu pozisyon için zaten oy kullandınız", ok ? "success" : "error");
          }}
        />
      )}

      {toast && <div className={`toast ${toast.type}`}>{toast.msg}</div>}
    </div>
  );
}

// ─── OY MODAL ────────────────────────────────────────────────────────────────
function VoteModal({ pos, players, teamKey, cfg, locked, onClose, onVoted }) {
  const [selected, setSelected] = useState(null);
  const candidates = getCandidatesForSlot(players, pos.slot);
  const userVoteId = VoteStore.getUserVote(teamKey, pos.slot);
  const slotVotes = VoteStore.getSlotVotes(teamKey, pos.slot);
  const total = Object.values(slotVotes).reduce((a, b) => a + b, 0);

  function handleVote() {
    if (!selected || locked || userVoteId) return;
    const ok = VoteStore.cast(teamKey, pos.slot, selected);
    onVoted(ok);
  }

  return (
    <div className="overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-head">
          <div>
            <div className="modal-title">{pos.label} Pozisyonu</div>
            <div className="modal-sub">{total} oy · {candidates.filter(p => !p.injured && !p.suspended).length} uygun oyuncu</div>
          </div>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <div className="modal-body">
          {locked && (
            <div style={{ textAlign: "center", padding: 10, color: "#ffa500", fontFamily: "Space Mono,monospace", fontSize: 11, marginBottom: 12, background: "rgba(255,140,0,.08)", borderRadius: 8, border: "1px solid rgba(255,140,0,.2)" }}>
              🔒 Oylama kapandı
            </div>
          )}
          {candidates.length === 0 && (
            <div style={{ textAlign: "center", padding: 20, color: "rgba(255,255,255,.4)", fontSize: 13 }}>
              Bu pozisyon için oyuncu bulunamadı
            </div>
          )}
          {candidates.map(p => {
            const pVotes = slotVotes[p.id] || 0;
            const pPct = total > 0 ? Math.round(pVotes / total * 100) : 0;
            const unavail = p.injured || p.suspended;
            const isMe = String(userVoteId) === String(p.id);
            const isSel = String(selected) === String(p.id);

            return (
              <div
                key={p.id}
                className={`player-opt ${unavail ? "disabled" : ""} ${isMe ? "my-vote" : ""} ${isSel && !isMe ? "selected" : ""}`}
                onClick={() => !unavail && !locked && !userVoteId && setSelected(p.id)}
              >
                <div className="opt-avatar" style={{ background: cfg.gradient, overflow:"hidden", padding:0 }}>
                  {p.photo
                    ? <img src={p.photo} alt={p.name} style={{ width:"100%", height:"100%", objectFit:"cover" }} onError={e => { e.target.style.display="none"; e.target.parentNode.innerText=getInitials(p.name); }} />
                    : getInitials(p.name)}
                </div>
                <div className="opt-info">
                  <div className="opt-name">{p.name}</div>
                  <div className="opt-meta">
                    <span className="opt-num">#{p.number}</span>
                    {p.injured && <span className="badge badge-inj">🏥 {p.injuryReason || "Sakat"}</span>}
                    {p.suspended && <span className="badge badge-sus">🟨 Cezalı</span>}
                    {isMe && <span className="badge-me">★ Oyunuz</span>}
                  </div>
                  <div className="bar-wrap">
                    <div className="bar-info">
                      <span className="bar-pct">%{pPct}</span>
                      <span className="bar-pct">{pVotes} oy</span>
                    </div>
                    <div className="bar-track">
                      <div className="bar-fill" style={{ width: `${pPct}%`, background: unavail ? "rgba(255,255,255,.15)" : cfg.accent }} />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
          {!userVoteId && !locked && (
            <button
              className="vote-btn"
              style={{ background: cfg.accent, color: cfg.primary }}
              onClick={handleVote}
              disabled={!selected}
            >
              Oyu Kaydet
            </button>
          )}
        </div>
      </div>
    </div>
  );
}