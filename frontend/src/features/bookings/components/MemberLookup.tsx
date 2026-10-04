import { useState, useEffect } from 'react';
import { FaMagnifyingGlass, FaUserCheck, FaUser } from 'react-icons/fa6';
import { useDebounce } from '@/hooks';
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
  const debouncedQuery = useDebounce(query, 300);
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
          if (match && match.name) setSelectedName(match.name);
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
  const filtered = debouncedQuery.trim()
    ? safeMembers.filter(
        (m) =>
          (m.name && m.name.toLowerCase().includes(debouncedQuery.toLowerCase())) ||
          (m.email && m.email.toLowerCase().includes(debouncedQuery.toLowerCase())) ||
          (m.phone && m.phone.includes(debouncedQuery))
      )
    : safeMembers.slice(0, 10);

  return (
    <div className="space-y-3">
      <div className="form-control">
        <label className="label py-1">
          <span className="label-text text-xs font-semibold uppercase tracking-wide">
            Search Member <span className="text-error">*</span>
          </span>
        </label>
        <label className="input input-bordered flex items-center gap-2 w-full text-sm">
          <FaMagnifyingGlass className="size-4 shrink-0 text-base-content/40 pointer-events-none" />
          <input
            type="text"
            className="grow bg-transparent border-none outline-none text-sm placeholder:text-base-content/50"
            placeholder="Search by name, email, or phone"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </label>
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
                  const resolvedName = m.name || `Member #${numericId}`;
                  setSelectedName(resolvedName);
                  onSelectMember(numericId, resolvedName);
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
