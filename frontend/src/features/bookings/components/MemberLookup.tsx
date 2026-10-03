import {  useState, useEffect  } from 'react';
import { FaMagnifyingGlass, FaUserCheck, FaUser } from 'react-icons/fa6';
import { memberService } from '@/services/memberService';
import type { Member } from '@/types/models';

interface MemberLookupProps {
  selectedMemberId: number | null;
  onSelectMember: (memberId: number, memberName: string) => void;
}

export const MemberLookup = ({
  selectedMemberId,
  onSelectMember,
}: MemberLookupProps) => {
  const [query, setQuery] = useState('');
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedName, setSelectedName] = useState<string>('');

  useEffect(() => {
    const search = async () => {
      setLoading(true);
      try {
        const all = await memberService.getAll();
        const safe = Array.isArray(all) ? all : [];
        setMembers(safe);
        if (selectedMemberId && safe.length > 0) {
          const match = safe.find((m) => String(m.id) === String(selectedMemberId));
          if (match) setSelectedName(match.name);
        }
      } catch {
        setMembers([]);
      } finally {
        setLoading(false);
      }
    };
    search();
  }, [selectedMemberId]);

  const safeMembers = Array.isArray(members) ? members : [];
  const filtered = query.trim()
    ? safeMembers.filter(
        (m) =>
          (m.name && m.name.toLowerCase().includes(query.toLowerCase())) ||
          (m.email && m.email.toLowerCase().includes(query.toLowerCase())) ||
          (m.phone && m.phone.includes(query))
      )
    : safeMembers.slice(0, 5);

  return (
    <div className="space-y-3">
      <div className="form-control">
        <label className="label py-1">
          <span className="label-text text-xs font-semibold uppercase tracking-wide">
            Search Member <span className="text-error">*</span>
          </span>
        </label>
        <div className="relative">
          <FaMagnifyingGlass className="size-4 text-base-content/40 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            className="input input-bordered w-full pl-9 text-sm"
            placeholder="Search by name, email, or phone"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
      </div>

      {selectedMemberId && (
        <div className="flex items-center justify-between p-3 rounded-xl bg-primary/10 border border-primary/30 text-sm">
          <div className="flex items-center gap-2">
            <FaUserCheck className="size-4 text-primary" />
            <span className="font-semibold text-primary">Selected: {selectedName || `Member #${selectedMemberId}`}</span>
          </div>
          <span className="badge badge-primary badge-sm font-mono">#{selectedMemberId}</span>
        </div>
      )}

      {loading ? (
        <div className="py-4 text-center">
          <span className="loading loading-spinner loading-xs text-primary" />
        </div>
      ) : (
        <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
          {filtered.map((m) => {
            const numericId = parseInt(String(m.id).replace(/\D/g, ''), 10) || 1;
            const isSelected = selectedMemberId === numericId;

            return (
              <button
                key={m.id}
                type="button"
                onClick={() => {
                  setSelectedName(m.name);
                  onSelectMember(numericId, m.name);
                }}
                className={`w-full text-left p-2.5 rounded-xl border transition-all flex items-center justify-between text-xs ${
                  isSelected
                    ? 'border-primary bg-primary/5 font-semibold'
                    : 'border-base-300 hover:bg-base-200/50'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <FaUser className="size-3 text-base-content/50" />
                  <div>
                    <div className="font-bold text-base-content">{m.name}</div>
                    <div className="text-[11px] text-base-content/60">{m.email} · {m.phone}</div>
                  </div>
                </div>
                <span className="badge badge-xs badge-outline capitalize">{m.membershipPlan}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
