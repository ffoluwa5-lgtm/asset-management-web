interface Props {
  title: string;
  value: number;
}

export default function DashboardCard({
  title,
  value,
}: Props) {
  return (
    <div className="bg-white rounded-xl shadow p-6">
      <h3 className="text-gray-500">
        {title}
      </h3>

      <p className="text-4xl font-bold mt-4">
        {value}
      </p>
    </div>
  );
}