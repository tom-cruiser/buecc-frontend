import { LucideIcon } from "lucide-react";
import { Link } from "react-router-dom";

interface StatCardProps {
  icon: LucideIcon;
  title: string;
  value: string | number;
  trend?: "up" | "down";
  change?: string;
  link?: string;
  alert?: boolean;
}

export const StatCard = ({
  icon: Icon,
  title,
  value,
  trend,
  change,
  link,
  alert,
}: StatCardProps) => {
  const content = (
    <div className="bg-white p-6 rounded-xl border shadow-sm hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-sm text-gray-600 mb-1">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          {trend && change && (
            <div className="flex items-center mt-2">
              <span
                className={`text-sm ${
                  trend === "up" ? "text-green-600" : "text-red-600"
                }`}
              >
                {trend === "up" ? "↑" : "↓"} {change}
              </span>
            </div>
          )}
        </div>
        <div className="relative">
          <div className="p-3 bg-blue-100 rounded-lg text-blue-600">
            <Icon size={20} />
          </div>
          {alert && (
            <span className="absolute -top-2 -right-2 h-5 w-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center">
              !
            </span>
          )}
        </div>
      </div>
    </div>
  );

  return link ? (
    <Link to={link} className="block hover:opacity-90 transition-opacity">
      {content}
    </Link>
  ) : (
    content
  );
};
