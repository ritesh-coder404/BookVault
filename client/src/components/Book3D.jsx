import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Star } from 'lucide-react';

const css = `
.bv-scene {
  --bw: 240px;
  --bh: calc(var(--bw) * 1.35);
  width: var(--bw);
  height: var(--bh);
  perspective: 1800px;
  cursor: pointer;
  position: relative;
}
@media (max-width: 520px) {
  .bv-scene { --bw: 150px; }
}

.bv-book {
  position: relative;
  width: 100%;
  height: 100%;
  transform-style: preserve-3d;
  transform: rotateX(8deg) rotateY(-24deg);
  transition: transform 1.3s cubic-bezier(.45,.05,.2,1);
}
.bv-book.is-open {
  transform: translateX(50%) rotateX(10deg) rotateY(-6deg);
}

/* common face style */
.bv-face {
  position: absolute;
  inset: 0;
  border-radius: 4px 12px 12px 4px;
  overflow: hidden;
}

/* back cover */
.bv-back {
  background: #1e1b4b;
  transform: translateZ(-8px);
  box-shadow: 0 30px 50px -10px rgba(0,0,0,.6);
}

/* right page (content visible after opening) */
.bv-right {
  background: linear-gradient(90deg, #e7e0cf 0%, #fbf8ef 12%, #fffdf6 100%);
  transform: translateZ(-4px);
  padding: 16px 14px 14px 20px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 6px;
  color: #1e293b;
}

/* flipping paper sheets */
.bv-sheet {
  background: linear-gradient(90deg, #ddd5c0 0%, #fbf8ef 10%, #fffdf6 100%);
  transform-origin: left center;
  transition: transform 1.2s cubic-bezier(.45,.05,.2,1);
  box-shadow: inset -2px 0 6px rgba(0,0,0,.08);
}
.bv-sheet.s1 { transform: translateZ(-1px); }
.bv-sheet.s2 { transform: translateZ(1px);  transition-delay: .08s; }
.bv-sheet.s3 { transform: translateZ(3px);  transition-delay: .16s; }
.is-open .bv-sheet.s1 { transform: translateZ(-1px) rotateY(-150deg); transition-delay: .35s; }
.is-open .bv-sheet.s2 { transform: translateZ(1px)  rotateY(-158deg); transition-delay: .25s; }
.is-open .bv-sheet.s3 { transform: translateZ(3px)  rotateY(-165deg); transition-delay: .15s; }

/* front cover (opens like a door) */
.bv-cover {
  position: absolute;
  inset: 0;
  transform-origin: left center;
  transform-style: preserve-3d;
  transform: translateZ(6px);
  transition: transform 1.4s cubic-bezier(.5,.05,.2,1);
}
.is-open .bv-cover {
  transform: translateZ(6px) rotateY(-172deg);
}
.bv-cover-front,
.bv-cover-inside {
  backface-visibility: hidden;
  -webkit-backface-visibility: hidden;
}
.bv-cover-front {
  box-shadow: 0 0 0 2px rgba(255,255,255,.18), 0 20px 40px -10px rgba(0,0,0,.5);
}
.bv-cover-front::after {
  /* spine shine */
  content: '';
  position: absolute;
  top: 0; bottom: 0; left: 0;
  width: 14px;
  background: linear-gradient(90deg, rgba(0,0,0,.35), rgba(255,255,255,.18) 40%, rgba(0,0,0,.1));
}
.bv-cover-inside {
  transform: rotateY(180deg);
  background: linear-gradient(270deg, #e7e0cf 0%, #fbf8ef 12%, #fffdf6 100%);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 16px;
  color: #3730a3;
  gap: 8px;
}

/* shadow on the ground */
.bv-shadow {
  position: absolute;
  left: 5%;
  right: 5%;
  bottom: -34px;
  height: 22px;
  background: radial-gradient(ellipse at center, rgba(0,0,0,.55), transparent 70%);
  filter: blur(6px);
  transition: transform 1.3s ease;
}
.bv-book.is-open ~ .bv-shadow { transform: translateX(50%) scaleX(1.9); }

@media (prefers-reduced-motion: reduce) {
  .bv-book, .bv-cover, .bv-sheet, .bv-shadow { transition: none !important; }
}
`;

export default function Book3D({ book }) {
  const [open, setOpen] = useState(false);

  // page load hone ke thodi der baad apne aap khulegi
  useEffect(() => {
    const t = setTimeout(() => setOpen(true), 900);
    return () => clearTimeout(t);
  }, []);

  return (
    <div
      className="bv-scene"
      onClick={() => setOpen((o) => !o)}
      title="Click to open / close"
    >
      <style>{css}</style>

      <div className={`bv-book ${open ? 'is-open' : ''}`}>
        {/* Back cover */}
        <div className="bv-face bv-back" />

        {/* Right page: book details */}
        <div className="bv-face bv-right">
          <span className="px-2 py-0.5 rounded-full bg-indigo-600 text-white text-[9px] font-bold uppercase tracking-wider w-max">
            Featured Bestseller
          </span>
          <h3 className="font-black text-sm sm:text-base leading-snug line-clamp-3">
            {book.title}
          </h3>
          <p className="text-[11px] text-slate-500">by {book.author}</p>
          <div className="flex items-center gap-1 text-[11px] font-bold text-amber-600">
            <Star className="w-3 h-3 fill-amber-400 text-amber-400" /> 4.9 / 5.0
          </div>
          <p className="text-base font-black text-indigo-700">₹{book.price}</p>
          {book.id && (
            <Link
              to={`/books/${book.id}`}
              onClick={(e) => e.stopPropagation()}
              className="mt-1 text-center px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-[11px] font-bold transition"
            >
              View Details
            </Link>
          )}
        </div>

        {/* Flipping pages */}
        <div className="bv-face bv-sheet s1" />
        <div className="bv-face bv-sheet s2" />
        <div className="bv-face bv-sheet s3" />

        {/* Front cover */}
        <div className="bv-cover">
          <div className="bv-face bv-cover-front">
            <img
              src={book.image_url}
              alt={book.title}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="bv-face bv-cover-inside">
            <p className="text-[10px] uppercase tracking-widest font-bold text-indigo-400">
              Welcome to
            </p>
            <p className="text-lg font-black">BookVault</p>
            <p className="text-[10px] text-slate-500 leading-relaxed">
              100+ bestsellers.<br />Open a book, open a world.
            </p>
          </div>
        </div>
      </div>

      <div className="bv-shadow" />
    </div>
  );
}
