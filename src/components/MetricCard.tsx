import React from "react";
import { ArrowUpRight, ArrowDownRight, Minus } from "lucide-react";

interface MetricCardProps {
  title: string;
  value: string | number;
  description: string;
  icon?: React.ReactNode;
  trend?: "up" | "down" | "neutral";
  trendValue?: string;
  bgColor?: string;
}

export default function MetricCard({
  title,
  value,
  description,
  icon,
  trend,
  trendValue,
  bgColor = "glass"
}: MetricCardProps) {
  return (
    <div className={`p-5 rounded-2xl transition-all duration-300 hover:shadow-md hover:scale-[1.01] ${bgColor}`}>
      <div className="flex justify-between items-start">
        <div>
          <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">{title}</p>
          <h3 className="text-2xl md:text-3xl font-extrabold text-slate-900 mt-2 tracking-tight">{value}</h3>
        </div>
        {icon && (
          <div className="p-3 bg-white/80 rounded-xl text-slate-600 border border-slate-100 shadow-sm">
            {icon}
          </div>
        )}
      </div>

      <div className="flex items-center mt-4">
        {trend === "up" && (
          <span className="flex items-center text-[10px] font-bold uppercase text-emerald-700 bg-emerald-50 border border-emerald-100/80 px-2 py-0.5 rounded-full">
            <ArrowUpRight className="w-3 h-3 mr-0.5" />
            {trendValue}
          </span>
        )}
        {trend === "down" && (
          <span className="flex items-center text-[10px] font-bold uppercase text-rose-700 bg-rose-50 border border-rose-100/80 px-2 py-0.5 rounded-full">
            <ArrowDownRight className="w-3 h-3 mr-0.5" />
            {trendValue}
          </span>
        )}
        {trend === "neutral" && (
          <span className="flex items-center text-[10px] font-bold uppercase text-slate-600 bg-slate-50 border border-slate-150 px-2 py-0.5 rounded-full">
            <Minus className="w-3 h-3 mr-0.5" />
            {trendValue}
          </span>
        )}
        <span className="text-xs text-slate-400 ml-2 font-medium">{description}</span>
      </div>
    </div>
  );
}
