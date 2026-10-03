import {  useState  } from 'react';
import { FaImage, FaTrash } from 'react-icons/fa6';


interface EquipmentImageUploadProps {
  value?: string | null;
  onChange: (url: string) => void;
}

const PRESET_IMAGES = [
  {
    name: 'Tennis Racket',
    url: 'https://images.unsplash.com/photo-1617083934555-ac7d4fed8889?w=500&auto=format&fit=crop&q=60',
  },
  {
    name: 'Tennis Balls',
    url: 'https://images.unsplash.com/photo-1587280501635-68a0e82cd5ff?w=500&auto=format&fit=crop&q=60',
  },
  {
    name: 'Cricket Ball',
    url: 'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?w=500&auto=format&fit=crop&q=60',
  },
  {
    name: 'Court Shoes',
    url: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500&auto=format&fit=crop&q=60',
  },
  {
    name: 'Club Flask',
    url: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=500&auto=format&fit=crop&q=60',
  },
];

export const EquipmentImageUpload = ({
  value,
  onChange,
}: EquipmentImageUploadProps) => {
  const [customUrl, setCustomUrl] = useState(value || '');

  const handleApplyUrl = () => {
    if (customUrl.trim()) {
      onChange(customUrl.trim());
    }
  };

  const handleSelectPreset = (url: string) => {
    setCustomUrl(url);
    onChange(url);
  };

  const handleClear = () => {
    setCustomUrl('');
    onChange('');
  };

  return (
    <div className="space-y-3">
      <label className="label py-0.5">
        <span className="label-text font-semibold text-xs uppercase tracking-wide">
          Product Image
        </span>
      </label>

      {/* Preview Box */}
      <div className="flex items-center gap-4 p-3 bg-base-200 rounded-xl border border-base-300">
        {value ? (
          <div className="relative group size-20 rounded-lg overflow-hidden border border-base-300 shrink-0">
            <img src={value} alt="Preview" className="size-full object-cover" />
            <button
              type="button"
              onClick={handleClear}
              className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-white text-xs gap-1"
            >
              <FaTrash className="size-3" /> Clear
            </button>
          </div>
        ) : (
          <div className="size-20 rounded-lg bg-base-300 flex flex-col items-center justify-center text-base-content/40 shrink-0">
            <FaImage className="size-6" />
            <span className="text-[10px] mt-1 font-medium">No Image</span>
          </div>
        )}

        <div className="flex-1 space-y-2">
          <div className="join w-full">
            <input
              type="url"
              placeholder="Paste image URL (https://...)"
              value={customUrl}
              onChange={(e) => setCustomUrl(e.target.value)}
              className="input input-bordered input-sm join-item w-full text-xs"
            />
            <button
              type="button"
              onClick={handleApplyUrl}
              className="btn btn-primary btn-sm join-item text-xs"
            >
              Set
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
            <span className="text-[10px] text-base-content/60 font-semibold uppercase">
              Presets:
            </span>
            {PRESET_IMAGES.map((preset) => (
              <button
                key={preset.name}
                type="button"
                onClick={() => handleSelectPreset(preset.url)}
                className={`badge badge-sm cursor-pointer hover:badge-primary text-[10px] transition-colors ${
                  value === preset.url ? 'badge-primary' : 'badge-ghost'
                }`}
              >
                {preset.name}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
