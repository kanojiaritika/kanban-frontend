const NavItem = ({ icon, label, active = false, badge }) => (
    <div
        className={`flex items-center gap-2.5 px-2.5 py-2 rounded-lg cursor-pointer transition-colors text-md
            ${active
                ? "bg-indigo-50 dark:bg-white/8 text-indigo-600 dark:text-white font-medium"
                : "text-gray-500 dark:text-white/45 hover:text-gray-900 dark:hover:text-white/80 hover:bg-gray-100 dark:hover:bg-white/5"
            }`}
    >
        <span className={active ? "text-indigo-500 dark:text-indigo-400" : ""}>{icon}</span>
        <span className="flex-1">{label}</span>
        {badge && (
            <span className="flex items-center justify-center w-4 h-4 rounded-full bg-indigo-500 text-white text-[10px] font-semibold">
                {badge}
            </span>
        )}
    </div>
);

export default NavItem;