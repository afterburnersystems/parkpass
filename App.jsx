import { useState, useEffect, useCallback, useRef } from "react";

// ─── BRAND ────────────────────────────────────────────────────────────────────
const B = {
  navy:   "#0A1628",
  teal:   "#0D9488",
  mint:   "#14B8A6",
  ice:    "#CCFBF1",
  slate:  "#1E293B",
  ghost:  "#F1F5F9",
  muted:  "#64748B",
  border: "#1E293B",
  red:    "#DC2626",
  yellow: "#D97706",
  green:  "#16A34A",
};

// ─── HEX LOGO SVG ─────────────────────────────────────────────────────────────
function HexMark({ size = 40, variant = "dark" }) {
  const s = size;
  const cx = s / 2, cy = s / 2, r = s * 0.46;
  function hex(radius) {
    return Array.from({ length: 6 }, (_, i) => {
      const a = (Math.PI / 3) * i - Math.PI / 6;
      return `${cx + radius * Math.cos(a)},${cy + radius * Math.sin(a)}`;
    }).join(" ");
  }
  const outerFill  = variant === "dark" ? B.navy  : variant === "teal" ? B.teal  : "#fff";
  const midStroke  = variant === "dark" ? B.teal  : variant === "teal" ? B.navy  : B.teal;
  const innerFill  = variant === "dark" ? B.teal  : variant === "teal" ? B.navy  : B.navy;
  const textCol    = variant === "dark" ? "#fff"  : variant === "teal" ? B.mint  : "#fff";
  const fs = Math.round(s * 0.22);

  return (
    <svg width={s} height={s} viewBox={`0 0 ${s} ${s}`} style={{ flexShrink: 0 }}>
      <polygon points={hex(r * 1.0)}  fill={outerFill} />
      <polygon points={hex(r * 0.84)} fill="none" stroke={midStroke} strokeWidth={s * 0.032} />
      <polygon points={hex(r * 0.62)} fill={innerFill} />
      <text
        x={cx} y={cy + fs * 0.38}
        textAnchor="middle"
        fontFamily="'DM Mono', monospace"
        fontWeight="800"
        fontSize={fs}
        fill={textCol}
        letterSpacing="-0.5"
      >PP</text>
    </svg>
  );
}

function Logo({ size = 32 }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      <HexMark size={size} variant="dark" />
      <div style={{ lineHeight: 1 }}>
        <span style={{ fontFamily: "'DM Mono', monospace", fontWeight: 800, fontSize: size * 0.72, color: "#fff", letterSpacing: -0.5 }}>Park</span>
        <span style={{ fontFamily: "'DM Mono', monospace", fontWeight: 300, fontSize: size * 0.72, color: B.mint, letterSpacing: -0.5 }}>Pass</span>
      </div>
    </div>
  );
}

// ─── DATA ─────────────────────────────────────────────────────────────────────
const LOCATIONS = [
  { id: "ss", name: "South Shore", address: "1600 E Riverside Dr", spots: ["A1","A2","A3","B1","B2","B3","C1"] },
  { id: "sc", name: "South Congress", address: "2525 S Congress Ave", spots: ["1","2","3","4","5","6"] },
  { id: "lw", name: "Lakeway", address: "2000 Lohmans Spur", spots: ["P1","P2","P3","P4","P5"] },
];

const SERVICE_DURATION = {
  "Lash Extensions": 120, "Hair Color": 150, "Haircut": 60,
  "Barber": 45, "Aesthetician": 90, "Nail Services": 75,
  "Brow Tinting": 45, "Wax Services": 45, "Massage": 60,
};
const SERVICES = Object.keys(SERVICE_DURATION);

const PROVIDERS = [
  { id:"p1", studio:"Studio 4", name:"Mia Belle",  service:"Lash Extensions", locId:"ss" },
  { id:"p2", studio:"Studio 7", name:"Nova Hair",  service:"Hair Color",      locId:"ss" },
  { id:"p3", studio:"Studio 2", name:"King Cuts",  service:"Barber",          locId:"ss" },
  { id:"p4", studio:"Studio 9", name:"Glow Room",  service:"Aesthetician",    locId:"ss" },
  { id:"p5", studio:"Studio 1", name:"Polish Co.", service:"Nail Services",   locId:"sc" },
];

const NOW = Date.now();
const INIT_SESSIONS = [
  { id:"s1", spot:"A1", locId:"ss", code:"LASH99", service:"Lash Extensions", provider:"Studio 4 – Mia Belle", plate:"TXK-4821", start: NOW-42*60000, durMin:120 },
  { id:"s2", spot:"B2", locId:"ss", code:"HAIR42", service:"Hair Color",      provider:"Studio 7 – Nova Hair",  plate:"TXP-0034", start: NOW-18*60000, durMin:150 },
  { id:"s3", spot:"2",  locId:"sc", code:"NAIL88", service:"Nail Services",   provider:"Studio 1 – Polish Co.", plate:"TX-901WQ", start: NOW-9*60000,  durMin:75  },
];
const INIT_CODES = {
  "LASH99": { service:"Lash Extensions", provider:"Studio 4 – Mia Belle", locId:"ss", used:true  },
  "HAIR42": { service:"Hair Color",      provider:"Studio 7 – Nova Hair",  locId:"ss", used:true  },
  "BARB21": { service:"Barber",          provider:"Studio 2 – King Cuts",  locId:"ss", used:false },
  "AEST55": { service:"Aesthetician",    provider:"Studio 9 – Glow Room",  locId:"ss", used:false },
  "NAIL88": { service:"Nail Services",   provider:"Studio 1 – Polish Co.", locId:"sc", used:true  },
  "GLOW33": { service:"Aesthetician",    provider:"Studio 9 – Glow Room",  locId:"ss", used:false },
};
const INIT_BOOTS = [
  { id:"b1", plate:"TXN-2211", spot:"A3", locId:"ss", time: NOW-90*60000,  fee:150, status:"Paid",      dispatched:"Manual"    },
  { id:"b2", plate:"TXQ-0091", spot:"B1", locId:"ss", time: NOW-3*3600000, fee:150, status:"Paid",      dispatched:"Manual"    },
  { id:"b3", plate:"TX-445KL", spot:"3",  locId:"sc", time: NOW-26*60000,  fee:150, status:"Dispatched",dispatched:"Dashboard" },
];

// ─── HELPERS ──────────────────────────────────────────────────────────────────
const elapsed = ms => {
  const m = Math.floor((Date.now()-ms)/60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m`;
  return `${Math.floor(m/60)}h ${m%60}m`;
};
const pct = (ms, durMin) => Math.min(100, Math.round((Date.now()-ms)/(durMin*60000)*100));
const genCode = () => Array.from({length:6}, () => "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"[Math.floor(Math.random()*32)]).join("");
const fmtTime = ms => new Date(ms).toLocaleTimeString([], { hour:"2-digit", minute:"2-digit" });

// ─── MICRO COMPONENTS ─────────────────────────────────────────────────────────
const Badge = ({ children, color = "teal" }) => {
  const map = {
    teal:   { bg:"#042f2e", text:B.mint,   border:"#134e4a" },
    red:    { bg:"#450a0a", text:"#fca5a5", border:"#991b1b" },
    yellow: { bg:"#422006", text:"#fcd34d", border:"#92400e" },
    green:  { bg:"#052e16", text:"#86efac", border:"#166534" },
    gray:   { bg:"#1e293b", text:"#94a3b8", border:"#334155" },
    blue:   { bg:"#0c1a3a", text:"#93c5fd", border:"#1e3a5f" },
  };
  const c = map[color] || map.gray;
  return (
    <span style={{ background:c.bg, color:c.text, border:`1px solid ${c.border}`,
      borderRadius:5, padding:"2px 7px", fontSize:10, fontFamily:"'DM Mono',monospace", fontWeight:700, letterSpacing:"0.05em" }}>
      {children}
    </span>
  );
};

const Btn = ({ children, onClick, color="teal", size="md", disabled=false, style={} }) => {
  const [hover, setHover] = useState(false);
  const base = {
    md:  { padding:"11px 18px", fontSize:13, borderRadius:10 },
    sm:  { padding:"7px 12px",  fontSize:12, borderRadius:8  },
    xs:  { padding:"4px 9px",   fontSize:11, borderRadius:6  },
  }[size];
  const cols = {
    teal:  { bg: hover ? "#0f766e" : B.teal,  border: "none",              text:"#fff"    },
    red:   { bg: hover ? "#b91c1c" : B.red,   border: "none",              text:"#fff"    },
    ghost: { bg: hover ? "#1e293b" : "transparent", border:`1px solid ${B.border}`, text:"#94a3b8" },
    slate: { bg: hover ? "#334155" : B.slate,  border: "none",             text:"#e2e8f0" },
  }[color] || {};
  return (
    <button onClick={onClick} disabled={disabled}
      onMouseEnter={()=>setHover(true)} onMouseLeave={()=>setHover(false)}
      style={{ ...base, background:cols.bg, border:cols.border, color:cols.text,
        fontWeight:600, cursor:disabled?"not-allowed":"pointer", opacity:disabled?0.4:1,
        fontFamily:"'DM Mono',monospace", letterSpacing:"0.02em", transition:"background 0.15s",
        width:"100%", ...style }}>
      {children}
    </button>
  );
};

const Card = ({ children, style={} }) => (
  <div style={{ background:B.slate, border:`1px solid ${B.border}`, borderRadius:14, padding:16, ...style }}>
    {children}
  </div>
);

const SectionLabel = ({ children }) => (
  <div style={{ fontSize:10, color:B.muted, letterSpacing:"0.1em", textTransform:"uppercase",
    fontFamily:"'DM Mono',monospace", fontWeight:600, marginBottom:10 }}>
    {children}
  </div>
);

// ─── HEX PROGRESS RING ────────────────────────────────────────────────────────
function HexProgress({ pct: p, size=52 }) {
  const c = p >= 90 ? B.red : p >= 70 ? B.yellow : B.teal;
  const cx = size/2, cy = size/2, r = size*0.42;
  function hexPts(rad) {
    return Array.from({length:6}, (_,i)=>{
      const a=(Math.PI/3)*i-Math.PI/6;
      return [cx+rad*Math.cos(a), cy+rad*Math.sin(a)];
    });
  }
  const pts = hexPts(r);
  const totalLen = pts.reduce((acc,pt,i)=>{
    const next = pts[(i+1)%6];
    return acc + Math.hypot(next[0]-pt[0], next[1]-pt[1]);
  },0);
  const dash = (p/100)*totalLen;
  const ptStr = pts.map(([x,y])=>`${x},${y}`).join(" ");
  return (
    <svg width={size} height={size} style={{ flexShrink:0 }}>
      <polygon points={ptStr} fill="none" stroke="#1e293b" strokeWidth={3}/>
      <polygon points={ptStr} fill="none" stroke={c} strokeWidth={3}
        strokeDasharray={`${dash} ${totalLen}`} strokeLinecap="butt"/>
      <text x={cx} y={cy+4} textAnchor="middle" fontFamily="'DM Mono',monospace"
        fontWeight={700} fontSize={11} fill={c}>{p}%</text>
    </svg>
  );
}

// ─── SPOT GRID ────────────────────────────────────────────────────────────────
function SpotGrid({ spots, sessions, locId, onBoot }) {
  return (
    <div style={{ display:"grid", gridTemplateColumns:"repeat(4, 1fr)", gap:8 }}>
      {spots.map(spot => {
        const sess = sessions.find(s => s.spot===spot && s.locId===locId);
        const p = sess ? pct(sess.start, sess.durMin) : 0;
        const overdue = p >= 100;
        return (
          <div key={spot} style={{
            background: sess ? (overdue ? "#2d0a0a" : "#042f2e") : B.navy,
            border: `1px solid ${sess ? (overdue ? "#7f1d1d" : "#134e4a") : B.border}`,
            borderRadius:10, padding:10, display:"flex", flexDirection:"column", gap:6,
            transition:"all 0.2s"
          }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
              <span style={{ fontFamily:"'DM Mono',monospace", fontWeight:700, fontSize:13,
                color: sess ? (overdue ? "#fca5a5" : B.mint) : "#475569" }}>{spot}</span>
              <div style={{ width:7, height:7, borderRadius:2,
                background: sess ? (overdue ? B.red : B.teal) : "#1e293b",
                boxShadow: sess ? `0 0 5px ${overdue ? B.red : B.teal}` : "none" }}/>
            </div>
            {sess ? (
              <>
                <div style={{ fontSize:10, color:B.muted, lineHeight:1.3 }}>{sess.service}</div>
                <div style={{ fontSize:10, color:"#475569", fontFamily:"'DM Mono',monospace" }}>{sess.plate}</div>
                <div style={{ height:2, background:"#0f2a29", borderRadius:1 }}>
                  <div style={{ height:2, width:`${p}%`, background: overdue ? B.red : B.teal, borderRadius:1 }}/>
                </div>
                <button onClick={() => onBoot(sess)} style={{
                  background:"#450a0a", border:"1px solid #7f1d1d", color:"#fca5a5",
                  borderRadius:6, padding:"3px 0", fontSize:10, cursor:"pointer",
                  fontFamily:"'DM Mono',monospace", fontWeight:600
                }}>Dispatch Boot</button>
              </>
            ) : (
              <div style={{ fontSize:10, color:"#1e293b", marginTop:4 }}>Open</div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── CLIENT VIEW ─────────────────────────────────────────────────────────────
function ClientView({ codes, sessions, onCheckin }) {
  const [code, setCode]   = useState("");
  const [plate, setPlate] = useState("");
  const [step, setStep]   = useState("input");
  const [spot, setSpot]   = useState(null);
  const [info, setInfo]   = useState(null);
  const [err,  setErr]    = useState("");

  const loc = info ? LOCATIONS.find(l => l.id === info.locId) : null;
  const takenSpots = sessions.filter(s => s.locId === info?.locId).map(s => s.spot);
  const available = loc ? loc.spots.filter(s => !takenSpots.includes(s)) : [];

  const validate = () => {
    const up = code.toUpperCase().trim();
    const c = codes[up];
    if (!c) { setErr("Invalid code. Check with your service provider."); return; }
    if (c.used) { setErr("This code has already been used."); return; }
    setErr(""); setInfo(c); setStep("spot");
  };

  const confirm = () => {
    if (!spot || !plate.trim()) return;
    const loc = LOCATIONS.find(l => l.id === info.locId);
    onCheckin({
      id: "s"+Date.now(), spot, locId: info.locId,
      code: code.toUpperCase(), service: info.service,
      provider: info.provider, plate: plate.toUpperCase().trim(),
      start: Date.now(), durMin: SERVICE_DURATION[info.service] || 60,
    });
    setStep("done");
  };

  if (step === "done") return (
    <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:20, padding:"40px 20px", textAlign:"center" }}>
      <div style={{ position:"relative" }}>
        <HexMark size={80} variant="teal" />
        <div style={{ position:"absolute", bottom:-4, right:-4, width:24, height:24,
          background:B.green, borderRadius:"50%", display:"flex", alignItems:"center", justifyContent:"center" }}>
          <svg width={14} height={14} viewBox="0 0 14 14" fill="none">
            <path d="M2 7l4 4 6-6" stroke="#fff" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
      </div>
      <div>
        <div style={{ fontSize:22, fontWeight:800, color:"#fff", fontFamily:"'DM Mono',monospace", letterSpacing:-0.5 }}>
          Spot {spot} Reserved
        </div>
        <div style={{ color:B.muted, fontSize:13, marginTop:4 }}>{info.service} · {info.provider}</div>
        <div style={{ color:B.mint, fontFamily:"'DM Mono',monospace", fontSize:18, marginTop:8, letterSpacing:3 }}>
          {code.toUpperCase()}
        </div>
      </div>
      <Card style={{ width:"100%", maxWidth:320, textAlign:"left" }}>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
          {[["Location", loc?.name], ["Address", loc?.address], ["Plate", plate.toUpperCase()], ["Duration", `~${SERVICE_DURATION[info.service]}min`]].map(([k,v])=>(
            <div key={k}>
              <div style={{ fontSize:10, color:B.muted, letterSpacing:"0.08em", textTransform:"uppercase", fontFamily:"'DM Mono',monospace" }}>{k}</div>
              <div style={{ fontSize:12, color:"#e2e8f0", marginTop:2 }}>{v}</div>
            </div>
          ))}
        </div>
      </Card>
      <div style={{ fontSize:11, color:"#334155", maxWidth:280 }}>
        Unauthorized vehicles in your spot are subject to booting. Enjoy your appointment.
      </div>
      <Btn onClick={()=>{setStep("input");setCode("");setPlate("");setSpot(null);setInfo(null);}} color="ghost" size="sm" style={{ width:"auto", padding:"8px 20px" }}>
        Reserve another spot
      </Btn>
    </div>
  );

  return (
    <div style={{ maxWidth:380, margin:"0 auto", padding:"24px 0", display:"flex", flexDirection:"column", gap:16 }}>
      <div style={{ textAlign:"center", paddingBottom:8 }}>
        <div style={{ fontSize:13, color:B.muted }}>Enter the code from your service provider</div>
      </div>

      {err && (
        <div style={{ background:"#450a0a", border:"1px solid #7f1d1d", borderRadius:10,
          padding:"10px 14px", fontSize:12, color:"#fca5a5" }}>{err}</div>
      )}

      <Card>
        <SectionLabel>Appointment Code</SectionLabel>
        <input value={code} onChange={e=>{setCode(e.target.value.toUpperCase());setErr("");setStep("input");}}
          placeholder="e.g. LASH99"
          maxLength={8}
          style={{ background:B.navy, border:`1px solid ${B.border}`, borderRadius:10,
            padding:"14px", color:"#fff", fontSize:22, fontFamily:"'DM Mono',monospace",
            textAlign:"center", letterSpacing:6, width:"100%", boxSizing:"border-box", outline:"none" }}
        />
        <div style={{ marginTop:12 }}>
          <SectionLabel>License Plate</SectionLabel>
          <input value={plate} onChange={e=>setPlate(e.target.value.toUpperCase())}
            placeholder="e.g. TXK-4821"
            maxLength={10}
            style={{ background:B.navy, border:`1px solid ${B.border}`, borderRadius:10,
              padding:"11px 14px", color:"#fff", fontSize:15, fontFamily:"'DM Mono',monospace",
              textAlign:"center", letterSpacing:2, width:"100%", boxSizing:"border-box", outline:"none" }}
          />
        </div>
        <div style={{ marginTop:12 }}>
          <Btn onClick={validate} disabled={code.length < 4 || !plate.trim()}>Validate Code</Btn>
        </div>
      </Card>

      {step === "spot" && info && (
        <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
          <Card style={{ background:"#042f2e", border:"1px solid #134e4a" }}>
            <div style={{ fontSize:10, color:B.mint, letterSpacing:"0.1em", textTransform:"uppercase",
              fontFamily:"'DM Mono',monospace", marginBottom:6 }}>Appointment Verified</div>
            <div style={{ fontWeight:700, color:"#fff", fontSize:15 }}>{info.service}</div>
            <div style={{ fontSize:12, color:B.muted, marginTop:2 }}>{info.provider}</div>
            <div style={{ fontSize:11, color:"#475569", marginTop:4 }}>{loc?.name} · {loc?.address}</div>
          </Card>

          <Card>
            <SectionLabel>Choose Available Spot</SectionLabel>
            {available.length === 0 ? (
              <div style={{ color:B.muted, fontSize:12, textAlign:"center", padding:"12px 0" }}>No spots available right now</div>
            ) : (
              <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:8 }}>
                {available.map(s => (
                  <button key={s} onClick={()=>setSpot(s)} style={{
                    background: spot===s ? B.teal : B.navy,
                    border: `1px solid ${spot===s ? B.mint : B.border}`,
                    borderRadius:8, padding:"12px 0", color: spot===s ? "#fff" : "#64748b",
                    fontFamily:"'DM Mono',monospace", fontWeight:700, fontSize:14, cursor:"pointer",
                    boxShadow: spot===s ? `0 0 10px ${B.teal}44` : "none",
                    transition:"all 0.15s"
                  }}>{s}</button>
                ))}
              </div>
            )}
          </Card>

          <Btn onClick={confirm} disabled={!spot}>
            Confirm Spot {spot || ""}
          </Btn>
        </div>
      )}

      <div style={{ borderTop:`1px solid ${B.border}`, paddingTop:14, textAlign:"center" }}>
        <div style={{ fontSize:11, color:"#334155" }}>Codes are issued by your service provider. Single use per appointment.</div>
        <div style={{ fontSize:11, color:"#334155", marginTop:4 }}>
          Demo codes: <span style={{ color:B.mint, fontFamily:"'DM Mono',monospace" }}>BARB21 · AEST55 · GLOW33</span>
        </div>
      </div>
    </div>
  );
}

// ─── DASHBOARD VIEW ───────────────────────────────────────────────────────────
function Dashboard({ sessions, boots, codes, onBoot, onRelease, tick }) {
  const [locFilter, setLocFilter] = useState("all");
  const filteredSess = locFilter === "all" ? sessions : sessions.filter(s => s.locId === locFilter);
  const todayBoots = boots.filter(b => Date.now()-b.time < 86400000);
  const revenue = todayBoots.reduce((s,b) => s+b.fee, 0);
  const violations = sessions.filter(s => pct(s.start, s.durMin) >= 100).length;

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
      {/* Stats */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:10 }}>
        {[
          { label:"Active Spots",   value:sessions.length,       color:B.mint,   sub:`of ${LOCATIONS.reduce((a,l)=>a+l.spots.length,0)} total` },
          { label:"Violations",     value:violations,            color:violations>0?B.red:B.muted, sub:"overdue sessions" },
          { label:"Boots Today",    value:todayBoots.length,     color:B.yellow, sub:`$${revenue} collected` },
          { label:"Locations",      value:LOCATIONS.length,      color:B.mint,   sub:"Image Studios" },
        ].map(st => (
          <Card key={st.label} style={{ padding:14 }}>
            <div style={{ fontSize:10, color:B.muted, letterSpacing:"0.08em", textTransform:"uppercase", fontFamily:"'DM Mono',monospace" }}>{st.label}</div>
            <div style={{ fontSize:26, fontWeight:800, color:st.color, fontFamily:"'DM Mono',monospace", lineHeight:1.2, marginTop:4 }}>{st.value}</div>
            <div style={{ fontSize:10, color:"#334155", marginTop:2 }}>{st.sub}</div>
          </Card>
        ))}
      </div>

      {/* Location filter */}
      <div style={{ display:"flex", gap:8 }}>
        {[{id:"all",name:"All Locations"}, ...LOCATIONS].map(l => (
          <button key={l.id} onClick={()=>setLocFilter(l.id)} style={{
            background: locFilter===l.id ? B.teal : "transparent",
            border: `1px solid ${locFilter===l.id ? B.teal : B.border}`,
            borderRadius:8, padding:"6px 12px", color: locFilter===l.id ? "#fff" : B.muted,
            fontSize:11, fontFamily:"'DM Mono',monospace", fontWeight:600, cursor:"pointer",
            transition:"all 0.15s"
          }}>{l.name || l.id}</button>
        ))}
      </div>

      {/* Spot grids per location */}
      {(locFilter === "all" ? LOCATIONS : LOCATIONS.filter(l=>l.id===locFilter)).map(loc => (
        <Card key={loc.id}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:12 }}>
            <div>
              <div style={{ fontSize:13, fontWeight:700, color:"#e2e8f0" }}>{loc.name}</div>
              <div style={{ fontSize:11, color:B.muted }}>{loc.address}, Austin TX</div>
            </div>
            <Badge color={sessions.filter(s=>s.locId===loc.id).length>0?"teal":"gray"}>
              {sessions.filter(s=>s.locId===loc.id).length}/{loc.spots.length} occupied
            </Badge>
          </div>
          <SpotGrid spots={loc.spots} sessions={sessions} locId={loc.id} onBoot={onBoot} />
        </Card>
      ))}

      {/* Active sessions table */}
      <Card>
        <SectionLabel>Active Sessions</SectionLabel>
        {filteredSess.length === 0 ? (
          <div style={{ color:B.muted, fontSize:12, textAlign:"center", padding:"16px 0" }}>No active sessions</div>
        ) : (
          <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
            {filteredSess.map(s => {
              const p = pct(s.start, s.durMin);
              const overdue = p >= 100;
              return (
                <div key={s.id} style={{ display:"flex", alignItems:"center", gap:12,
                  background:B.navy, border:`1px solid ${overdue?"#7f1d1d":B.border}`,
                  borderRadius:10, padding:12 }}>
                  <HexProgress pct={p} size={48} />
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ display:"flex", alignItems:"center", gap:8, flexWrap:"wrap" }}>
                      <span style={{ fontFamily:"'DM Mono',monospace", fontWeight:700, fontSize:13,
                        color: overdue ? "#fca5a5" : B.mint }}>Spot {s.spot}</span>
                      <Badge color="teal">{s.code}</Badge>
                      {overdue && <Badge color="red">OVERDUE</Badge>}
                    </div>
                    <div style={{ fontSize:11, color:B.muted, marginTop:2 }}>{s.service} · {s.provider}</div>
                    <div style={{ fontSize:10, color:"#334155", marginTop:1 }}>
                      {s.plate} · started {elapsed(s.start)} ago · {LOCATIONS.find(l=>l.id===s.locId)?.name}
                    </div>
                  </div>
                  <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
                    <Btn onClick={()=>onBoot(s)} color="red" size="xs" style={{ width:"auto" }}>Boot</Btn>
                    <Btn onClick={()=>onRelease(s.id)} color="ghost" size="xs" style={{ width:"auto" }}>Release</Btn>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>

      {/* Boot log */}
      <Card>
        <SectionLabel>Boot / Dispatch Log</SectionLabel>
        {boots.length === 0 ? (
          <div style={{ color:B.muted, fontSize:12, textAlign:"center", padding:"16px 0" }}>No enforcements recorded</div>
        ) : (
          <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
            {[...boots].reverse().map(b => (
              <div key={b.id} style={{ display:"flex", alignItems:"center", gap:12,
                background:B.navy, border:`1px solid ${B.border}`, borderRadius:10, padding:12 }}>
                <div style={{ width:36, height:36, borderRadius:8, background:"#2d0a0a",
                  border:"1px solid #7f1d1d", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                  <svg width={16} height={16} viewBox="0 0 16 16" fill="none">
                    <path d="M8 1L15 14H1L8 1Z" stroke="#fca5a5" strokeWidth={1.5} strokeLinejoin="round"/>
                    <path d="M8 6v3M8 11v1" stroke="#fca5a5" strokeWidth={1.5} strokeLinecap="round"/>
                  </svg>
                </div>
                <div style={{ flex:1 }}>
                  <div style={{ display:"flex", alignItems:"center", gap:8, flexWrap:"wrap" }}>
                    <span style={{ fontFamily:"'DM Mono',monospace", fontWeight:700, fontSize:13, color:"#e2e8f0" }}>{b.plate}</span>
                    <Badge color={b.status==="Paid"?"green":b.status==="Dispatched"?"yellow":"gray"}>{b.status}</Badge>
                    <Badge color="gray">{LOCATIONS.find(l=>l.id===b.locId)?.name}</Badge>
                  </div>
                  <div style={{ fontSize:11, color:B.muted, marginTop:2 }}>
                    Spot {b.spot} · {elapsed(b.time)} ago · via {b.dispatched}
                  </div>
                </div>
                <div style={{ fontFamily:"'DM Mono',monospace", fontWeight:700, fontSize:15, color:"#86efac" }}>
                  ${b.fee}
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}

// ─── CODE MANAGER VIEW ────────────────────────────────────────────────────────
function CodeManager({ codes, setCodes }) {
  const [newService, setNewService] = useState(SERVICES[0]);
  const [newProvider, setNewProvider] = useState(PROVIDERS[0].id);
  const [generated, setGenerated] = useState(null);
  const [filterLoc, setFilterLoc] = useState("all");

  const issue = () => {
    const code = genCode();
    const prov = PROVIDERS.find(p => p.id === newProvider);
    setCodes(prev => ({
      ...prev,
      [code]: { service: newService, provider: `${prov.studio} – ${prov.name}`, locId: prov.locId, used: false }
    }));
    setGenerated(code);
  };

  const entries = Object.entries(codes).filter(([,v]) => filterLoc==="all" || v.locId===filterLoc);

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
      <Card>
        <SectionLabel>Issue New Code</SectionLabel>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:12 }}>
          <div>
            <div style={{ fontSize:10, color:B.muted, marginBottom:4, fontFamily:"'DM Mono',monospace" }}>Service</div>
            <select value={newService} onChange={e=>setNewService(e.target.value)} style={{
              background:B.navy, border:`1px solid ${B.border}`, borderRadius:8,
              padding:"8px 10px", color:"#e2e8f0", fontSize:12, width:"100%",
              fontFamily:"'DM Mono',monospace", outline:"none"
            }}>
              {SERVICES.map(s => <option key={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <div style={{ fontSize:10, color:B.muted, marginBottom:4, fontFamily:"'DM Mono',monospace" }}>Provider</div>
            <select value={newProvider} onChange={e=>setNewProvider(e.target.value)} style={{
              background:B.navy, border:`1px solid ${B.border}`, borderRadius:8,
              padding:"8px 10px", color:"#e2e8f0", fontSize:12, width:"100%",
              fontFamily:"'DM Mono',monospace", outline:"none"
            }}>
              {PROVIDERS.map(p => <option key={p.id} value={p.id}>{p.studio} – {p.name}</option>)}
            </select>
          </div>
        </div>
        <Btn onClick={issue}>Generate Code</Btn>
        {generated && (
          <div style={{ marginTop:12, background:"#042f2e", border:"1px solid #134e4a",
            borderRadius:10, padding:14, textAlign:"center" }}>
            <div style={{ fontSize:10, color:B.mint, letterSpacing:"0.1em", textTransform:"uppercase",
              fontFamily:"'DM Mono',monospace", marginBottom:6 }}>New Code Issued</div>
            <div style={{ fontSize:28, fontFamily:"'DM Mono',monospace", fontWeight:800,
              color:"#fff", letterSpacing:6 }}>{generated}</div>
            <div style={{ fontSize:11, color:B.muted, marginTop:6 }}>Share with client before their appointment</div>
          </div>
        )}
      </Card>

      <Card>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:12 }}>
          <SectionLabel>All Codes</SectionLabel>
          <div style={{ display:"flex", gap:6 }}>
            {[{id:"all",name:"All"}, ...LOCATIONS].map(l => (
              <button key={l.id} onClick={()=>setFilterLoc(l.id)} style={{
                background: filterLoc===l.id?B.teal:"transparent",
                border:`1px solid ${filterLoc===l.id?B.teal:B.border}`,
                borderRadius:6, padding:"4px 8px", color:filterLoc===l.id?"#fff":B.muted,
                fontSize:10, fontFamily:"'DM Mono',monospace", cursor:"pointer"
              }}>{l.name||l.id}</button>
            ))}
          </div>
        </div>
        <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
          {entries.map(([code, v]) => (
            <div key={code} style={{ display:"flex", alignItems:"center", gap:12,
              background:B.navy, borderRadius:8, padding:"10px 12px",
              border:`1px solid ${B.border}`, opacity: v.used ? 0.5 : 1 }}>
              <span style={{ fontFamily:"'DM Mono',monospace", fontWeight:700, fontSize:15,
                color: v.used ? B.muted : B.mint, letterSpacing:3, minWidth:70 }}>{code}</span>
              <div style={{ flex:1 }}>
                <div style={{ fontSize:12, color:"#e2e8f0" }}>{v.service}</div>
                <div style={{ fontSize:10, color:B.muted }}>{v.provider} · {LOCATIONS.find(l=>l.id===v.locId)?.name}</div>
              </div>
              <Badge color={v.used?"gray":"green"}>{v.used?"Used":"Active"}</Badge>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

// ─── BOOT MODAL ───────────────────────────────────────────────────────────────
function BootModal({ session, onConfirm, onCancel }) {
  const [plate, setPlate] = useState(session?.plate || "");
  if (!session) return null;
  const loc = LOCATIONS.find(l => l.id === session.locId);
  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.75)",
      display:"flex", alignItems:"center", justifyContent:"center", zIndex:100, padding:16 }}>
      <div style={{ background:"#0f1c2e", border:`1px solid #7f1d1d`,
        borderRadius:16, padding:24, width:"100%", maxWidth:380,
        boxShadow:"0 0 40px rgba(220,38,38,0.2)" }}>
        <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:16 }}>
          <div style={{ width:40, height:40, borderRadius:10, background:"#2d0a0a",
            border:"1px solid #7f1d1d", display:"flex", alignItems:"center", justifyContent:"center" }}>
            <svg width={18} height={18} viewBox="0 0 18 18" fill="none">
              <path d="M9 1L17 16H1L9 1Z" stroke="#fca5a5" strokeWidth={1.5} strokeLinejoin="round"/>
              <path d="M9 7v3.5M9 12.5v1" stroke="#fca5a5" strokeWidth={1.5} strokeLinecap="round"/>
            </svg>
          </div>
          <div>
            <div style={{ color:"#fff", fontWeight:700, fontSize:15, fontFamily:"'DM Mono',monospace" }}>
              Dispatch Boot — Spot {session.spot}
            </div>
            <div style={{ color:B.muted, fontSize:11 }}>{loc?.name} · unauthorized vehicle</div>
          </div>
        </div>

        <div style={{ background:B.navy, borderRadius:10, padding:12, marginBottom:12 }}>
          <div style={{ fontSize:10, color:B.muted, fontFamily:"'DM Mono',monospace", marginBottom:6 }}>License Plate</div>
          <input value={plate} onChange={e=>setPlate(e.target.value.toUpperCase())}
            placeholder="TXX-0000"
            style={{ background:"transparent", border:"none", color:"#fff",
              fontFamily:"'DM Mono',monospace", fontSize:18, width:"100%",
              outline:"none", letterSpacing:2 }}
          />
        </div>

        <div style={{ background:"#1a1a2e", borderRadius:8, padding:10, marginBottom:16, fontSize:11, color:B.muted, lineHeight:1.5 }}>
          Boot removal fee: <span style={{ color:"#fff", fontWeight:700 }}>$150.00</span> · collected by tow partner.
          Boot must be removed within <span style={{ color:B.yellow }}>1 hour</span> of owner contact.
        </div>

        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8 }}>
          <Btn onClick={onCancel} color="ghost">Cancel</Btn>
          <Btn onClick={()=>onConfirm(session, plate)} color="red" disabled={!plate.trim()}>
            Confirm Dispatch
          </Btn>
        </div>
      </div>
    </div>
  );
}

// ─── ROOT APP ─────────────────────────────────────────────────────────────────
export default function ParkPassApp() {
  const [view,     setView]     = useState("client");
  const [sessions, setSessions] = useState(INIT_SESSIONS);
  const [boots,    setBoots]    = useState(INIT_BOOTS);
  const [codes,    setCodes]    = useState(INIT_CODES);
  const [bootTgt,  setBootTgt]  = useState(null);
  const [tick,     setTick]     = useState(0);

  useEffect(() => {
    const t = setInterval(() => setTick(n => n+1), 20000);
    return () => clearInterval(t);
  }, []);

  const checkin = useCallback(sess => {
    setSessions(p => [...p.filter(s => !(s.spot===sess.spot && s.locId===sess.locId)), sess]);
    setCodes(p => ({ ...p, [sess.code]: { ...p[sess.code], used: true } }));
  }, []);

  const release = useCallback(id => setSessions(p => p.filter(s => s.id !== id)), []);

  const dispatchBoot = useCallback((sess, plate) => {
    setBoots(p => [...p, {
      id:"b"+Date.now(), plate, spot:sess.spot, locId:sess.locId,
      time:Date.now(), fee:150, status:"Dispatched", dispatched:"Dashboard"
    }]);
    setSessions(p => p.filter(s => s.id !== sess.id));
    setBootTgt(null);
  }, []);

  const TABS = [
    { id:"client",  label:"Reserve Spot" },
    { id:"dash",    label:"Dashboard"    },
    { id:"codes",   label:"Codes"        },
  ];

  return (
    <div style={{ minHeight:"100vh", background:B.navy, color:"#e2e8f0",
      fontFamily:"'DM Mono', 'Courier New', monospace" }}>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Mono:ital,wght@0,300;0,400;0,500;0,700;1,400&display=swap');
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: #0a1628; }
        ::-webkit-scrollbar-thumb { background: #1e293b; border-radius: 2px; }
        select option { background: #0a1628; }
        @keyframes fadeUp { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:translateY(0); } }
        .fade-up { animation: fadeUp 0.25s ease forwards; }
      `}</style>

      {/* Header */}
      <div style={{ borderBottom:`1px solid ${B.border}`, background:"rgba(10,22,40,0.95)",
        backdropFilter:"blur(12px)", position:"sticky", top:0, zIndex:50 }}>
        <div style={{ maxWidth:700, margin:"0 auto", padding:"12px 16px",
          display:"flex", alignItems:"center", justifyContent:"space-between" }}>
          <Logo size={34} />
          <div style={{ display:"flex", background:"#0d1f38", borderRadius:10,
            padding:3, border:`1px solid ${B.border}` }}>
            {TABS.map(tab => (
              <button key={tab.id} onClick={()=>setView(tab.id)} style={{
                padding:"7px 14px", borderRadius:8, fontSize:11, fontWeight:600,
                fontFamily:"'DM Mono',monospace", cursor:"pointer", border:"none", letterSpacing:"0.03em",
                background: view===tab.id ? B.teal : "transparent",
                color: view===tab.id ? "#fff" : B.muted,
                transition:"all 0.15s"
              }}>{tab.label}</button>
            ))}
          </div>
        </div>
      </div>

      {/* Body */}
      <div style={{ maxWidth:700, margin:"0 auto", padding:"20px 16px 80px" }} className="fade-up">
        {view === "client" && <ClientView codes={codes} sessions={sessions} onCheckin={checkin} />}
        {view === "dash"   && <Dashboard sessions={sessions} boots={boots} codes={codes} onBoot={setBootTgt} onRelease={release} tick={tick} />}
        {view === "codes"  && <CodeManager codes={codes} setCodes={setCodes} />}
      </div>

      <BootModal session={bootTgt} onConfirm={dispatchBoot} onCancel={()=>setBootTgt(null)} />
    </div>
  );
}
