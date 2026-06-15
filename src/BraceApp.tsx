import React, { useState, useMemo } from 'react';
import { ArrowLeft, Plus, Minus, RotateCcw, ShoppingBag, X } from 'lucide-react';
import { Bead } from './types';
import { STONE_TYPES, SIZES, DEFAULT_BEADS, EMPTY, MIN_BEADS, MAX_BEADS, SHIPPING_FREE_THRESHOLD, SHIPPING_FEE } from './data';
import { calculateInnerCirc, formatPrice, getSymmetryIdx } from './utils';

export default function BraceApp() {
  const [beads, setBeads] = useState<Bead[]>(Array(DEFAULT_BEADS).fill(null).map(() => ({ ...EMPTY })));
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [isSymmetry, setIsSymmetry] = useState(false);
  const [expandedStoneId, setExpandedStoneId] = useState<string | null>(null);

  const filledBeads = beads.filter(b => b.type !== "empty");
  const totalPrice = filledBeads.reduce((s, b) => s + b.price, 0);
  const innerCirc = calculateInnerCirc(beads);
  const isComplete = beads.every(b => b.type !== "empty");

  const selectBead = (idx: number) => {
    setSelectedIdx(idx);
    setExpandedStoneId(null);
  };

  const finalizeStoneSelection = (typeId: string, size: number, price: number) => {
    const stone = STONE_TYPES.find(s => s.id === typeId)!;
    const newBeads = [...beads];
    
    newBeads[selectedIdx] = { 
      id: stone.id, type: "bead", name: stone.name, size, price, color: stone.color, image: stone.image 
    };

    if (isSymmetry && selectedIdx !== 0) {
      const symIdx = getSymmetryIdx(selectedIdx, beads.length, isSymmetry);
      if (symIdx !== -1) {
        newBeads[symIdx] = { 
          id: stone.id, type: "bead", name: stone.name, size, price, color: stone.color, image: stone.image 
        };
      }
    }

    setBeads(newBeads);
    setExpandedStoneId(null);

    // Auto advance
    for (let i = 1; i <= newBeads.length; i++) {
        const nextIdx = (selectedIdx + i) % newBeads.length;
        if (newBeads[nextIdx].type === "empty") { 
          setSelectedIdx(nextIdx); 
          break; 
        }
    }
  };

  const changeBeadCount = (delta: number) => {
    if (delta > 0 && beads.length < MAX_BEADS) {
      setBeads([...beads, { ...EMPTY }]);
    } else if (delta < 0 && beads.length > MIN_BEADS) {
      setBeads(beads.slice(0, -1));
      if (selectedIdx >= beads.length - 1) setSelectedIdx(beads.length - 2);
    }
  };

  const resetBeads = () => {
    if (filledBeads.length === 0) return;
    if (confirm("配置した石をすべてリセットしますか?")) {
      setBeads(Array(beads.length).fill(null).map(() => ({ ...EMPTY })));
      setSelectedIdx(0);
      setExpandedStoneId(null);
    }
  };

  const currentBead = beads[selectedIdx];
  const progress = Math.min(100, (totalPrice / SHIPPING_FREE_THRESHOLD) * 100);

  return (
    <div className="min-h-screen flex flex-col pt-16 md:pt-20">
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/85 backdrop-blur-md border-b border-stone-200 py-4 md:py-5">
        <div className="max-w-7xl mx-auto px-6 md:px-12 flex items-center justify-between">
          <div className="w-1/4 flex justify-start items-center">
            <a href="/" className="text-xl font-serif tracking-[0.15em] whitespace-nowrap text-[#1B2A47] leading-none">
              有限会社 やまなみ銘石
            </a>
          </div>
          <div className="hidden lg:flex items-center justify-center gap-12 w-2/4">
            <a href="/" className="flex flex-col items-center group transition-opacity">
              <span className="text-[10px] tracking-[0.2em] font-light text-stone-800">HOME</span>
              <span className="text-[8px] mt-1 text-stone-400 group-hover:text-stone-800 transition-colors">ホーム</span>
            </a>
            <a href="/BRACE.html" className="flex flex-col items-center group transition-opacity">
              <span className="text-[10px] tracking-[0.2em] font-medium text-stone-900 border-b border-stone-800 pb-1">CUSTOM</span>
              <span className="text-[8px] mt-1 text-stone-900 transition-colors">ブレスレット作成</span>
            </a>
          </div>
          <div className="w-1/4 flex justify-end"></div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 flex flex-col lg:flex-row gap-8 lg:gap-12">
        {/* Left: Preview */}
        <div className="w-full lg:w-5/12 lg:sticky lg:top-28 h-auto self-start">
          <div className="bg-white border text-center border-stone-200 rounded-sm shadow-sm overflow-hidden p-6 relative aspect-square flex flex-col items-center justify-center">
            
            <div className="absolute top-4 left-4 text-xs font-serif tracking-widest text-stone-400">
              SIMULATOR
            </div>
            <div className="absolute top-4 right-4 text-xs font-serif text-stone-400 tracking-wider">
              {filledBeads.length}/{beads.length}
            </div>

            {/* SVG Simulator rendering - highly simplified and robust */}
            <div className="w-full h-full relative mt-8">
              <svg viewBox="-200 -200 400 400" className="w-full h-full absolute inset-0">
                <defs>
                   <radialGradient id="shadowG" cx="30%" cy="30%" r="70%">
                     <stop offset="60%" stopColor="#000" stopOpacity="0" />
                     <stop offset="90%" stopColor="#000" stopOpacity="0.25" />
                     <stop offset="100%" stopColor="#000" stopOpacity="0.6" />
                   </radialGradient>
                   <radialGradient id="glareG" cx="35%" cy="20%" r="35%">
                     <stop offset="0%" stopColor="#fff" stopOpacity="0.85" />
                     <stop offset="30%" stopColor="#fff" stopOpacity="0.3" />
                     <stop offset="100%" stopColor="#fff" stopOpacity="0" />
                   </radialGradient>
                </defs>
                {beads.map((b, i) => {
                  const scale = 3.2;
                  const totalD = beads.reduce((s, bead) => s + bead.size, 0);
                  const r_2d = (totalD * scale) / (2 * Math.PI);
                  
                  // Compute simple angle
                  const a = (i / beads.length) * 2 * Math.PI - Math.PI / 2;
                  const cx = r_2d * Math.cos(a);
                  const cy = r_2d * Math.sin(a);
                  const r = (b.size * scale) / 2;
                  
                  const isSel = i === selectedIdx;
                  const isSym = i === getSymmetryIdx(selectedIdx, beads.length, isSymmetry);

                  return (
                    <g key={i} onClick={() => selectBead(i)} className="cursor-pointer" style={{ transition: 'all 0.3s' }}>
                      {isSel && <circle cx={cx} cy={cy} r={r + 4} fill="none" stroke="#C5B382" strokeWidth="2" opacity="0.9" />}
                      {isSym && <circle cx={cx} cy={cy} r={r + 4} fill="none" stroke="#1B2A47" strokeWidth="1.5" strokeDasharray="3 2" opacity="0.5" />}
                      
                      {b.type === "empty" ? (
                        <>
                          <circle cx={cx} cy={cy} r={r} fill="transparent" stroke="#e5e5e5" strokeWidth="1.5" strokeDasharray="4 3" />
                          <text x={cx} y={cy + 3} textAnchor="middle" fontSize="10" fill="#cccccc">+</text>
                        </>
                      ) : (
                        <>
                          {b.color && <circle cx={cx} cy={cy} r={r} fill={b.color} />}
                          <circle cx={cx} cy={cy} r={r} fill="url(#shadowG)" pointerEvents="none" />
                          <circle cx={cx} cy={cy} r={r} fill="url(#glareG)" pointerEvents="none" />
                          <circle cx={cx} cy={cy} r={r} fill="none" stroke="rgba(0,0,0,0.1)" strokeWidth="0.5" pointerEvents="none" />
                        </>
                      )}
                    </g>
                  );
                })}
              </svg>
            </div>
            
            <div className="absolute inset-x-0 bottom-6 text-center text-stone-500 text-[10px] tracking-widest font-light">
              内周目安: <span className="font-serif text-[#1B2A47] text-lg ml-1">{innerCirc}</span> cm
            </div>
          </div>
        </div>

        {/* Right: Controls */}
        <div className="w-full lg:w-7/12 flex flex-col space-y-8">
          
          <div className="flex justify-between items-end border-b border-stone-200 pb-4">
            <div>
              <p className="text-[10px] text-stone-400 tracking-widest mb-2 font-serif">ESTIMATE AMOUNT</p>
              <div className="text-3xl font-serif tracking-widest text-[#1B2A47]">
                ¥{formatPrice(totalPrice)}
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex items-center border border-stone-200 rounded-sm">
                <button onClick={() => changeBeadCount(-1)} className="p-3 text-stone-400 hover:text-[#1B2A47] transition-colors"><Minus size={16} /></button>
                <span className="text-xs tracking-widest w-12 text-center text-stone-600 font-serif">{beads.length}</span>
                <button onClick={() => changeBeadCount(1)} className="p-3 text-stone-400 hover:text-[#1B2A47] transition-colors"><Plus size={16} /></button>
              </div>
              <button onClick={resetBeads} className="flex items-center gap-2 px-4 border border-stone-200 text-xs text-stone-500 hover:text-red-900 hover:border-red-900 transition-colors tracking-widest rounded-sm">
                <RotateCcw size={14} /> RESET
              </button>
            </div>
          </div>

          {/* Shipping Banner */}
          {filledBeads.length > 0 && totalPrice < SHIPPING_FREE_THRESHOLD && (
            <div className="bg-stone-50 border border-stone-200 p-4 text-center rounded-sm">
              <p className="text-xs text-stone-500 tracking-wider">
                送料 <span className="font-serif">¥{formatPrice(SHIPPING_FEE)}</span> / あと <span className="font-serif font-medium text-[#c5b382]">¥{formatPrice(SHIPPING_FREE_THRESHOLD - totalPrice)}</span> で送料無料
              </p>
              <div className="w-full bg-stone-200 h-1 mt-3 rounded-full overflow-hidden">
                <div className="bg-[#c5b382] h-full transition-all duration-500" style={{ width: progress + '%' }}></div>
              </div>
            </div>
          )}

          {/* Stone Selector Header */}
          <div className="flex justify-between items-center bg-[#1B2A47] text-white p-4 rounded-sm shadow-sm">
            <div className="flex items-center gap-4">
              <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center font-serif text-xs">
                {selectedIdx + 1}
              </div>
              <div>
                <p className="text-[10px] tracking-widest opacity-60">SELECTED BEAD</p>
                <p className="text-sm font-medium tracking-widest">{currentBead.type === 'empty' ? '未選択 (ストーンを選んでください)' : currentBead.name + ' (' + currentBead.size + 'mm)'}</p>
              </div>
            </div>
            <label className="flex items-center gap-2 text-xs tracking-wider cursor-pointer group">
              <input type="checkbox" checked={isSymmetry} onChange={e => setIsSymmetry(e.target.checked)} className="accent-[#c5b382] w-4 h-4 cursor-pointer" />
              <span className="group-hover:text-[#c5b382] transition-colors">左右対称に配置</span>
            </label>
          </div>

          {/* Stones Grid */}
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
             {STONE_TYPES.map(stone => {
               const isExpanded = expandedStoneId === stone.id;
               return (
                 <div key={stone.id} className="relative">
                   <button 
                     onClick={() => setExpandedStoneId(isExpanded ? null : stone.id)}
                     className={"w-full flex justify-center items-center py-4 border rounded-sm transition-all duration-300 " + (isExpanded ? 'border-[#1B2A47] bg-stone-50' : 'border-stone-200 bg-white hover:border-stone-400')}
                   >
                     <div className="w-10 h-10 rounded-full" style={{ background: stone.color, boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.1)' }}></div>
                   </button>
                   <p className="text-[10px] text-center mt-2 text-stone-600 tracking-wider whitespace-nowrap overflow-hidden text-ellipsis px-1">{stone.name}</p>
                 </div>
               );
             })}
          </div>

          {/* Size Panel overlay or inline */}
          {expandedStoneId && (
            <div className="bg-stone-50 border border-stone-200 p-6 rounded-sm mt-4 animate-in fade-in slide-in-from-top-4">
              <div className="flex justify-between items-center mb-4">
                <p className="text-sm tracking-widest text-[#1B2A47] font-medium">サイズを選択</p>
                <button onClick={() => setExpandedStoneId(null)} className="text-stone-400 hover:text-stone-600"><X size={18}/></button>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {SIZES.map(s => {
                  const stone = STONE_TYPES.find(x => x.id === expandedStoneId)!;
                  const price = stone.prices[s as 8|10];
                  if (price == null) {
                    return (
                      <button key={s} disabled className="p-4 border border-stone-200 bg-white opacity-50 cursor-not-allowed">
                        <div className="text-lg font-serif mb-1">{s}mm</div>
                        <div className="text-xs text-red-800 tracking-widest">SOLD OUT</div>
                      </button>
                    );
                  }
                  return (
                    <button key={s} onClick={() => finalizeStoneSelection(stone.id, s, price)} className="p-4 border border-stone-200 bg-white hover:border-[#1B2A47] hover:bg-stone-50 transition-colors text-left group">
                      <div className="text-lg font-serif mb-1 text-[#1B2A47]">{s}mm</div>
                      <div className="text-xs tracking-widest text-stone-500 group-hover:text-[#c5b382] transition-colors">¥{formatPrice(price)}</div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Order Action */}
          <div className="pt-8 border-t border-stone-200">
            {!isComplete && (
               <p className="text-center text-xs tracking-widest text-[#c5b382] mb-4">
                 残り {beads.length - filledBeads.length} 玉配置してください
               </p>
            )}
            <button 
              disabled={!isComplete}
              className={"w-full py-5 flex items-center justify-center gap-4 text-xs tracking-[0.2em] transition-all duration-500 " + (isComplete ? 'bg-[#1B2A47] text-white hover:opacity-90 cursor-pointer shadow-lg' : 'bg-stone-200 text-stone-400 cursor-not-allowed')}
            >
              <ShoppingBag size={16} /> 注文画面へ進む
            </button>
            <p className="text-center text-[10px] text-stone-400 tracking-wider mt-4">
               ※注文画面でレビュー割（5%OFF）等のオプションを選択できます
            </p>
          </div>

        </div>
      </main>
      
      <footer className="mt-20 border-t border-stone-200 py-8 text-center bg-stone-50">
        <p className="text-[10px] text-stone-400 tracking-widest">© 有限会社 やまなみ銘石</p>
      </footer>
    </div>
  );
}
