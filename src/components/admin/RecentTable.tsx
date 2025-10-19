import { Property } from "../../types";
import { Skeleton } from "../ui/Skeleton";

interface RecentTableProps {
  data: Property[];
  columns: Array<keyof Property>;
  loading?: boolean;
  onRowClick?: (id: string) => void;
}

export const RecentTable = ({
  data,
  columns,
  loading = false,
  onRowClick,
}: RecentTableProps) => {
  const formatValue = (key: keyof Property, value: any) => {
    if (key === "price") return `$${value.toLocaleString()}`;
    if (key === "status")
      return (
        <span
          className={`px-2 py-1 text-xs rounded-full ${
            value === "available"
              ? "bg-green-100 text-green-800"
              : value === "sold"
              ? "bg-red-100 text-red-800"
              : "bg-yellow-100 text-yellow-800"
          }`}
        >
          {value}
        </span>
      );
    return value;
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <Skeleton key={i} className="h-12 w-full rounded-lg" />
        ))}
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border">
      <table className="min-w-full divide-y divide-gray-200">
        <tbody className="divide-y divide-gray-200">
          {data.map((item) => (
            <tr
              key={item.id}
              onClick={() => onRowClick?.(item.id)}
              className="hover:bg-gray-50 cursor-pointer transition-colors"
            >
              {columns.map((column) => (
                <td
                  key={column}
                  className="px-4 py-3 whitespace-nowrap text-sm"
                >
                  {formatValue(column, item[column])}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      {data.length === 0 && (
        <div className="p-4 text-center text-gray-500">No data available</div>
      )}
    </div>
  );
};
