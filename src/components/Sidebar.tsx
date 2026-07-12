"use client";

import Link from "next/link";

const menu = [
  { name: "Dashboard", href: "/dashboard" },
  { name: "Assets", href: "/assets" },
  { name: "Categories", href: "/categories" },
  { name: "Allocations", href: "/allocations" },
  { name: "Maintenance", href: "/maintenance" },
];

export default function Sidebar() {
  return (
    <aside className="w-64 bg-slate-900 text-white min-h-screen p-6">
      <h2 className="text-2xl font-bold mb-8">
        Asset Manager
      </h2>

      <nav className="space-y-3">
        {menu.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="block rounded-lg px-4 py-3 hover:bg-slate-700 transition"
          >
            {item.name}
          </Link>
        ))}
      </nav>
    </aside>
  );
}