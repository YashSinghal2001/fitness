import React, { useState, useEffect, useRef } from 'react';
import api from '../services/api';
import { Sliders, Layout } from 'lucide-react';
import clsx from 'clsx';

const PhotoComparison = () => {
  const [photos, setPhotos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [beforeId, setBeforeId] = useState<string>('');
  const [afterId, setAfterId] = useState<string>('');
  const [view, setView] = useState<'front' | 'side' | 'rear'>('front');
  const [mode, setMode] = useState<'side-by-side' | 'slider'>('side-by-side');
  
  const [sliderPosition, setSliderPosition] = useState(50);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchPhotos();
  }, []);

  const fetchPhotos = async () => {
    try {
      const res = await api.get('/photos/compare');
      setPhotos(res.data);
      if (res.data.length >= 2) {
        setBeforeId(res.data[res.data.length - 1]._id); // Oldest
        setAfterId(res.data[0]._id); // Newest
      } else if (res.data.length === 1) {
        setBeforeId(res.data[0]._id);
        setAfterId(res.data[0]._id);
      }
    } catch (error) {
      console.error('Error fetching photos:', error);
    } finally {
      setLoading(false);
    }
  };

  const getPhotoUrl = (photoId: string) => {
    const photo = photos.find(p => p._id === photoId);
    if (!photo) return null;
    return photo[view]?.url;
  };

  const getPhotoDate = (photoId: string) => {
    const photo = photos.find(p => p._id === photoId);
    if (!photo) return '';
    return new Date(photo.date).toLocaleDateString();
  };

  const handleSliderMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = ('touches' in e ? e.touches[0].clientX : e.clientX) - rect.left;
    const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setSliderPosition(percentage);
  };

  const beforeUrl = getPhotoUrl(beforeId);
  const afterUrl = getPhotoUrl(afterId);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h2 className="text-3xl font-bold text-highlight">Photo Comparison</h2>
        
        {/* View & Mode Toggles */}
        <div className="flex gap-2 bg-secondary/10 p-1 rounded-lg border border-primary/20">
          <button
            onClick={() => setMode('side-by-side')}
            className={clsx(
              "p-2 rounded-md transition-colors",
              mode === 'side-by-side' ? "bg-primary text-highlight shadow-sm" : "text-secondary hover:text-highlight"
            )}
            title="Side by Side"
          >
            <Layout size={20} />
          </button>
          <button
            onClick={() => setMode('slider')}
            className={clsx(
              "p-2 rounded-md transition-colors",
              mode === 'slider' ? "bg-primary text-highlight shadow-sm" : "text-secondary hover:text-highlight"
            )}
            title="Slider Comparison"
          >
            <Sliders size={20} />
          </button>
        </div>
      </div>

      <div className="card space-y-6">
        {/* Controls */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium mb-2 text-secondary">Before Week</label>
            <select 
              value={beforeId} 
              onChange={(e) => setBeforeId(e.target.value)}
              className="input-field bg-[#292966]"
            >
              {photos.map(p => (
                <option key={p._id} value={p._id}>
                  {new Date(p.date).toLocaleDateString()}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-secondary">After Week</label>
            <select 
              value={afterId} 
              onChange={(e) => setAfterId(e.target.value)}
              className="input-field bg-[#292966]"
            >
              {photos.map(p => (
                <option key={p._id} value={p._id}>
                  {new Date(p.date).toLocaleDateString()}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-secondary">View Angle</label>
            <div className="flex rounded-lg overflow-hidden border border-primary">
              {(['front', 'side', 'rear'] as const).map((v) => (
                <button
                  key={v}
                  onClick={() => setView(v)}
                  className={clsx(
                    "flex-1 py-2 text-sm font-medium capitalize transition-colors",
                    view === v ? "bg-primary text-highlight" : "bg-secondary/10 text-secondary hover:bg-secondary/20"
                  )}
                >
                  {v}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Comparison Display */}
        <div className="mt-8">
          {(!beforeUrl || !afterUrl) ? (
            <div className="text-center py-20 text-secondary bg-black/20 rounded-xl border border-border border-dashed">
              <p>Select dates with available photos for the chosen view angle.</p>
            </div>
          ) : mode === 'side-by-side' ? (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="text-center text-sm font-medium text-secondary">{getPhotoDate(beforeId)}</div>
                <div className="aspect-[3/4] relative rounded-xl overflow-hidden bg-black/40 border border-border">
                  <img src={beforeUrl} alt="Before" className="absolute inset-0 w-full h-full object-contain" />
                  <div className="absolute top-2 left-2 bg-black/60 px-2 py-1 rounded text-xs text-white">Before</div>
                </div>
              </div>
              <div className="space-y-2">
                <div className="text-center text-sm font-medium text-secondary">{getPhotoDate(afterId)}</div>
                <div className="aspect-[3/4] relative rounded-xl overflow-hidden bg-black/40 border border-border">
                  <img src={afterUrl} alt="After" className="absolute inset-0 w-full h-full object-contain" />
                  <div className="absolute top-2 right-2 bg-primary/80 px-2 py-1 rounded text-xs text-highlight font-bold">After</div>
                </div>
              </div>
            </div>
          ) : (
            <div className="max-w-2xl mx-auto">
              <div className="flex justify-between text-sm font-medium text-secondary mb-2">
                <span>{getPhotoDate(beforeId)}</span>
                <span>{getPhotoDate(afterId)}</span>
              </div>
              
              <div 
                ref={containerRef}
                className="relative aspect-[3/4] rounded-xl overflow-hidden cursor-ew-resize select-none border border-border bg-black"
                onMouseMove={(e) => e.buttons === 1 && handleSliderMove(e)}
                onTouchMove={handleSliderMove}
                onClick={handleSliderMove}
              >
                {/* After Image (Background) */}
                <img 
                  src={afterUrl} 
                  alt="After" 
                  className="absolute inset-0 w-full h-full object-contain pointer-events-none" 
                />

                {/* Before Image (Foreground, clipped) */}
                <img 
                  src={beforeUrl} 
                  alt="Before" 
                  className="absolute inset-0 w-full h-full object-contain pointer-events-none" 
                  style={{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }}
                />

                {/* Slider Handle */}
                <div 
                  className="absolute top-0 bottom-0 w-1 bg-primary cursor-ew-resize z-10 shadow-[0_0_10px_rgba(0,0,0,0.5)]"
                  style={{ left: `${sliderPosition}%` }}
                >
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-primary rounded-full flex items-center justify-center shadow-lg text-highlight">
                    <Sliders size={16} />
                  </div>
                </div>

                {/* Labels */}
                <div className="absolute top-4 left-4 bg-black/60 px-2 py-1 rounded text-xs text-white pointer-events-none">Before</div>
                <div className="absolute top-4 right-4 bg-primary/80 px-2 py-1 rounded text-xs text-highlight font-bold pointer-events-none">After</div>
              </div>
              
              <div className="text-center text-xs text-secondary mt-2">
                Drag or click to compare
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PhotoComparison;
