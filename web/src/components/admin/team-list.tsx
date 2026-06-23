interface TeamMember {
  id: string | number;
  user?: {
    email: string;
  };
  role: string;
}

export const TeamList = ({ members }: { members: TeamMember[] }) => (
  <div className="flex flex-col gap-6 max-w-2xl">
    {members.length > 0 ? (
      members.map((member) => (
        <div
          key={member.id}
          className="flex items-center gap-4 group/item animate-in fade-in slide-in-from-left-2 duration-300"
        >
          <div className="w-12 h-12 bg-neutral-100 border border-neutral-200 flex items-center justify-center font-bold text-neutral-400 group-hover/item:bg-black group-hover/item:text-white transition-all duration-300">
            {(member.user?.email || 'U').charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="text-sm font-bold text-black">{member.user?.email}</p>
            <p className="text-[10px] font-black uppercase tracking-widest text-neutral-400">
              {member.role}
            </p>
          </div>
        </div>
      ))
    ) : (
      <div className="text-neutral-400 text-sm py-4">No team members yet.</div>
    )}
  </div>
);
