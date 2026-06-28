import React, { useState } from "react";
import { Play, Sparkles, AlertCircle, HelpCircle, Film, CheckCircle2 } from "lucide-react";
import { PredictionInput } from "../types";
import { predictMovie, TOP_GENRES } from "../utils/data_science";

export default function PredictorForm() {
  const [formData, setFormData] = useState<PredictionInput>({
    genres: ["Drama"],
    year: 2021,
    duration: 120,
    votes: 1500
  });

  const [results, setResults] = useState<ReturnType<typeof predictMovie> | null>(null);
  const [isPredicting, setIsPredicting] = useState(false);

  const handlePredict = (e: React.FormEvent) => {
    e.preventDefault();
    setIsPredicting(true);
    
    // Slight artificial delay to match standard inference aesthetic
    setTimeout(() => {
      const predResults = predictMovie(formData);
      setResults(predResults);
      setIsPredicting(false);
    }, 450);
  };

  const handleGenreToggle = (genre: string) => {
    setFormData(prev => {
      let nextGenres = [...prev.genres];
      if (nextGenres.includes(genre)) {
        if (nextGenres.length > 1) {
          nextGenres = nextGenres.filter(g => g !== genre);
        }
      } else {
        nextGenres.push(genre);
      }
      return { ...prev, genres: nextGenres };
    });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      {/* Parameters Input section */}
      <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
        <div className="flex items-center gap-2 mb-6">
          <Sparkles className="w-5 h-5 text-indigo-600" />
          <h4 className="text-lg font-bold text-slate-900">Inference Parameters</h4>
        </div>

        <form onSubmit={handlePredict} className="space-y-6">
          {/* Genre selector checkboxes */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2.5">
              Select Movie Genres (Select up to 3)
            </label>
            <div className="grid grid-cols-2 gap-2">
              {TOP_GENRES.map(g => {
                const selected = formData.genres.includes(g);
                return (
                  <button
                    key={g}
                    type="button"
                    onClick={() => handleGenreToggle(g)}
                    className={`py-2 px-3 text-xs md:text-sm text-left rounded-xl transition-all duration-200 border flex items-center justify-between ${
                      selected
                        ? "bg-indigo-50 border-indigo-200 text-indigo-700 font-semibold"
                        : "bg-slate-50 border-slate-100 hover:border-slate-300 text-slate-600"
                    }`}
                  >
                    <span>{g}</span>
                    {selected && <CheckCircle2 className="w-4 h-4 text-indigo-600" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Release Year */}
          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label htmlFor="year-input" className="text-md font-semibold text-slate-700">Release Year</label>
              <span className="text-sm font-bold text-indigo-600 bg-indigo-50 px-2.5 py-0.5 rounded-full">{formData.year}</span>
            </div>
            <input
              id="year-input"
              type="range"
              min="1940"
              max="2022"
              value={formData.year}
              onChange={(e) => setFormData(prev => ({ ...prev, year: parseInt(e.target.value) }))}
              className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-indigo-600"
            />
            <div className="flex justify-between text-[11px] text-slate-400 mt-1 font-medium">
              <span>1940 (Golden Era)</span>
              <span>2022 (Modern Era)</span>
            </div>
          </div>

          {/* Runtime Duration */}
          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label htmlFor="duration-input" className="text-md font-semibold text-slate-700">Duration (Minutes)</label>
              <span className="text-sm font-bold text-pink-600 bg-pink-50 px-2.5 py-0.5 rounded-full">{formData.duration} min</span>
            </div>
            <input
              id="duration-input"
              type="range"
              min="60"
              max="240"
              value={formData.duration}
              onChange={(e) => setFormData(prev => ({ ...prev, duration: parseInt(e.target.value) }))}
              className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-pink-600"
            />
            <div className="flex justify-between text-[11px] text-slate-400 mt-1 font-medium">
              <span>60 min (Short Film)</span>
              <span>240 min (Epic length)</span>
            </div>
          </div>

          {/* Votes expected */}
          <div>
            <label htmlFor="votes-input" className="block text-md font-semibold text-slate-700 mb-1.5">
              Expected Vote Count (IMDB Popularity Link)
            </label>
            <div className="relative">
              <input
                id="votes-input"
                type="number"
                min="1"
                max="1000000"
                value={formData.votes}
                onChange={(e) => setFormData(prev => ({ ...prev, votes: parseInt(e.target.value) || 1 }))}
                className="w-full py-2.5 px-4 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
              />
            </div>
            <p className="text-[11px] text-slate-400 mt-1.5 font-medium leading-normal">
              Note: Higher vote count historically correlates with more robust predictions and higher model scoring weights.
            </p>
          </div>

          <button
            type="submit"
            disabled={isPredicting}
            className={`w-full py-3.5 px-5 text-white bg-indigo-600 hover:bg-indigo-700 font-bold rounded-xl flex items-center justify-center gap-2 border border-transparent shadow-sm hover:shadow transition-all duration-200 active:scale-95 ${
              isPredicting ? "opacity-75 cursor-not-allowed" : ""
            }`}
          >
            {isPredicting ? (
              <>
                <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                <span>Evaluating Regressor Forests...</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-current" />
                <span>Evaluate Movie Spec Sheet</span>
              </>
            )}
          </button>
        </form>
      </div>

      {/* Predicted Score outcome */}
      <div className="lg:col-span-7 space-y-6">
        {results ? (
          <div className="space-y-6">
            
            {/* Primary Rating & Confidence Panel */}
            <div className="bg-slate-900 border border-slate-800 p-8 rounded-2xl text-white shadow-xl relative overflow-hidden">
              {/* Absctract ambient design background elements */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-600 opacity-20 blur-[130px] rounded-full -mr-20 -mt-20"></div>
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-pink-600 opacity-15 blur-[100px] rounded-full -ml-16 -mb-16"></div>

              <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                  <div className="flex items-center gap-2 px-2.5 py-1 bg-indigo-500/20 text-indigo-300 w-fit rounded-full text-xs font-semibold uppercase tracking-wider mb-3">
                    <Film className="w-3.5 h-3.5" />
                    <span>Best Ensemble Prediction</span>
                  </div>
                  <h4 className="text-3xl font-extrabold tracking-tight">Movie Rating Verdict</h4>
                  <p className="text-sm text-slate-400 mt-1 max-w-sm">Predicted using the trained Random Forest ensemble bagging estimator.</p>
                </div>

                <div className="flex items-center gap-4 bg-slate-850/80 p-5 rounded-2xl border border-slate-800/80 backdrop-blur-sm self-start md:self-auto">
                  <div className="text-center">
                    <span className="block text-4xl font-extrabold text-indigo-400 tracking-tight">{results.rating}</span>
                    <span className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">Predicted (1-10)</span>
                  </div>
                  <div className="w-px h-10 bg-slate-800"></div>
                  <div className="text-center">
                    <span className={`block text-md font-bold px-2 py-0.5 rounded-full text-xs uppercase tracking-wider ${
                      results.confidence === "High"
                        ? "bg-emerald-500/20 text-emerald-400"
                        : results.confidence === "Medium"
                        ? "bg-amber-500/20 text-amber-400"
                        : "bg-rose-500/20 text-rose-400"
                    }`}>
                      {results.confidence}
                    </span>
                    <span className="text-[10px] text-slate-400 uppercase tracking-widest font-bold block mt-1">Confidence</span>
                  </div>
                </div>
              </div>

              {/* Intuitive recommendation text */}
              <div className="mt-8 pt-6 border-t border-slate-800 relative z-10 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
                <div className="text-xs text-slate-300 leading-normal">
                  <span className="font-semibold text-white block mb-0.5">Model Interpretation Note:</span>
                  {results.rating >= 7.5 ? (
                    <span>This profile mimics high-ranking critical darlings. The combination of genres, released year, and moderate expectations makes it heavily favored for a high IMDB rating (Success Class: <strong>Blockbuster Prospects</strong>).</span>
                  ) : results.rating >= 6.0 ? (
                    <span>Estimations identify this as safe, stable content. Most typical viewers will find it average or pleasantly digestible (Success Class: <strong>Commercial Entertainer</strong>).</span>
                  ) : (
                    <span>The regressor forest points to substantial audience resistance or highly niche appeal, typical of right-skewed entries with sparse general marketing (Success Class: <strong>Niche / Indecisive Returns</strong>).</span>
                  )}
                </div>
              </div>
            </div>

            {/* Model Comparison sub-panel */}
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
              <h5 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider mb-4">Predictions by Regressor Algorithm</h5>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                
                {/* Linear regression */}
                <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl text-center">
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Linear Regression</p>
                  <span className="block text-2xl font-black text-slate-900 mt-2">{results.lrRating}</span>
                  <div className="text-[10px] text-slate-400 font-semibold mt-1">Evaluates global coefficients</div>
                </div>

                {/* Decision tree */}
                <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl text-center">
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Decision Tree</p>
                  <span className="block text-2xl font-black text-slate-900 mt-2">{results.dtRating}</span>
                  <div className="text-[10px] text-slate-400 font-semibold mt-1">Hierarchical tree logic splits</div>
                </div>

                {/* Random forest */}
                <div className="p-4 bg-indigo-50/50 border border-indigo-100 rounded-xl text-center">
                  <p className="text-xs font-bold text-indigo-700 uppercase tracking-wider">Random Forest</p>
                  <span className="block text-2xl font-black text-indigo-900 mt-2">{results.rfRating}</span>
                  <div className="text-[10px] text-indigo-600 font-semibold mt-1">Average of bootstrapped estimators</div>
                </div>

              </div>
            </div>

          </div>
        ) : (
          <div className="bg-white p-12 rounded-2xl border border-slate-100 shadow-sm border-dashed border-2 flex flex-col items-center justify-center text-center h-full min-h-[300px]">
            <HelpCircle className="w-12 h-12 text-slate-300 mb-4" />
            <h5 className="text-lg font-bold text-slate-900">Awaiting Spec Sheet Evaluation</h5>
            <p className="text-sm text-slate-500 mt-1 max-w-sm">Provide film attributes on the left panel and click &ldquo;Evaluate Movie Spec Sheet&rdquo; to estimate IMDB ratings instantly across all models.</p>
          </div>
        )}
      </div>
    </div>
  );
}
