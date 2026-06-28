import React, { useMemo, useState } from "react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine
} from "recharts";
import { CleanMovie } from "../types";
import { calculateCorrelation } from "../utils/data_science";

interface EdaDashboardProps {
  movies: CleanMovie[];
}

export default function EdaDashboard({ movies }: EdaDashboardProps) {
  const [selectedHeatmapCell, setSelectedHeatmapCell] = useState<{
    f1: string;
    f2: string;
    val: number;
  } | null>(null);

  // 1. Decadal rating trends
  const lineChartData = useMemo(() => {
    const groups: { [key: number]: { count: number; sum: number } } = {};
    for (const m of movies) {
      const decade = Math.floor(m.year / 10) * 10;
      if (!groups[decade]) {
        groups[decade] = { count: 0, sum: 0 };
      }
      groups[decade].count++;
      groups[decade].sum += m.rating;
    }

    return Object.keys(groups)
      .map(k => {
        const d = parseInt(k);
        return {
          decade: `${d}s`,
          avgRating: Number((groups[d].sum / groups[d].count).toFixed(2)),
          movieCount: groups[d].count
        };
      })
      .sort((a, b) => a.decade.localeCompare(b.decade));
  }, [movies]);

  // 2. Movie Genre Volume
  const genreChartData = useMemo(() => {
    const counts: { [key: string]: number } = {};
    const sumRatings: { [key: string]: number } = {};
    
    for (const m of movies) {
      for (const g of m.genres) {
        counts[g] = (counts[g] || 0) + 1;
        sumRatings[g] = (sumRatings[g] || 0) + m.rating;
      }
    }

    return Object.keys(counts)
      .map(g => ({
        genre: g,
        count: counts[g],
        avgRating: Number((sumRatings[g] / counts[g]).toFixed(2))
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 8); // Top 8
  }, [movies]);

  // 3. Duration Group vs Rating
  const durationChartData = useMemo(() => {
    const intervals = [
      { label: "< 90m", min: 0, max: 90, sum: 0, count: 0 },
      { label: "90m - 120m", min: 90, max: 120, sum: 0, count: 0 },
      { label: "120m - 150m", min: 120, max: 150, sum: 0, count: 0 },
      { label: "150m - 180m", min: 150, max: 180, sum: 0, count: 0 },
      { label: "> 180m", min: 180, max: 1000, sum: 0, count: 0 }
    ];

    for (const m of movies) {
      for (const int of intervals) {
        if (m.duration > int.min && m.duration <= int.max) {
          int.sum += m.rating;
          int.count++;
          break;
        }
      }
    }

    return intervals
      .filter(int => int.count > 0)
      .map(int => ({
        range: int.label,
        avgRating: Number((int.sum / int.count).toFixed(2)),
        count: int.count
      }));
  }, [movies]);

  // 4. Mathematical Pearson Correlation Index
  const correlationMatrix = useMemo(() => {
    const variables = ["Year", "Duration", "Log10(Votes)", "Rating"];
    
    const yearArr = movies.map(m => m.year);
    const durationArr = movies.map(m => m.duration);
    const votesLogArr = movies.map(m => Math.log10(m.votes));
    const ratingArr = movies.map(m => m.rating);

    const vectors: { [key: string]: number[] } = {
      "Year": yearArr,
      "Duration": durationArr,
      "Log10(Votes)": votesLogArr,
      "Rating": ratingArr
    };

    const res: { f1: string; f2: string; val: number }[] = [];
    for (const f1 of variables) {
      for (const f2 of variables) {
        const val = calculateCorrelation(vectors[f1], vectors[f2]);
        res.push({ f1, f2, val: Number(val.toFixed(2)) });
      }
    }

    return { variables, data: res };
  }, [movies]);

  return (
    <div className="space-y-8">
      {/* Decaded Trend and Genre Frequencies row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Décades rating trends */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
          <div className="mb-4">
            <h4 className="text-lg font-bold text-slate-900">Decadal Rating Trends (1950s - 2020s)</h4>
            <p className="text-sm text-slate-500">Average IMDB rating per decade reveals historical film standards.</p>
          </div>
          <div className="h-80 w-100">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={lineChartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="decade" stroke="#94a3b8" fontSize={12} tickLine={false} />
                <YAxis domain={[4, 9]} stroke="#94a3b8" fontSize={12} tickLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: "#0f172a", borderRadius: "10px", border: "none", color: "#fff" }}
                  labelStyle={{ fontWeight: "bold" }}
                />
                <ReferenceLine y={6.2} label={{ value: "Global Median (6.2)", fill: "#94a3b8", pos: "top", fontSize: 10 }} stroke="#cbd5e1" strokeDasharray="5 5" />
                <Line type="monotone" dataKey="avgRating" name="Avg Rating" stroke="#4f46e5" strokeWidth={3} activeDot={{ r: 8 }} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Genre Volume */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
          <div className="mb-4">
            <h4 className="text-lg font-bold text-slate-900">Distribution of Top Film Genres</h4>
            <p className="text-sm text-slate-500">Comparing movie counts and their average rating (hover to details).</p>
          </div>
          <div className="h-80 w-100">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={genreChartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="genre" stroke="#94a3b8" fontSize={12} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: "#0f172a", borderRadius: "10px", border: "none", color: "#fff" }}
                  formatter={(value: any, name: string) => [
                    value, 
                    name === "count" ? "Movie Count" : "Avg Rating"
                  ]}
                />
                <Bar dataKey="count" name="Movies Count" fill="#818cf8" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Durational correlation and Pearson Heatmap row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Movie duration vs Rating */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
          <div className="mb-4">
            <h4 className="text-lg font-bold text-slate-900">Duration Range vs. Average Rating</h4>
            <p className="text-sm text-gray-500">Checking if significantly longer or shorter runtimes correlate with higher user scores.</p>
          </div>
          <div className="h-80 w-100">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={durationChartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="range" stroke="#94a3b8" fontSize={12} tickLine={false} />
                <YAxis domain={[0, 10]} stroke="#94a3b8" fontSize={12} tickLine={false} />
                <Tooltip 
                  formatter={(value: any, name: string) => [
                    value, 
                    name === "avgRating" ? "Avg Rating" : "Count in Range"
                  ]}
                />
                <Bar dataKey="avgRating" name="Average Rating" fill="#ec4899" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Dynamic Correlations Heatmap Grid */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between">
          <div>
            <div className="mb-4">
              <h4 className="text-lg font-bold text-slate-900">Pearson Correlation Heatmap Matrix</h4>
              <p className="text-sm text-slate-500">Analyzing linear dependencies between Year, Duration (-), Votes representing popularity (+), and Rating.</p>
            </div>

            {/* Heatmap Grid Drawing */}
            <div className="grid grid-cols-5 gap-1.5 max-w-sm mx-auto mb-6">
              {/* Top row with labels */}
              <div className="h-10"></div>
              {correlationMatrix.variables.map(v => (
                <div key={v} className="h-10 flex items-center justify-center text-[10px] font-semibold text-slate-500 text-center uppercase tracking-wider truncate px-1">
                  {v.split("(")[0]}
                </div>
              ))}

              {/* Rows */}
              {correlationMatrix.variables.map(rowVar => (
                <React.Fragment key={rowVar}>
                  {/* Left Label */}
                  <div className="h-16 flex items-center justify-end text-[10px] font-semibold text-slate-500 text-right pr-2 uppercase tracking-wider truncate">
                    {rowVar.split("(")[0]}
                  </div>
                  
                  {/* Heatmap Columns */}
                  {correlationMatrix.variables.map(colVar => {
                    const cell = correlationMatrix.data.find(
                      d => d.f1 === rowVar && d.f2 === colVar
                    );
                    const val = cell ? cell.val : 0;
                    
                    // Determine background intensity based on correlation val
                    let colorClass = "bg-slate-100 text-slate-500";
                    if (val === 1.0) {
                      colorClass = "bg-indigo-600 text-white font-bold";
                    } else if (val > 0.3) {
                      colorClass = "bg-indigo-200 text-indigo-900";
                    } else if (val > 0.1) {
                      colorClass = "bg-indigo-50 text-indigo-800";
                    } else if (val < -0.3) {
                      colorClass = "bg-rose-200 text-rose-900";
                    } else if (val < -0.1) {
                      colorClass = "bg-rose-50 text-rose-800";
                    } else {
                      colorClass = "bg-slate-50 text-slate-600";
                    }

                    return (
                      <button
                        key={`${rowVar}-${colVar}`}
                        onClick={() => setSelectedHeatmapCell(cell || null)}
                        className={`h-16 rounded-xl flex flex-col items-center justify-center text-xs transition-transform duration-200 hover:scale-105 shadow-sm active:scale-95 ${colorClass}`}
                      >
                        <span className="font-bold text-[14px]">{(val > 0 ? "+" : "") + val}</span>
                      </button>
                    );
                  })}
                </React.Fragment>
              ))}
            </div>
          </div>

          <div className="bg-slate-50 p-4 rounded-xl text-xs text-slate-600 border border-slate-100">
            {selectedHeatmapCell ? (
              <p>
                Correlation between <strong className="text-slate-800">{selectedHeatmapCell.f1}</strong> and{" "}
                <strong className="text-slate-800">{selectedHeatmapCell.f2}</strong> is{" "}
                <strong className="text-indigo-600 text-[14px]">{selectedHeatmapCell.val}</strong>.{" "}
                {selectedHeatmapCell.val === 1.0
                  ? "Indicates perfect self-correlation."
                  : selectedHeatmapCell.val > 0.3
                  ? "Indicates a positive linear correlation. Increasing one aligns directly with increases in the other."
                  : selectedHeatmapCell.val < -0.1
                  ? "Indicates a weak negative trend."
                  : "Indicates little to no statistical linear relationship."}
              </p>
            ) : (
              <p className="text-center italic">Click on any matrix block to read the statistical interpretation.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
