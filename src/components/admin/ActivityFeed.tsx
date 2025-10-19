import { format } from "date-fns";
import { Property, Inquiry } from "../../types";

interface ActivityItem {
  id: string;
  type: "property" | "inquiry";
  action: string;
  date: Date;
  title: string;
}

interface ActivityFeedProps {
  items: Array<Property | Inquiry>;
  maxItems?: number;
}

export const ActivityFeed = ({ items, maxItems = 5 }: ActivityFeedProps) => {
  const normalizeActivity = (item: Property | Inquiry): ActivityItem => {
    if ("price" in item) {
      // Property
      return {
        id: item.id,
        type: "property",
        action: item.status === "available" ? "Added" : "Updated",
        date: new Date(item.updatedAt || item.createdAt),
        title: item.title,
      };
    } else {
      // Inquiry
      return {
        id: item.id,
        type: "inquiry",
        action: "New inquiry",
        date: new Date(item.createdAt),
        title: item.subject,
      };
    }
  };

  const activities = items
    .map(normalizeActivity)
    .sort((a, b) => b.date.getTime() - a.date.getTime())
    .slice(0, maxItems);

  return (
    <div className="space-y-4">
      {activities.map((activity) => (
        <div key={activity.id} className="flex items-start">
          <div className="flex-shrink-0 mt-1 mr-3">
            <div
              className={`h-2 w-2 rounded-full ${
                activity.type === "property" ? "bg-blue-500" : "bg-green-500"
              }`}
            />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">
              {activity.title}
            </p>
            <div className="flex justify-between">
              <p className="text-xs text-gray-500">{activity.action}</p>
              <p className="text-xs text-gray-400">
                {format(activity.date, "MMM d, h:mm a")}
              </p>
            </div>
          </div>
        </div>
      ))}
      {activities.length === 0 && (
        <p className="text-sm text-gray-500 text-center py-4">
          No recent activity
        </p>
      )}
    </div>
  );
};
