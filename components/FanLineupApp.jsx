"use client";

import { useState, useEffect, useRef } from "react";

// ─── CONFIG ──────────────────────────────────────────────────────────────────
const BJK = {
  id: 549,
  leagueId: 203,
  logo: "https://media.api-sports.io/football/teams/549.png",
  accent: "#E0E0E0",
  gradient: "linear-gradient(135deg, #1a1a1a 0%, #000000 100%)",
};

// ─── DİZİLİŞLER ──────────────────────────────────────────────────────────────
// row: 1=GK, 2=DEF, 3=MID1, 4=MID2, 5=FWD — col: 1-5 (ortada 3)
const FORMATIONS = {
  "4-2-3-1": [
    { slot:"GK",   label:"GK",  row:1, col:3, accepts:["GK"] },
    { slot:"LB",   label:"LB",  row:2, col:1, accepts:["CB"] },
    { slot:"CB1",  label:"CB",  row:2, col:2, accepts:["CB"] },
    { slot:"CB2",  label:"CB",  row:2, col:4, accepts:["CB"] },
    { slot:"RB",   label:"RB",  row:2, col:5, accepts:["CB"] },
    { slot:"CDM1", label:"CDM", row:3, col:2, accepts:["CM"] },
    { slot:"CDM2", label:"CDM", row:3, col:4, accepts:["CM"] },
    { slot:"LW",   label:"LW",  row:4, col:1, accepts:["CM","ST"] },
    { slot:"CAM",  label:"CAM", row:4, col:3, accepts:["CM"] },
    { slot:"RW",   label:"RW",  row:4, col:5, accepts:["CM","ST"] },
    { slot:"ST",   label:"ST",  row:5, col:3, accepts:["ST"] },
  ],
  "4-3-3": [
    { slot:"GK",  label:"GK", row:1, col:3, accepts:["GK"] },
    { slot:"LB",  label:"LB", row:2, col:1, accepts:["CB"] },
    { slot:"CB1", label:"CB", row:2, col:2, accepts:["CB"] },
    { slot:"CB2", label:"CB", row:2, col:4, accepts:["CB"] },
    { slot:"RB",  label:"RB", row:2, col:5, accepts:["CB"] },
    { slot:"CM1", label:"CM", row:3, col:1, accepts:["CM"] },
    { slot:"CM2", label:"CM", row:3, col:3, accepts:["CM"] },
    { slot:"CM3", label:"CM", row:3, col:5, accepts:["CM"] },
    { slot:"LW",  label:"LW", row:5, col:1, accepts:["CM","ST"] },
    { slot:"ST",  label:"ST", row:5, col:3, accepts:["ST"] },
    { slot:"RW",  label:"RW", row:5, col:5, accepts:["CM","ST"] },
  ],
  "4-4-2": [
    { slot:"GK",  label:"GK", row:1, col:3, accepts:["GK"] },
    { slot:"LB",  label:"LB", row:2, col:1, accepts:["CB"] },
    { slot:"CB1", label:"CB", row:2, col:2, accepts:["CB"] },
    { slot:"CB2", label:"CB", row:2, col:4, accepts:["CB"] },
    { slot:"RB",  label:"RB", row:2, col:5, accepts:["CB"] },
    { slot:"LM",  label:"LM", row:3, col:1, accepts:["CM"] },
    { slot:"CM1", label:"CM", row:3, col:2, accepts:["CM"] },
    { slot:"CM2", label:"CM", row:3, col:4, accepts:["CM"] },
    { slot:"RM",  label:"RM", row:3, col:5, accepts:["CM"] },
    { slot:"ST1", label:"ST", row:5, col:2, accepts:["ST"] },
    { slot:"ST2", label:"ST", row:5, col:4, accepts:["ST"] },
  ],
  "3-5-2": [
    { slot:"GK",  label:"GK", row:1, col:3, accepts:["GK"] },
    { slot:"CB1", label:"CB", row:2, col:2, accepts:["CB"] },
    { slot:"CB2", label:"CB", row:2, col:3, accepts:["CB"] },
    { slot:"CB3", label:"CB", row:2, col:4, accepts:["CB"] },
    { slot:"WBL", label:"WB", row:3, col:1, accepts:["CB","CM"] },
    { slot:"CM1", label:"CM", row:3, col:2, accepts:["CM"] },
    { slot:"CM2", label:"CM", row:3, col:3, accepts:["CM"] },
    { slot:"CM3", label:"CM", row:3, col:4, accepts:["CM"] },
    { slot:"WBR", label:"WB", row:3, col:5, accepts:["CB","CM"] },
    { slot:"ST1", label:"ST", row:5, col:2, accepts:["ST"] },
    { slot:"ST2", label:"ST", row:5, col:4, accepts:["ST"] },
  ],
  "5-3-2": [
    { slot:"GK",  label:"GK", row:1, col:3, accepts:["GK"] },
    { slot:"LWB", label:"WB", row:2, col:1, accepts:["CB"] },
    { slot:"CB1", label:"CB", row:2, col:2, accepts:["CB"] },
    { slot:"CB2", label:"CB", row:2, col:3, accepts:["CB"] },
    { slot:"CB3", label:"CB", row:2, col:4, accepts:["CB"] },
    { slot:"RWB", label:"WB", row:2, col:5, accepts:["CB"] },
    { slot:"CM1", label:"CM", row:3, col:2, accepts:["CM"] },
    { slot:"CM2", label:"CM", row:3, col:3, accepts:["CM"] },
    { slot:"CM3", label:"CM", row:3, col:4, accepts:["CM"] },
    { slot:"ST1", label:"ST", row:5, col:2, accepts:["ST"] },
    { slot:"ST2", label:"ST", row:5, col:4, accepts:["ST"] },
  ],
};

function posKey(p) {
  const m = { "Goalkeeper":"GK","Defender":"CB","Midfielder":"CM","Attacker":"ST" };
  return m[p] || "CM";
}

function initials(name) {
  const p = name.trim().split(" ");
  return p.length >= 2 ? p[0][0]+p[p.length-1][0] : name.slice(0,2);
}

function formatKickoff(date) {
  const diff = date - Date.now();
  if (diff <= 0) return "CANLI";
  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(mins / 60);
  const days = Math.floor(hours / 24);
  if (diff < 3600000) return `${mins}dk`;
  if (diff < 86400000) return `${hours}s ${mins % 60}dk`;
  return `${days}g ${hours % 24}s`;
}

// ─── CSS ─────────────────────────────────────────────────────────────────────
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@600;700;800&family=DM+Sans:wght@400;500;600&family=Space+Mono:wght@400;700&display=swap');
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
html,body{height:100%;font-family:'DM Sans',sans-serif;background:#0a0a0d;color:#fff;}
.app{min-height:100vh;}

/* HOME */
.home{min-height:100vh;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:40px 20px;background:#0a0a0d;}
.home-eyebrow{font-family:'Space Mono',monospace;font-size:10px;letter-spacing:5px;color:rgba(255,255,255,.25);margin-bottom:20px;text-align:center;}
.home-title{font-family:'Barlow Condensed',sans-serif;font-size:clamp(64px,12vw,120px);font-weight:800;letter-spacing:2px;text-align:center;line-height:.9;color:#fff;margin-bottom:6px;}
.home-title span{color:rgba(255,255,255,.12);}
.home-sub{font-family:'Space Mono',monospace;font-size:11px;letter-spacing:3px;color:rgba(255,255,255,.3);margin-bottom:56px;text-align:center;}
.team-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:1px;max-width:640px;width:100%;border:1px solid rgba(255,255,255,.06);border-radius:16px;overflow:hidden;}
@media(max-width:480px){.team-grid{grid-template-columns:1fr;}}
.team-card{cursor:pointer;padding:24px 20px;display:flex;align-items:center;justify-content:space-between;background:#111114;transition:background .2s;}
.team-card:hover{background:#18181c;}
.team-card+.team-card{border-top:1px solid rgba(255,255,255,.06);}
.team-card:nth-child(odd){border-right:1px solid rgba(255,255,255,.06);}
.tc-left{display:flex;align-items:center;gap:12px;}
.tc-logo{width:30px;height:30px;object-fit:contain;filter:drop-shadow(0 2px 6px rgba(0,0,0,.5));}
.tc-name{font-family:'Barlow Condensed',sans-serif;font-size:20px;font-weight:700;letter-spacing:1px;color:#fff;}
.tc-meta{font-family:'Space Mono',monospace;font-size:9px;color:rgba(255,255,255,.3);margin-top:2px;}
.tc-arrow{font-size:14px;color:rgba(255,255,255,.15);transition:color .2s,transform .2s;}
.team-card:hover .tc-arrow{color:rgba(255,255,255,.5);transform:translateX(4px);}

/* HEADER */
.hdr{padding:12px 16px;display:flex;align-items:center;justify-content:space-between;border-bottom:1px solid rgba(255,255,255,.07);background:rgba(10,10,13,.9);backdrop-filter:blur(16px);position:sticky;top:0;z-index:50;}
.back-btn{background:rgba(255,255,255,.07);border:1px solid rgba(255,255,255,.1);color:#fff;padding:6px 14px;border-radius:7px;cursor:pointer;font-size:13px;transition:background .15s;}
.back-btn:hover{background:rgba(255,255,255,.12);}
.hdr-center{text-align:center;}
.hdr-center h2{font-family:'Barlow Condensed',sans-serif;font-size:18px;font-weight:700;letter-spacing:2px;}
.hdr-center p{font-size:10px;color:rgba(255,255,255,.4);margin-top:1px;}
.hdr-logo{width:32px;height:32px;object-fit:contain;}

/* TABS */
.tabs{display:flex;border-bottom:1px solid rgba(255,255,255,.07);}
.tab-btn{flex:1;padding:10px;font-family:'Space Mono',monospace;font-size:10px;letter-spacing:2px;text-transform:uppercase;background:transparent;border:none;color:rgba(255,255,255,.35);cursor:pointer;transition:all .15s;border-bottom:2px solid transparent;margin-bottom:-1px;}
.tab-btn.active{color:#fff;border-bottom-color:#fff;}

/* LOADING */
.loading{display:flex;flex-direction:column;align-items:center;justify-content:center;padding:80px 20px;gap:14px;}
.spinner{width:36px;height:36px;border:3px solid rgba(255,255,255,.08);border-top-color:rgba(255,255,255,.5);border-radius:50%;animation:spin .7s linear infinite;}
@keyframes spin{to{transform:rotate(360deg);}}
.loading p{font-family:'Space Mono',monospace;font-size:10px;letter-spacing:2px;color:rgba(255,255,255,.35);}

/* DRAG-DROP MAIN LAYOUT */
.builder{display:flex;gap:0;height:calc(100vh - 96px);overflow:hidden;}

/* LEFT: PITCH */
.pitch-side{flex:1;min-width:0;display:flex;flex-direction:column;padding:10px 8px;gap:8px;border-right:1px solid rgba(255,255,255,.06);}
.formation-bar{display:flex;gap:4px;flex-wrap:wrap;}
.f-btn{font-family:'Space Mono',monospace;font-size:9px;letter-spacing:1px;padding:4px 10px;border-radius:5px;border:1px solid rgba(255,255,255,.1);background:transparent;color:rgba(255,255,255,.35);cursor:pointer;transition:all .15s;}
.f-btn.active{background:rgba(255,255,255,.1);color:#fff;border-color:rgba(255,255,255,.25);}
.pitch{position:relative;width:100%;max-width:320px;margin:0 auto;aspect-ratio:2/3;border-radius:8px;overflow:hidden;background:repeating-linear-gradient(0deg,#2a7336 0px,#2a7336 44px,#317a3d 44px,#317a3d 88px);}
.pitch-lines{position:absolute;inset:0;border:2px solid rgba(255,255,255,.25);border-radius:8px;pointer-events:none;}
.pitch-mid{position:absolute;left:0;right:0;top:50%;height:1px;background:rgba(255,255,255,.25);pointer-events:none;}
.pitch-circle{position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);width:70px;height:70px;border:1px solid rgba(255,255,255,.25);border-radius:50%;pointer-events:none;}
.pitch-pen-t{position:absolute;left:50%;transform:translateX(-50%);width:50%;height:17%;border:1px solid rgba(255,255,255,.25);top:0;border-top:none;border-radius:0 0 4px 4px;pointer-events:none;}
.pitch-pen-b{position:absolute;left:50%;transform:translateX(-50%);width:50%;height:17%;border:1px solid rgba(255,255,255,.25);bottom:0;border-bottom:none;border-radius:4px 4px 0 0;pointer-events:none;}
.pitch-slots{position:absolute;inset:0;display:grid;grid-template-rows:repeat(5,1fr);grid-template-columns:repeat(5,1fr);padding:4px;}
.pitch-slot{display:flex;align-items:center;justify-content:center;}
.slot-drop{width:48px;height:64px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:2px;border-radius:8px;border:1px dashed rgba(255,255,255,.2);background:rgba(0,0,0,.15);transition:all .15s;cursor:pointer;}
.slot-drop.over{border-color:#FFD700;background:rgba(255,215,0,.15);}
.slot-drop.filled{border:none;background:transparent;}
.slot-avatar{width:40px;height:40px;border-radius:50%;background:linear-gradient(135deg,#1a1a1a,#000);border:2px solid rgba(255,255,255,.3);overflow:hidden;display:flex;align-items:center;justify-content:center;font-family:'Space Mono',monospace;font-size:8px;font-weight:700;position:relative;box-shadow:0 2px 8px rgba(0,0,0,.5);}
.slot-avatar img{width:100%;height:100%;object-fit:cover;}
.slot-label{font-size:7px;font-weight:700;text-align:center;max-width:46px;line-height:1.2;text-shadow:0 1px 3px rgba(0,0,0,.9);}
.slot-pos-tag{font-family:'Space Mono',monospace;font-size:6px;background:rgba(0,0,0,.5);padding:1px 3px;border-radius:3px;color:rgba(255,255,255,.5);}
.remove-btn{position:absolute;top:-4px;right:-4px;width:14px;height:14px;border-radius:50%;background:#cc2222;border:none;color:#fff;font-size:8px;cursor:pointer;display:flex;align-items:center;justify-content:center;line-height:1;z-index:10;}

/* RIGHT: SQUAD LIST */
.squad-side{width:160px;flex-shrink:0;display:flex;flex-direction:column;overflow:hidden;}
.squad-header{padding:8px 10px;font-family:'Space Mono',monospace;font-size:9px;letter-spacing:2px;color:rgba(255,255,255,.35);border-bottom:1px solid rgba(255,255,255,.06);}
.squad-list{flex:1;overflow-y:auto;padding:6px;}
.squad-group{margin-bottom:6px;}
.squad-group-label{font-family:'Space Mono',monospace;font-size:8px;letter-spacing:2px;color:rgba(255,255,255,.25);padding:3px 4px;margin-bottom:3px;}
.squad-player{display:flex;align-items:center;gap:7px;padding:5px 6px;border-radius:7px;border:1px solid rgba(255,255,255,.06);background:rgba(255,255,255,.03);cursor:grab;transition:all .15s;margin-bottom:3px;user-select:none;}
.squad-player:active{cursor:grabbing;opacity:.7;}
.squad-player.dragging{opacity:.4;}
.squad-player.unavail{opacity:.3;cursor:not-allowed;}
.squad-player.placed{opacity:.25;cursor:default;}
.sp-avatar{width:28px;height:28px;border-radius:50%;background:linear-gradient(135deg,#1a1a1a,#000);border:1px solid rgba(255,255,255,.15);overflow:hidden;flex-shrink:0;display:flex;align-items:center;justify-content:center;font-family:'Space Mono',monospace;font-size:7px;}
.sp-avatar img{width:100%;height:100%;object-fit:cover;}
.sp-info{min-width:0;flex:1;}
.sp-name{font-size:10px;font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
.sp-num{font-family:'Space Mono',monospace;font-size:8px;color:rgba(255,255,255,.3);}
.sp-badge{font-size:8px;}
.squad-list::-webkit-scrollbar{width:2px;}
.squad-list::-webkit-scrollbar-thumb{background:rgba(255,255,255,.1);border-radius:2px;}

/* FIXTURES TAB */
.fixtures{padding:16px;}
.fix-title{font-family:'Barlow Condensed',sans-serif;font-size:28px;font-weight:700;letter-spacing:2px;margin-bottom:16px;}
.fix-card{background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.08);border-radius:12px;padding:16px;margin-bottom:10px;display:flex;align-items:center;justify-content:space-between;}
.fix-card.next{border-color:rgba(255,255,255,.2);background:rgba(255,255,255,.07);}
.fix-teams{display:flex;align-items:center;gap:10px;}
.fix-team-name{font-family:'Barlow Condensed',sans-serif;font-size:16px;font-weight:700;letter-spacing:1px;}
.fix-vs{font-family:'Space Mono',monospace;font-size:10px;color:rgba(255,255,255,.3);padding:0 4px;}
.fix-time{text-align:right;}
.fix-countdown{font-family:'Space Mono',monospace;font-size:14px;font-weight:700;color:#FFD700;}
.fix-date{font-family:'Space Mono',monospace;font-size:9px;color:rgba(255,255,255,.35);margin-top:2px;}
.fix-venue{font-size:10px;color:rgba(255,255,255,.3);margin-top:4px;}
.fix-comp{font-family:'Space Mono',monospace;font-size:8px;letter-spacing:1px;color:rgba(255,255,255,.2);margin-bottom:4px;}
.fix-next-badge{font-family:'Space Mono',monospace;font-size:8px;letter-spacing:2px;background:rgba(255,255,255,.1);border-radius:4px;padding:2px 6px;color:rgba(255,255,255,.5);margin-bottom:6px;display:inline-block;}

/* CONFIRM BAR */
.confirm-bar{padding:10px 12px;border-top:1px solid rgba(255,255,255,.08);background:rgba(10,10,13,.95);}
.confirm-btn{width:100%;padding:12px;border-radius:10px;border:none;background:#fff;color:#000;font-family:'Barlow Condensed',sans-serif;font-size:16px;font-weight:700;letter-spacing:2px;cursor:pointer;transition:opacity .15s;}
.confirm-btn:disabled{opacity:.25;cursor:not-allowed;}
.confirm-btn:not(:disabled):hover{opacity:.85;}
.confirm-count{text-align:center;font-family:'Space Mono',monospace;font-size:9px;color:rgba(255,255,255,.3);margin-bottom:6px;}

/* RESULTS */
.results-page{padding:16px;}
.results-title{font-family:'Barlow Condensed',sans-serif;font-size:32px;font-weight:800;letter-spacing:2px;margin-bottom:4px;}
.results-sub{font-family:'Space Mono',monospace;font-size:9px;color:rgba(255,255,255,.3);letter-spacing:2px;margin-bottom:16px;}
.results-pitch{position:relative;width:100%;max-width:480px;aspect-ratio:7/10;border-radius:8px;overflow:hidden;background:repeating-linear-gradient(0deg,#2a7336 0px,#2a7336 44px,#317a3d 44px,#317a3d 88px);margin:0 auto 16px;}
.res-slot{position:absolute;display:flex;flex-direction:column;align-items:center;gap:2px;transform:translate(-50%,-50%);}
.res-avatar{width:44px;height:44px;border-radius:50%;background:linear-gradient(135deg,#1a1a1a,#000);border:2px solid rgba(255,255,255,.4);overflow:hidden;display:flex;align-items:center;justify-content:center;font-family:'Space Mono',monospace;font-size:8px;font-weight:700;}
.res-avatar img{width:100%;height:100%;object-fit:cover;}
.res-name{font-size:7px;font-weight:700;text-align:center;max-width:50px;line-height:1.2;text-shadow:0 1px 3px rgba(0,0,0,.9);}
.res-pct{font-family:'Space Mono',monospace;font-size:6px;background:rgba(0,0,0,.6);padding:1px 4px;border-radius:3px;color:#FFD700;}
.res-empty{border:1px dashed rgba(255,255,255,.15);color:rgba(255,255,255,.2);font-family:'Space Mono',monospace;font-size:6px;}
.results-vote-again{display:block;margin:0 auto;padding:10px 24px;border-radius:8px;border:1px solid rgba(255,255,255,.15);background:transparent;color:#fff;font-family:'Barlow Condensed',sans-serif;font-size:14px;font-weight:700;letter-spacing:2px;cursor:pointer;}

/* TOAST */
.toast{position:fixed;bottom:20px;left:50%;transform:translateX(-50%);background:#1a1a22;border:1px solid rgba(255,255,255,.12);border-radius:10px;padding:10px 16px;font-size:12px;z-index:999;animation:tin .2s ease;white-space:nowrap;}
@keyframes tin{from{transform:translateX(-50%) translateY(12px);opacity:0;}to{transform:translateX(-50%) translateY(0);opacity:1;}}
.toast.ok{border-color:rgba(50,200,80,.4);color:#50dd70;}
.toast.err{border-color:rgba(220,50,50,.4);color:#ff6b6b;}
`;

// ─── MAIN APP ─────────────────────────────────────────────────────────────────
export default function App() {
  const [page, setPage] = useState("home");
  const [tab, setTab] = useState("builder");
  const [players, setPlayers] = useState([]);
  const [fixtures, setFixtures] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formation, setFormation] = useState("4-2-3-1");
  const [lineup, setLineup] = useState({});
  const [dragPlayer, setDragPlayer] = useState(null);
  const [overSlot, setOverSlot] = useState(null);
  const [toast, setToast] = useState(null);
  const [, tick] = useState(0);
  const [hasVoted, setHasVoted] = useState(false);
  const [globalVotes, setGlobalVotes] = useState({});

  useEffect(() => {
    const s = document.createElement("style");
    s.textContent = CSS;
    document.head.appendChild(s);
    return () => s.remove();
  }, []);

  // Countdown tick
  useEffect(() => {
    const t = setInterval(() => tick(n => n+1), 30000);
    return () => clearInterval(t);
  }, []);

  async function loadData() {
    setLoading(true);
    try {
      const [sRes, iRes, fRes] = await Promise.all([
        fetch(`/api/squad?team=${BJK.id}`),
        fetch(`/api/injuries?team=${BJK.id}&league=${BJK.leagueId}`),
        fetch(`/api/fixtures?team=${BJK.id}`),
      ]);
      const sData = await sRes.json();
      const iData = await iRes.json();
      const fData = await fRes.json();

      const injMap = {};
      (iData.injuries || []).forEach(i => { injMap[i.playerId] = i; });

      const pl = (sData.players || []).map(p => ({
        id: p.id,
        name: p.name,
        number: p.number,
        posKey: posKey(p.position),
        photo: p.photo,
        injured: injMap[p.id]?.type === "Injury",
        suspended: injMap[p.id]?.type === "Suspension",
        injNote: injMap[p.id]?.reason || null,
      }));
      setPlayers(pl);
      setFixtures(fData.fixtures || []);
    } catch(e) {
      showToast("API bağlantı hatası", "err");
    }
    setLoading(false);
  }

  function openBesiktas() {
    setPage("match");
    setTab("builder");
    setLineup({});
    loadData();
  }

  function showToast(msg, type="ok") {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 2000);
  }

  // Drag handlers
  function onDragStart(player) {
    if (player.injured || player.suspended) return;
    setDragPlayer(player);
  }

  function onDragEnd() {
    setDragPlayer(null);
    setOverSlot(null);
  }

  function onDrop(slotDef) {
    if (!dragPlayer) return;
    if (!slotDef.accepts.includes(dragPlayer.posKey)) {
      showToast("Bu pozisyona uygun değil", "err");
      setDragPlayer(null);
      setOverSlot(null);
      return;
    }
    setLineup(prev => {
      const next = { ...prev };
      // Remove player from any existing slot
      Object.keys(next).forEach(k => {
        if (next[k]?.id === dragPlayer.id) delete next[k];
      });
      next[slotDef.slot] = dragPlayer;
      return next;
    });
    setDragPlayer(null);
    setOverSlot(null);
  }

  function removeFromSlot(slot) {
    setLineup(prev => { const n={...prev}; delete n[slot]; return n; });
  }

  function submitVote() {
    // Save to sessionStorage as global votes (simulate multi-user)
    const stored = (() => { try { return JSON.parse(sessionStorage.getItem("bjk_votes")||"{}"); } catch { return {}; } })();
    const updated = { ...stored };
    Object.entries(lineup).forEach(([slot, player]) => {
      if (!updated[slot]) updated[slot] = {};
      updated[slot][player.id] = (updated[slot][player.id] || 0) + 1;
    });
    try { sessionStorage.setItem("bjk_votes", JSON.stringify(updated)); } catch {}
    setGlobalVotes(updated);
    setHasVoted(true);
    setPage("results");
  }

  function loadResults() {
    try {
      const stored = JSON.parse(sessionStorage.getItem("bjk_votes")||"{}");
      setGlobalVotes(stored);
    } catch {}
  }

  const placedIds = new Set(Object.values(lineup).map(p => p?.id));
  const formation_slots = FORMATIONS[formation];
  const isComplete = Object.keys(lineup).length === formation_slots.length;

  // Group players
  const grouped = {
    "KALECI": players.filter(p => p.posKey === "GK"),
    "DEFANS": players.filter(p => p.posKey === "CB"),
    "ORTA SAHA": players.filter(p => p.posKey === "CM"),
    "FORVET": players.filter(p => p.posKey === "ST"),
  };

  // ── HOME ──
  if (page === "home") {
    const teamList = [
      { key:"besiktas", name:"BEŞİKTAŞ", logo:"https://media.api-sports.io/football/teams/549.png", accent:"#E0E0E0" },
      { key:"fenerbahce", name:"FENERBAHÇE", logo:"https://media.api-sports.io/football/teams/611.png", accent:"#FFCB00" },
      { key:"galatasaray", name:"GALATASARAY", logo:"https://media.api-sports.io/football/teams/645.png", accent:"#FF8C00" },
      { key:"trabzonspor", name:"TRABZONSPOR", logo:"https://media.api-sports.io/football/teams/998.png", accent:"#00BFFF" },
    ];
    return (
      <div className="app">
        <div className="home">
          <div className="home-eyebrow">SÜPER LİG · 2024/25</div>
          <div className="home-title">FAN<span>/</span>XI</div>
          <div className="home-sub">BAŞLANGIÇ 11'İNİ OLUŞTUR</div>
          <div className="team-grid">
            {teamList.map(t => (
              <div key={t.key} className="team-card" onClick={t.key==="besiktas" ? openBesiktas : undefined}
                style={t.key!=="besiktas" ? {opacity:.4,cursor:"not-allowed"} : {}}>
                <div className="tc-left">
                  <img className="tc-logo" src={t.logo} alt={t.name} />
                  <div>
                    <div className="tc-name">{t.name}</div>
                    <div className="tc-meta">{t.key==="besiktas" ? "Kadroyu oluştur →" : "Yakında"}</div>
                  </div>
                </div>
                <div className="tc-arrow">→</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ── RESULTS PAGE ──
  if (page === "results") {
    const slots = FORMATIONS[formation];
    return (
      <div className="app">
        <div className="hdr">
          <button className="back-btn" onClick={() => { setPage("match"); setHasVoted(false); setLineup({}); loadResults(); }}>← Kadro</button>
          <div className="hdr-center"><h2>FAN XI SONUÇLARI</h2><p>BEŞİKTAŞ · {formation}</p></div>
          <img className="hdr-logo" src={BJK.logo} alt="BJK" />
        </div>
        <div className="results-page">
          <div className="results-title">FAN XI</div>
          <div className="results-sub">TOPLAM OYLAR · {formation}</div>
          <div className="results-pitch">
            <div style={{position:"absolute",inset:0,border:"2px solid rgba(255,255,255,.2)",borderRadius:8,pointerEvents:"none"}}/>
            <div style={{position:"absolute",left:0,right:0,top:"50%",height:1,background:"rgba(255,255,255,.2)",pointerEvents:"none"}}/>
            {slots.map(pos => {
              const slotVotes = globalVotes[pos.slot] || {};
              const sorted = Object.entries(slotVotes).sort((a,b)=>b[1]-a[1]);
              const total = sorted.reduce((s,[,v])=>s+v,0);
              const winnerId = sorted[0]?.[0];
              const winVotes = sorted[0]?.[1] || 0;
              const pct = total > 0 ? Math.round(winVotes/total*100) : 0;
              const winner = players.find(p => String(p.id) === String(winnerId));
              const left = ((pos.col-1)/4*80+10) + "%";
              const top = ((5-pos.row)/4*80+10) + "%";
              return (
                <div key={pos.slot} className="res-slot" style={{left, top}}>
                  <div className={`res-avatar ${!winner?"res-empty":""}`}>
                    {winner?.photo
                      ? <img src={winner.photo} alt={winner.name} onError={e=>{e.target.style.display="none";}}/>
                      : winner ? initials(winner.name) : pos.label
                    }
                  </div>
                  {winner && <span className="res-name">{winner.name.split(" ").pop()}</span>}
                  {winner && <span className="res-pct">%{pct}</span>}
                  {!winner && <span className="res-name" style={{color:"rgba(255,255,255,.2)"}}>{pos.label}</span>}
                </div>
              );
            })}
          </div>
          <button className="results-vote-again" onClick={() => { setPage("match"); setHasVoted(false); setLineup({}); }}>
            YENİDEN OY VER
          </button>
        </div>
        {toast && <div className={`toast ${toast.type}`}>{toast.msg}</div>}
      </div>
    );
  }

  // ── MATCH PAGE ──
  return (
    <div className="app">
      {/* Header */}
      <div className="hdr">
        <button className="back-btn" onClick={() => setPage("home")}>← Geri</button>
        <div className="hdr-center">
          <h2>BEŞİKTAŞ</h2>
          <p>Kadro Oluştur</p>
        </div>
        <img className="hdr-logo" src={BJK.logo} alt="BJK" />
      </div>

      {/* Tabs */}
      <div className="tabs">
        <button className={`tab-btn ${tab==="builder"?"active":""}`} onClick={() => setTab("builder")}>⚽ KADRO</button>
      </div>

      {loading && (
        <div className="loading">
          <div className="spinner"/>
          <p>Kadro yükleniyor...</p>
        </div>
      )}

      {/* BUILDER TAB */}
      {!loading && tab === "builder" && (
        <div className="builder">
          {/* LEFT: Pitch */}
          <div className="pitch-side">
            <div className="formation-bar">
              {Object.keys(FORMATIONS).map(f => (
                <button key={f} className={`f-btn ${formation===f?"active":""}`}
                  onClick={() => { setFormation(f); setLineup({}); }}>
                  {f}
                </button>
              ))}
            </div>
            <div className="pitch"
              onDragOver={e => e.preventDefault()}
            >
              <div className="pitch-lines"/>
              <div className="pitch-mid"/>
              <div className="pitch-circle"/>
              <div className="pitch-pen-t"/>
              <div className="pitch-pen-b"/>
              <div className="pitch-slots">
                {formation_slots.map(pos => {
                  const player = lineup[pos.slot];
                  const isOver = overSlot === pos.slot;
                  return (
                    <div
                      key={pos.slot}
                      className="pitch-slot"
                      style={{ gridRow: 6-pos.row, gridColumn: pos.col }}
                    >
                      <div
                        className={`slot-drop ${isOver?"over":""} ${player?"filled":""}`}
                        onDragOver={e => { e.preventDefault(); setOverSlot(pos.slot); }}
                        onDragLeave={() => setOverSlot(null)}
                        onDrop={() => onDrop(pos)}
                      >
                        {player ? (
                          <div style={{position:"relative",display:"flex",flexDirection:"column",alignItems:"center",gap:2}}>
                            <button className="remove-btn" onClick={() => removeFromSlot(pos.slot)}>×</button>
                            <div className="slot-avatar">
                              {player.photo
                                ? <img src={player.photo} alt={player.name} onError={e=>{e.target.style.display="none";}}/>
                                : initials(player.name)
                              }
                            </div>
                            <span className="slot-label">{player.name.split(" ").pop()}</span>
                            <span className="slot-pos-tag">{pos.label}</span>
                          </div>
                        ) : (
                          <>
                            <span style={{fontSize:9,color:"rgba(255,255,255,.2)",fontFamily:"Space Mono,monospace"}}>{pos.label}</span>
                          </>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* RIGHT: Squad */}
          <div className="squad-side">
            <div className="squad-header">KADRO</div>
            <div className="squad-list">
              {Object.entries(grouped).map(([grp, pls]) => (
                <div key={grp} className="squad-group">
                  <div className="squad-group-label">{grp}</div>
                  {pls.map(p => {
                    const unavail = p.injured || p.suspended;
                    const placed = placedIds.has(p.id);
                    return (
                      <div
                        key={p.id}
                        className={`squad-player ${unavail?"unavail":""} ${placed?"placed":""} ${dragPlayer?.id===p.id?"dragging":""}`}
                        draggable={!unavail && !placed}
                        onDragStart={() => onDragStart(p)}
                        onDragEnd={onDragEnd}
                      >
                        <div className="sp-avatar">
                          {p.photo
                            ? <img src={p.photo} alt={p.name} onError={e=>{e.target.style.display="none";}}/>
                            : initials(p.name)
                          }
                        </div>
                        <div className="sp-info">
                          <div className="sp-name">{p.name.split(" ").pop()}</div>
                          <div style={{display:"flex",alignItems:"center",gap:3}}>
                            <span className="sp-num">#{p.number}</span>
                            {p.injured && <span className="sp-badge">🏥</span>}
                            {p.suspended && <span className="sp-badge">🟨</span>}
                            {placed && <span className="sp-badge">✓</span>}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* CONFIRM BAR */}
      {!loading && tab === "builder" && (
        <div className="confirm-bar">
          <div className="confirm-count">{Object.keys(lineup).length} / {formation_slots.length} OYUNCU SEÇİLDİ</div>
          <button
            className="confirm-btn"
            disabled={!isComplete}
            onClick={submitVote}
          >
            KADROYU ONAYLA VE OY VER →
          </button>
        </div>
      )}

      {toast && <div className={`toast ${toast.type}`}>{toast.msg}</div>}
    </div>
  );
}