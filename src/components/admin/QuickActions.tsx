import { LucideIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface QuickAction {
  icon: LucideIcon;
  label: string;
  count?: number;
  onClick: () => void;
}

interface QuickActionsProps {
  actions: QuickAction[];
}

export const QuickActions = ({ actions }: QuickActionsProps) => {
  const navigate = useNavigate();

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
      <div className="space-y-3">
        {actions.map((action) => (
          <button
            key={action.label}
            onClick={action.onClick}
            className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center">
              <action.icon className="mr-3 text-blue-600" size={18} />
              <span>{action.label}</span>
            </div>
            {action.count && (
              <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                {action.count}
              </span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
};
