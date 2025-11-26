interface IslandProps {
    type: "sleep" | "meditation" | "exercise";
    label: string;
    onClick: () => void;
    icon: string;
}

export const Island = ({ type, label, onClick, icon }: IslandProps) => {
    const getIslandColor = () => {
        switch (type) {
            case "sleep":
                return "from-[hsl(var(--secondary))] to-[hsl(var(--magic-purple))]";
            case "meditation":
                return "from-[hsl(var(--primary))] to-[hsl(var(--ocean-mid))]";
            case "exercise":
                return "from-[hsl(var(--accent))] to-[hsl(var(--island-glow))]";
        }
    };

    return (
        <div className="flex items-center justify-center h-full animate-float group">
            <button
                onClick={onClick}
                className="relative h-40 w-40 rounded-full p-0 overflow-hidden
                transition-all duration-500
                hover:scale-110
                hover:shadow-[0_0_40px_hsl(var(--island-glow)/0.6)] border-4 border-white/20 backdrop-blur-sm"
            >
                <div
                    className={`absolute inset-0 bg-gradient-to-br ${getIslandColor()} opacity-80 group-hover:opacity-100 transition-opacity duration-500`}
                />
                <div className="relative z-10 flex flex-col items-center justify-center gap-2">
          <span className="text-5xl group-hover:scale-125 transition-transform duration-500">
            {icon}
          </span>
                    <span className="text-sm font-light text-white tracking-wider">
            {label}
          </span>
                </div>
            </button>
        </div>
    );
};
