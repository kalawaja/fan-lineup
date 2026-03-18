"use client";

import { useState, useEffect, useRef } from "react";

const BJK = {
  id: 549,
  leagueId: 203,
  logo: "https://media.api-sports.io/football/teams/549.png",
};

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
  return { "Goalkeeper":"GK","Defender":"CB","Midfielder":"CM","Attacker":"ST" }[p] || "CM";
}
function initials(name) {
  const p = name.trim().split(" ");
  return p.length >= 2 ? p[0][0]+p[p.length-1][0] : name.slice(0,2);
}

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@600;700;800&family=DM+Sans:wght@400;500;600&family=Space+Mono:wght@400;700&display=swap');
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
html,body{height:100%;font-family:'DM Sans',sans-serif;background:#0a0a0d;color:#fff;overflow:hidden;}
.app{height:100vh;display:flex;flex-direction:column;overflow:hidden;}
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
.hdr{padding:12px 16px;display:flex;align-items:center;justify-content:space-between;border-bottom:1px solid rgba(255,255,255,.07);background:rgba(10,10,13,.9);backdrop-filter:blur(16px);flex-shrink:0;}
.back-btn{background:rgba(255,255,255,.07);border:1px solid rgba(255,255,255,.1);color:#fff;padding:6px 14px;border-radius:7px;cursor:pointer;font-size:13px;}
.hdr-center{text-align:center;}
.hdr-center h2{font-family:'Barlow Condensed',sans-serif;font-size:18px;font-weight:700;letter-spacing:2px;}
.hdr-center p{font-size:10px;color:rgba(255,255,255,.4);margin-top:1px;}
.hdr-logo{width:32px;height:32px;object-fit:contain;}
.loading{flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:14px;}
.spinner{width:36px;height:36px;border:3px solid rgba(255,255,255,.08);border-top-color:rgba(255,255,255,.5);border-radius:50%;animation:spin .7s linear infinite;}
@keyframes spin{to{transform:rotate(360deg);}}
.loading p{font-family:'Space Mono',monospace;font-size:10px;letter-spacing:2px;color:rgba(255,255,255,.35);}
.builder{display:flex;flex:1;overflow:hidden;min-height:0;}
.pitch-side{flex:1;min-width:0;display:flex;flex-direction:column;padding:8px;gap:6px;border-right:1px solid rgba(255,255,255,.06);overflow:hidden;}
.formation-bar{display:flex;gap:4px;flex-wrap:wrap;flex-shrink:0;}
.f-btn{font-family:'Space Mono',monospace;font-size:9px;letter-spacing:1px;padding:4px 10px;border-radius:5px;border:1px solid rgba(255,255,255,.1);background:transparent;color:rgba(255,255,255,.35);cursor:pointer;transition:all .15s;}
.f-btn.active{background:rgba(255,255,255,.1);color:#fff;border-color:rgba(255,255,255,.25);}
.pitch{position:relative;width:100%;max-width:240px;margin:0 auto;flex:1;border-radius:8px;overflow:hidden;background:repeating-linear-gradient(0deg,#2a7336 0px,#2a7336 44px,#317a3d 44px,#317a3d 88px);}
.pitch-lines{position:absolute;inset:0;border:2px solid rgba(255,255,255,.25);border-radius:8px;pointer-events:none;}
.pitch-mid{position:absolute;left:0;right:0;top:50%;height:1px;background:rgba(255,255,255,.25);pointer-events:none;}
.pitch-circle{position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);width:60px;height:60px;border:1px solid rgba(255,255,255,.25);border-radius:50%;pointer-events:none;}
.pitch-pen-t{position:absolute;left:50%;transform:translateX(-50%);width:50%;height:17%;border:1px solid rgba(255,255,255,.25);top:0;border-top:none;border-radius:0 0 4px 4px;pointer-events:none;}
.pitch-pen-b{position:absolute;left:50%;transform:translateX(-50%);width:50%;height:17%;border:1px solid rgba(255,255,255,.25);bottom:0;border-bottom:none;border-radius:4px 4px 0 0;pointer-events:none;}
.pitch-slots{position:absolute;inset:0;display:grid;grid-template-rows:repeat(5,1fr);grid-template-columns:repeat(5,1fr);padding:4px;}
.pitch-slot{display:flex;align-items:center;justify-content:center;}
.slot-drop{width:44px;height:58px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:2px;border-radius:8px;border:1px dashed rgba(255,255,255,.2);background:rgba(0,0,0,.15);transition:border-color .1s,background .1s,transform .1s;}
.slot-drop.over{border:2px solid #FFD700 !important;background:rgba(255,215,0,.2) !important;transform:scale(1.1);}
.slot-drop.filled{border:none;background:transparent;}
.slot-inner{position:relative;display:flex;flex-direction:column;align-items:center;gap:2px;cursor:grab;}
.slot-avatar{width:36px;height:36px;border-radius:50%;background:linear-gradient(135deg,#1a1a1a,#000);border:2px solid rgba(255,255,255,.3);overflow:hidden;display:flex;align-items:center;justify-content:center;font-family:'Space Mono',monospace;font-size:8px;font-weight:700;box-shadow:0 2px 8px rgba(0,0,0,.5);}
.slot-avatar img{width:100%;height:100%;object-fit:cover;}
.slot-label{font-size:7px;font-weight:700;text-align:center;max-width:44px;line-height:1.2;text-shadow:0 1px 3px rgba(0,0,0,.9);}
.slot-pos-tag{font-family:'Space Mono',monospace;font-size:6px;background:rgba(0,0,0,.5);padding:1px 3px;border-radius:3px;color:rgba(255,255,255,.5);}
.remove-btn{position:absolute;top:-5px;right:-5px;width:15px;height:15px;border-radius:50%;background:#cc2222;border:none;color:#fff;font-size:9px;cursor:pointer;display:flex;align-items:center;justify-content:center;z-index:10;}
.squad-side{width:150px;flex-shrink:0;display:flex;flex-direction:column;overflow:hidden;}
.squad-header{padding:8px 10px;font-family:'Space Mono',monospace;font-size:9px;letter-spacing:2px;color:rgba(255,255,255,.35);border-bottom:1px solid rgba(255,255,255,.06);flex-shrink:0;}
.squad-list{flex:1;overflow-y:auto;padding:6px;}
.squad-group{margin-bottom:6px;}
.squad-group-label{font-family:'Space Mono',monospace;font-size:8px;letter-spacing:2px;color:rgba(255,255,255,.25);padding:3px 4px;margin-bottom:3px;}
.squad-player{display:flex;align-items:center;gap:7px;padding:5px 6px;border-radius:7px;border:1px solid rgba(255,255,255,.06);background:rgba(255,255,255,.03);cursor:grab;margin-bottom:3px;user-select:none;-webkit-user-select:none;touch-action:none;}
.squad-player.dragging{opacity:.3;}
.squad-player.placed{opacity:.4;border-color:rgba(255,255,255,.12);}
.squad-player.unavail{opacity:.25;cursor:not-allowed;}
.sp-avatar{width:28px;height:28px;border-radius:50%;background:#1a1a1a;border:1px solid rgba(255,255,255,.15);overflow:hidden;flex-shrink:0;display:flex;align-items:center;justify-content:center;font-family:'Space Mono',monospace;font-size:7px;}
.sp-avatar img{width:100%;height:100%;object-fit:cover;}
.sp-info{min-width:0;flex:1;}
.sp-name{font-size:10px;font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
.sp-meta{display:flex;align-items:center;gap:3px;margin-top:1px;}
.sp-num{font-family:'Space Mono',monospace;font-size:8px;color:rgba(255,255,255,.3);}
.squad-list::-webkit-scrollbar{width:2px;}
.squad-list::-webkit-scrollbar-thumb{background:rgba(255,255,255,.1);border-radius:2px;}
.drag-ghost{position:fixed;pointer-events:none;z-index:9999;width:46px;height:62px;border-radius:10px;border:2px solid #FFD700;background:rgba(15,15,20,.95);display:flex;flex-direction:column;align-items:center;justify-content:center;gap:3px;transform:translate(-50%,-50%);box-shadow:0 4px 20px rgba(255,215,0,.4);}
.dg-avatar{width:34px;height:34px;border-radius:50%;overflow:hidden;border:2px solid #FFD700;background:#111;display:flex;align-items:center;justify-content:center;font-family:'Space Mono',monospace;font-size:8px;color:#fff;}
.dg-avatar img{width:100%;height:100%;object-fit:cover;}
.dg-name{font-size:7px;font-weight:700;color:#fff;text-align:center;max-width:44px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;padding:0 2px;}
.confirm-bar{padding:10px 12px;border-top:1px solid rgba(255,255,255,.08);background:#0a0a0d;flex-shrink:0;}
.confirm-btn{width:100%;padding:12px;border-radius:10px;border:none;background:#fff;color:#000;font-family:'Barlow Condensed',sans-serif;font-size:16px;font-weight:700;letter-spacing:2px;cursor:pointer;transition:opacity .15s;}
.confirm-btn:disabled{opacity:.2;cursor:not-allowed;}
.confirm-count{text-align:center;font-family:'Space Mono',monospace;font-size:9px;color:rgba(255,255,255,.3);margin-bottom:6px;}
.results-wrap{flex:1;overflow-y:auto;padding:16px;}
.results-title{font-family:'Barlow Condensed',sans-serif;font-size:32px;font-weight:800;letter-spacing:2px;margin-bottom:4px;}
.results-sub{font-family:'Space Mono',monospace;font-size:9px;color:rgba(255,255,255,.3);letter-spacing:2px;margin-bottom:16px;}
.results-pitch{position:relative;width:100%;max-width:380px;aspect-ratio:7/10;border-radius:8px;overflow:hidden;background:repeating-linear-gradient(0deg,#2a7336 0px,#2a7336 44px,#317a3d 44px,#317a3d 88px);margin:0 auto 16px;}
.res-slot{position:absolute;display:flex;flex-direction:column;align-items:center;gap:2px;transform:translate(-50%,-50%);}
.res-avatar{width:38px;height:38px;border-radius:50%;background:#1a1a1a;border:2px solid rgba(255,255,255,.4);overflow:hidden;display:flex;align-items:center;justify-content:center;font-family:'Space Mono',monospace;font-size:8px;}
.res-avatar img{width:100%;height:100%;object-fit:cover;}
.res-name{font-size:7px;font-weight:700;text-align:center;max-width:48px;line-height:1.2;text-shadow:0 1px 3px rgba(0,0,0,.9);}
.res-pct{font-family:'Space Mono',monospace;font-size:6px;background:rgba(0,0,0,.6);padding:1px 4px;border-radius:3px;color:#FFD700;}
.res-vote-again{display:block;margin:0 auto;padding:10px 24px;border-radius:8px;border:1px solid rgba(255,255,255,.15);background:transparent;color:#fff;font-family:'Barlow Condensed',sans-serif;font-size:14px;font-weight:700;letter-spacing:2px;cursor:pointer;}
.share-bar{display:flex;gap:8px;margin:0 auto 16px;max-width:380px;}
.share-btn{flex:1;padding:10px;border-radius:8px;border:1px solid rgba(255,255,255,.2);background:rgba(255,255,255,.07);color:#fff;font-family:'Barlow Condensed',sans-serif;font-size:14px;font-weight:700;letter-spacing:2px;cursor:pointer;transition:background .15s;}
.share-btn:hover{background:rgba(255,255,255,.12);}
.share-btn.primary{background:#fff;color:#000;border-color:#fff;}
.share-btn.primary:hover{opacity:.85;}
.shared-badge{display:inline-block;font-family:'Space Mono',monospace;font-size:8px;letter-spacing:2px;background:rgba(255,215,0,.15);border:1px solid rgba(255,215,0,.3);color:#FFD700;padding:3px 8px;border-radius:4px;margin-bottom:12px;}
.toast{position:fixed;bottom:24px;left:50%;transform:translateX(-50%);background:#1a1a22;border:1px solid rgba(255,255,255,.12);border-radius:10px;padding:10px 16px;font-size:12px;z-index:9998;animation:tin .2s ease;white-space:nowrap;}
@keyframes tin{from{transform:translateX(-50%) translateY(10px);opacity:0}to{transform:translateX(-50%) translateY(0);opacity:1}}
.toast.ok{border-color:rgba(50,200,80,.4);color:#50dd70;}
.toast.err{border-color:rgba(220,50,50,.4);color:#ff6b6b;}
`;

export default function App() {
  const [page, setPage] = useState("home");
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formation, setFormation] = useState("4-2-3-1");
  const [lineup, setLineup] = useState({});
  const [overSlot, setOverSlot] = useState(null);
  const [touchPos, setTouchPos] = useState(null);
  const [touchDragPlayer, setTouchDragPlayer] = useState(null);
  const [toast, setToast] = useState(null);
  const [globalVotes, setGlobalVotes] = useState({});
  const [sharedLineup, setSharedLineup] = useState(null);

  // dragRef holds { player, fromSlot } — avoids stale state in event handlers
  const dragRef = useRef(null);

  useEffect(() => {
    const s = document.createElement("style");
    s.textContent = CSS;
    document.head.appendChild(s);
    return () => s.remove();
  }, []);

  async function loadData() {
    setLoading(true);
    try {
      const [sRes, iRes] = await Promise.all([
        fetch(`/api/squad?team=${BJK.id}`),
        fetch(`/api/injuries?team=${BJK.id}&league=${BJK.leagueId}`),
      ]);
      const sData = await sRes.json();
      const iData = await iRes.json();
      const injMap = {};
      (iData.injuries || []).forEach(i => { injMap[i.playerId] = i; });
      setPlayers((sData.players || []).map(p => ({
        id: p.id, name: p.name, number: p.number,
        posKey: posKey(p.position), photo: p.photo,
        injured: injMap[p.id]?.type === "Injury",
        suspended: injMap[p.id]?.type === "Suspension",
      })));
    } catch { showToast("API bağlantı hatası", "err"); }
    setLoading(false);
  }

  function openBesiktas() {
    setPage("match"); setLineup({});
    loadData();
    try { setGlobalVotes(JSON.parse(sessionStorage.getItem("bjk_votes")||"{}")); } catch {}
  }

  function showToast(msg, type="ok") {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 2500);
  }

  // ── CORE DROP LOGIC ──
  function dropOnSlot(targetSlot) {
    const drag = dragRef.current;
    if (!drag) return;
    const { player, fromSlot } = drag;
    const slotDef = FORMATIONS[formation].find(s => s.slot === targetSlot);
    if (!slotDef) return;

    if (!slotDef.accepts.includes(player.posKey)) {
      showToast("Bu pozisyona uygun değil", "err");
      return;
    }

    setLineup(prev => {
      const next = { ...prev };
      // Remove player from their old slot
      if (fromSlot) delete next[fromSlot];
      // Swap: if target has someone and we came from a slot, try to move them to fromSlot
      const displaced = next[targetSlot];
      if (displaced && fromSlot) {
        const fromDef = FORMATIONS[formation].find(s => s.slot === fromSlot);
        if (fromDef?.accepts.includes(displaced.posKey)) {
          next[fromSlot] = displaced;
        }
      }
      next[targetSlot] = player;
      return next;
    });
  }

  // ── DESKTOP DRAG ──
  function onDragStartSquad(player) {
    if (player.injured || player.suspended) return;
    dragRef.current = { player, fromSlot: null };
  }
  function onDragStartSlot(e, player, slot) {
    e.stopPropagation();
    dragRef.current = { player, fromSlot: slot };
  }
  function onDragEnd() { dragRef.current = null; setOverSlot(null); }

  // ── TOUCH DRAG ──
  function onTouchStart(e, player, fromSlot) {
    if (player.injured || player.suspended) return;
    e.preventDefault();
    dragRef.current = { player, fromSlot };
    setTouchDragPlayer(player);
    const t = e.touches[0];
    setTouchPos({ x: t.clientX, y: t.clientY });
  }
  function onTouchMove(e) {
    e.preventDefault();
    const t = e.touches[0];
    setTouchPos({ x: t.clientX, y: t.clientY });
    const el = document.elementFromPoint(t.clientX, t.clientY);
    setOverSlot(el?.closest("[data-slot]")?.dataset.slot || null);
  }
  function onTouchEnd(e) {
    const t = e.changedTouches[0];
    const el = document.elementFromPoint(t.clientX, t.clientY);
    const targetSlot = el?.closest("[data-slot]")?.dataset.slot;
    if (targetSlot) dropOnSlot(targetSlot);
    dragRef.current = null;
    setTouchDragPlayer(null);
    setTouchPos(null);
    setOverSlot(null);
  }

  function removeFromSlot(slot) {
    setLineup(prev => { const n={...prev}; delete n[slot]; return n; });
  }

  function submitVote() {
    const stored = (() => { try { return JSON.parse(sessionStorage.getItem("bjk_votes")||"{}"); } catch { return {}; } })();
    const updated = { ...stored };
    Object.entries(lineup).forEach(([slot, player]) => {
      if (!updated[slot]) updated[slot] = {};
      updated[slot][player.id] = (updated[slot][player.id] || 0) + 1;
    });
    try { sessionStorage.setItem("bjk_votes", JSON.stringify(updated)); } catch {}
    setGlobalVotes(updated);
    // Encode lineup into URL
    const encoded = btoa(JSON.stringify(
      Object.entries(lineup).map(([slot, p]) => ({ slot, id: p.id }))
    ));
    window.history.replaceState(null, "", "?lineup=" + encoded);
    setPage("results");
  }

  function getShareUrl() {
    const encoded = btoa(JSON.stringify(
      Object.entries(lineup).map(([slot, p]) => ({ slot, id: p.id }))
    ));
    return window.location.origin + window.location.pathname + "?lineup=" + encoded;
  }

  function copyShareLink() {
    try {
      navigator.clipboard.writeText(getShareUrl());
      showToast("Link kopyalandı!", "ok");
    } catch {
      showToast("Link kopyalanamadı", "err");
    }
  }

  // Load shared lineup from URL on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const encoded = params.get("lineup");
    if (encoded) {
      try {
        const parsed = JSON.parse(atob(encoded));
        setSharedLineup(parsed);
        setPage("shared");
        loadData(); // load players to resolve names/photos
      } catch {}
    }
  }, []);

  const formation_slots = FORMATIONS[formation];
  const placedIds = new Set(Object.values(lineup).map(p => p?.id));
  const isComplete = Object.keys(lineup).length === formation_slots.length;
  const grouped = {
    "KALECI": players.filter(p => p.posKey === "GK"),
    "DEFANS": players.filter(p => p.posKey === "CB"),
    "ORTA SAHA": players.filter(p => p.posKey === "CM"),
    "FORVET": players.filter(p => p.posKey === "ST"),
  };

  // ── HOME ──
  if (page === "home") {
    const teams = [
      { key:"besiktas",   name:"BEŞİKTAŞ",   logo:"https://media.api-sports.io/football/teams/549.png" },
      { key:"fenerbahce", name:"FENERBAHÇE",  logo:"https://media.api-sports.io/football/teams/611.png" },
      { key:"galatasaray",name:"GALATASARAY", logo:"https://media.api-sports.io/football/teams/645.png" },
      { key:"trabzonspor",name:"TRABZONSPOR", logo:"https://media.api-sports.io/football/teams/998.png" },
    ];
    return (
      <div className="app" style={{overflow:"auto"}}>
        <div className="home">
          <div className="home-eyebrow">SÜPER LİG · 2024/25</div>
          <div className="home-title">FAN<span>/</span>XI</div>
          <div className="home-sub">BAŞLANGIÇ 11'İNİ OLUŞTUR</div>
          <div className="team-grid">
            {teams.map(t => (
              <div key={t.key} className="team-card"
                onClick={t.key==="besiktas" ? openBesiktas : undefined}
                style={t.key!=="besiktas"?{opacity:.35,cursor:"not-allowed"}:{}}>
                <div className="tc-left">
                  <img className="tc-logo" src={t.logo} alt={t.name}/>
                  <div>
                    <div className="tc-name">{t.name}</div>
                    <div className="tc-meta">{t.key==="besiktas"?"Kadroyu oluştur →":"Yakında"}</div>
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

  // ── SHARED LINEUP PAGE ──
  if (page === "shared") {
    const slots = FORMATIONS[formation];
    // Resolve shared players once players are loaded
    const resolvedLineup = {};
    if (sharedLineup && players.length > 0) {
      sharedLineup.forEach(({ slot, id }) => {
        const player = players.find(p => String(p.id) === String(id));
        if (player) resolvedLineup[slot] = player;
      });
    }
    return (
      <div className="app">
        <div className="hdr">
          <button className="back-btn" onClick={()=>{setPage("home");window.history.replaceState(null,"",window.location.pathname);}}>← Ana Sayfa</button>
          <div className="hdr-center"><h2>PAYLAŞILAN KADRO</h2><p>BEŞİKTAŞ</p></div>
          <img className="hdr-logo" src={BJK.logo} alt="BJK"/>
        </div>
        <div className="results-wrap">
          <div className="shared-badge">PAYLAŞILAN KADRO</div>
          <div className="results-title">FAN XI</div>
          <div className="results-sub">BEŞİKTAŞ · {formation}</div>
          {players.length === 0 && (
            <div className="loading"><div className="spinner"/><p>Kadro yükleniyor...</p></div>
          )}
          {players.length > 0 && (
            <>
              <div className="results-pitch">
                <div style={{position:"absolute",inset:0,border:"2px solid rgba(255,255,255,.2)",borderRadius:8,pointerEvents:"none"}}/>
                <div style={{position:"absolute",left:0,right:0,top:"50%",height:1,background:"rgba(255,255,255,.2)",pointerEvents:"none"}}/>
                {slots.map(pos => {
                  const player = resolvedLineup[pos.slot];
                  return (
                    <div key={pos.slot} className="res-slot"
                      style={{left:((pos.col-1)/4*80+10)+"%", top:((5-pos.row)/4*80+10)+"%"}}>
                      <div className="res-avatar">
                        {player?.photo
                          ? <img src={player.photo} alt={player.name} onError={e=>{e.target.style.display="none";}}/>
                          : player ? initials(player.name) : <span style={{color:"rgba(255,255,255,.2)",fontSize:6}}>{pos.label}</span>}
                      </div>
                      <span className="res-name" style={{color:player?"#fff":"rgba(255,255,255,.2)"}}>
                        {player ? player.name.split(" ").pop() : pos.label}
                      </span>
                    </div>
                  );
                })}
              </div>
              <div className="share-bar">
                <button className="share-btn primary" onClick={()=>{
                  setLineup(resolvedLineup);
                  setPage("match");
                  window.history.replaceState(null,"",window.location.pathname);
                }}>
                  OY VER →
                </button>
                <button className="share-btn" onClick={copyShareLink}>
                  🔗 PAYLAŞ
                </button>
              </div>
            </>
          )}
        </div>
        {toast && <div className={`toast ${toast.type}`}>{toast.msg}</div>}
      </div>
    );
  }

  // ── RESULTS ──
  if (page === "results") {
    return (
      <div className="app">
        <div className="hdr">
          <button className="back-btn" onClick={()=>{setPage("match");setLineup({});}}>← Kadro</button>
          <div className="hdr-center"><h2>FAN XI SONUÇLARI</h2><p>BEŞİKTAŞ · {formation}</p></div>
          <img className="hdr-logo" src={BJK.logo} alt="BJK"/>
        </div>
        <div className="results-wrap">
          <div className="results-title">FAN XI</div>
          <div className="results-sub">TOPLAM OYLAR · {formation}</div>
          <div className="results-pitch">
            <div style={{position:"absolute",inset:0,border:"2px solid rgba(255,255,255,.2)",borderRadius:8,pointerEvents:"none"}}/>
            <div style={{position:"absolute",left:0,right:0,top:"50%",height:1,background:"rgba(255,255,255,.2)",pointerEvents:"none"}}/>
            {formation_slots.map(pos => {
              const sv = globalVotes[pos.slot] || {};
              const sorted = Object.entries(sv).sort((a,b)=>b[1]-a[1]);
              const total = sorted.reduce((s,[,v])=>s+v,0);
              const winner = players.find(p => String(p.id)===String(sorted[0]?.[0]));
              const pct = total>0 ? Math.round((sorted[0]?.[1]||0)/total*100) : 0;
              return (
                <div key={pos.slot} className="res-slot"
                  style={{left:((pos.col-1)/4*80+10)+"%", top:((5-pos.row)/4*80+10)+"%"}}>
                  <div className="res-avatar">
                    {winner?.photo
                      ? <img src={winner.photo} alt={winner.name} onError={e=>{e.target.style.display="none";}}/>
                      : winner ? initials(winner.name) : <span style={{color:"rgba(255,255,255,.2)",fontSize:6}}>{pos.label}</span>}
                  </div>
                  <span className="res-name" style={{color:winner?"#fff":"rgba(255,255,255,.2)"}}>
                    {winner ? winner.name.split(" ").pop() : pos.label}
                  </span>
                  {winner && <span className="res-pct">%{pct}</span>}
                </div>
              );
            })}
          </div>
          <div className="share-bar">
            <button className="share-btn primary" onClick={copyShareLink}>
              🔗 LİNKİ PAYLAŞ
            </button>
            <button className="share-btn" onClick={()=>{setPage("match");setLineup({});window.history.replaceState(null,"",window.location.pathname);}}>
              YENİDEN OY VER
            </button>
          </div>
        </div>
        {toast && <div className={`toast ${toast.type}`}>{toast.msg}</div>}
      </div>
    );
  }

  // ── MATCH ──
  return (
    <div className="app">
      <div className="hdr">
        <button className="back-btn" onClick={()=>setPage("home")}>← Geri</button>
        <div className="hdr-center"><h2>BEŞİKTAŞ</h2><p>Kadro Oluştur</p></div>
        <img className="hdr-logo" src={BJK.logo} alt="BJK"/>
      </div>

      {loading ? (
        <div className="loading"><div className="spinner"/><p>Kadro yükleniyor...</p></div>
      ) : (
        <>
          <div className="builder">
            {/* PITCH */}
            <div className="pitch-side">
              <div className="formation-bar">
                {Object.keys(FORMATIONS).map(f => (
                  <button key={f} className={`f-btn ${formation===f?"active":""}`}
                    onClick={()=>{setFormation(f);setLineup({});}}>{f}</button>
                ))}
              </div>
              <div className="pitch" onDragOver={e=>e.preventDefault()}>
                <div className="pitch-lines"/><div className="pitch-mid"/>
                <div className="pitch-circle"/><div className="pitch-pen-t"/><div className="pitch-pen-b"/>
                <div className="pitch-slots">
                  {formation_slots.map(pos => {
                    const player = lineup[pos.slot];
                    const isOver = overSlot === pos.slot;
                    return (
                      <div key={pos.slot} className="pitch-slot"
                        style={{gridRow:6-pos.row, gridColumn:pos.col}}>
                        <div
                          className={`slot-drop ${isOver?"over":""} ${player?"filled":""}`}
                          data-slot={pos.slot}
                          onDragOver={e=>{e.preventDefault();setOverSlot(pos.slot);}}
                          onDragLeave={()=>setOverSlot(null)}
                          onDrop={()=>{dropOnSlot(pos.slot);onDragEnd();}}
                        >
                          {player ? (
                            <div className="slot-inner"
                              draggable
                              onDragStart={e=>onDragStartSlot(e, player, pos.slot)}
                              onDragEnd={onDragEnd}
                              onTouchStart={e=>onTouchStart(e, player, pos.slot)}
                              onTouchMove={onTouchMove}
                              onTouchEnd={onTouchEnd}
                            >
                              <button className="remove-btn"
                                onClick={e=>{e.stopPropagation();removeFromSlot(pos.slot);}}>×</button>
                              <div className="slot-avatar">
                                {player.photo
                                  ? <img src={player.photo} alt={player.name} onError={e=>{e.target.style.display="none";}}/>
                                  : initials(player.name)}
                              </div>
                              <span className="slot-label">{player.name.split(" ").pop()}</span>
                              <span className="slot-pos-tag">{pos.label}</span>
                            </div>
                          ) : (
                            <span style={{fontSize:9,color:"rgba(255,255,255,.2)",fontFamily:"Space Mono,monospace"}}>{pos.label}</span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* SQUAD */}
            <div className="squad-side">
              <div className="squad-header">KADRO</div>
              <div className="squad-list">
                {Object.entries(grouped).map(([grp, pls]) => (
                  <div key={grp} className="squad-group">
                    <div className="squad-group-label">{grp}</div>
                    {pls.map(p => {
                      const unavail = p.injured || p.suspended;
                      const placed = placedIds.has(p.id);
                      const isGhost = touchDragPlayer?.id === p.id;
                      return (
                        <div key={p.id}
                          className={`squad-player ${unavail?"unavail":""} ${placed?"placed":""} ${isGhost?"dragging":""}`}
                          draggable={!unavail}
                          onDragStart={()=>!unavail && onDragStartSquad(p)}
                          onDragEnd={onDragEnd}
                          onTouchStart={e=>!unavail && onTouchStart(e, p, null)}
                          onTouchMove={onTouchMove}
                          onTouchEnd={onTouchEnd}
                        >
                          <div className="sp-avatar">
                            {p.photo
                              ? <img src={p.photo} alt={p.name} onError={e=>{e.target.style.display="none";}}/>
                              : initials(p.name)}
                          </div>
                          <div className="sp-info">
                            <div className="sp-name">{p.name.split(" ").pop()}</div>
                            <div className="sp-meta">
                              <span className="sp-num">#{p.number}</span>
                              {p.injured && <span style={{fontSize:8}}>🏥</span>}
                              {p.suspended && <span style={{fontSize:8}}>🟨</span>}
                              {placed && <span style={{fontSize:8,color:"rgba(255,255,255,.4)"}}>✓</span>}
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

          {/* CONFIRM BAR */}
          <div className="confirm-bar">
            <div className="confirm-count">{Object.keys(lineup).length} / {formation_slots.length} OYUNCU SEÇİLDİ</div>
            <button className="confirm-btn" disabled={!isComplete} onClick={submitVote}>
              KADROYU ONAYLA VE OY VER →
            </button>
          </div>
        </>
      )}

      {/* TOUCH GHOST */}
      {touchDragPlayer && touchPos && (
        <div className="drag-ghost" style={{left:touchPos.x, top:touchPos.y}}>
          <div className="dg-avatar">
            {touchDragPlayer.photo
              ? <img src={touchDragPlayer.photo} alt={touchDragPlayer.name}/>
              : initials(touchDragPlayer.name)}
          </div>
          <span className="dg-name">{touchDragPlayer.name.split(" ").pop()}</span>
        </div>
      )}

      {toast && <div className={`toast ${toast.type}`}>{toast.msg}</div>}
    </div>
  );
}