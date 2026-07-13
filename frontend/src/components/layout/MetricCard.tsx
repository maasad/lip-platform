interface Props {
  label: string;
  value: string;
  subValue?: string;
  accent?: "default" | "green" | "red" | "orange" | "blue";
}

const accentConfig = {
  default: "text-gray-100",
  green: "text-green-400",
  red: "text-red-400",
  orange: "text-orange-400",
  blue: "text-blue-400",
};

export const MetricCard = ({
  label,
  value,
  subValue,
  accent = "default",
}: Props) => {
  return (
    <div className="bg-gray-900 rounded-lg border border-gray-800 px-4 py-3">
      <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">
        {label}
      </p>
      <p className={`text-2xl font-bold font-mono ${accentConfig[accent]}`}>
        {value}
      </p>
      {subValue && <p className="text-xs text-gray-500 mt-1">{subValue}</p>}
    </div>
  );
};
