import { useState, useEffect } from "react";
import {
  Film,
  TrendingUp,
  Cpu,
  Download,
  FolderHeart,
  MessageSquare,
  BookOpen,
  Volume2,
  Calendar,
  Sparkles,
  Award
} from "lucide-react";
import MetricCard from "./components/MetricCard";
import EdaDashboard from "./components/EdaDashboard";
import PredictorForm from "./components/PredictorForm";
import ModelExplorer from "./components/ModelExplorer";
import SubmissionFiles from "./components/SubmissionFiles";
import { runFullPipeline } from "./utils/data_science";
import { RAW_MOVIES } from "./data/movies_data";

export default function App() {
  const [activeTab, setActiveTab] = useState<"predict" | "eda" | "models" | "submission">("predict");
  const [showStoryDrawer, setShowShowStoryDrawer] = useState(false);
  const [pipelineState, setPipelineState] = useState<ReturnType<typeof runFullPipeline> | null>(null);

  useEffect(() => {
    // Run initial data pipeline
    const res = runFullPipeline();
    setPipelineState(res);
  }, []);

  if (!pipelineState) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50 text-indigo-600">
        <div className="flex flex-col items-center gap-3">
          <svg className="animate-spin h-8 w-8" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <span className="font-bold text-sm tracking-widest uppercase">Initializing DS Studio...</span>
        </div>
      </div>
    );
  }

  const { diagnostics, cleanedCount, metrics } = pipelineState;

  return (
    <div className="flex h-screen w-full overflow-hidden bg-slate-50 text-slate-800 font-sans selection:bg-indigo-500 selection:text-white">
      
      {/* Sidebar Navigation Panel matching the theme aesthetic */}
      <aside className="w-64 sidebar-gradient text-slate-300 p-6 flex flex-col shrink-0 overflow-y-auto">
        <div className="mb-8 text-white font-bold text-xl tracking-tight flex items-center gap-2.5">
          <div className="w-8.5 h-8.5 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/30">
            <Film className="w-5 h-5 text-white animate-pulse" />
          </div>
          <div className="flex flex-col">
            <span className="leading-tight text-white font-extrabold tracking-wide">DataScience</span>
            <span className="text-[9px] text-indigo-400 font-extrabold uppercase tracking-widest leading-none">Movie Studio</span>
          </div>
        </div>

        <nav className="space-y-6 flex-1 text-xs font-semibold">
          <div className="space-y-2">
            <p className="uppercase text-[9px] tracking-widest text-slate-500 font-black">Internship Track</p>
            
            <button
               id="tab-predict"
               onClick={() => setActiveTab("predict")}
               className={`w-full flex items-center gap-2.5 p-2.5 rounded-xl transition duration-150 text-left ${
                 activeTab === "predict"
                   ? "text-white bg-white/10 border border-white/5 shadow-inner font-bold"
                   : "text-slate-400 hover:text-white hover:bg-white/5"
               }`}
            >
              <Film className={`w-4 h-4 ${activeTab === "predict" ? "text-indigo-400" : "text-slate-400"}`} />
              <span>Movie Predictor</span>
            </button>

            <button
               id="tab-eda"
               onClick={() => setActiveTab("eda")}
               className={`w-full flex items-center gap-2.5 p-2.5 rounded-xl transition duration-150 text-left ${
                 activeTab === "eda"
                   ? "text-white bg-white/10 border border-white/5 shadow-inner font-bold"
                   : "text-slate-400 hover:text-white hover:bg-white/5"
               }`}
            >
              <TrendingUp className={`w-4 h-4 ${activeTab === "eda" ? "text-indigo-400" : "text-slate-400"}`} />
              <span>Exploratory (EDA)</span>
            </button>

            <button
               id="tab-models"
               onClick={() => setActiveTab("models")}
               className={`w-full flex items-center gap-2.5 p-2.5 rounded-xl transition duration-150 text-left ${
                 activeTab === "models"
                   ? "text-white bg-white/10 border border-white/5 shadow-inner font-bold"
                   : "text-slate-400 hover:text-white hover:bg-white/5"
               }`}
            >
              <Cpu className={`w-4 h-4 ${activeTab === "models" ? "text-indigo-400" : "text-slate-400"}`} />
              <span>ML Training Lab</span>
            </button>
          </div>

          <div className="space-y-2">
            <p className="uppercase text-[9px] tracking-widest text-slate-500 font-black">Files & Source</p>
            
            <button
               id="tab-submission"
               onClick={() => setActiveTab("submission")}
               className={`w-full flex items-center gap-2.5 p-2.5 rounded-xl transition duration-150 text-left ${
                 activeTab === "submission"
                   ? "text-white bg-white/10 border border-white/5 shadow-inner font-bold"
                   : "text-slate-400 hover:text-white hover:bg-white/5"
               }`}
            >
              <Download className={`w-4 h-4 ${activeTab === "submission" ? "text-indigo-400" : "text-slate-400"}`} />
              <span>GitHub Artifacts</span>
            </button>

            <div className="pt-2 pl-3 space-y-2.5 border-l border-slate-800">
              <div className="flex items-center gap-2 text-[10px] text-slate-500 font-bold tracking-tight">
                <span className="text-amber-500 text-xs">📄</span> notebook.ipynb
              </div>
              <div className="flex items-center gap-2 text-[10px] text-slate-500 font-bold tracking-tight">
                <span className="text-emerald-500 text-xs">📁</span> src/app.py
              </div>
              <div className="flex items-center gap-2 text-[10px] text-slate-500 font-bold tracking-tight">
                <span className="text-indigo-400 text-xs">📄</span> requirements.txt
              </div>
              <div className="flex items-center gap-2 text-[10px] text-slate-500 font-bold tracking-tight">
                <span className="text-sky-400 text-xs">📄</span> README.md
              </div>
            </div>
          </div>
        </nav>

        <div className="mt-auto pt-6 border-t border-slate-800/80 flex flex-col gap-3">
          <button
            onClick={() => setShowShowStoryDrawer(true)}
            className="relative group w-full p-2.5 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 hover:text-indigo-300 rounded-xl transition duration-150 border border-indigo-500/25 flex items-center justify-center gap-2 text-[11px] font-bold"
          >
            <MessageSquare className="w-4 h-4" />
            <span>Family Reflections</span>
            <span className="absolute top-2 right-2 w-1.5 h-1.5 bg-rose-500 rounded-full animate-ping"></span>
            <span className="absolute top-2 right-2 w-1.5 h-1.5 bg-rose-500 rounded-full"></span>
          </button>

          <div className="p-3 bg-indigo-600/10 rounded-xl border border-indigo-500/20 text-center">
            <p className="text-[9px] text-indigo-400 font-black uppercase tracking-widest leading-none">Task 01: Prediction</p>
            <p className="text-[10px] text-slate-400 font-medium mt-1">CodSoft submission</p>
          </div>
        </div>
      </aside>

      {/* Main Workspace Frame container */}
      <main className="flex-1 flex flex-col p-6 md:p-8 gap-6 overflow-y-auto bg-slate-50/50">
        
        {/* Sleek Page Header bar */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-end pb-3 border-b border-rose-100/5 col-span-12 shrink-0 gap-4">
          <div>
            <span className="text-[9px] bg-indigo-50 text-indigo-700 font-black px-2 py-0.5 rounded-full border border-indigo-100 uppercase tracking-widest">
              {activeTab === "predict" && "Interactive Predictor Instance"}
              {activeTab === "eda" && "Dataset Exploratory Analytics"}
              {activeTab === "models" && "Comparison Benchmarks Dashboard"}
              {activeTab === "submission" && "Codsoft submission package"}
            </span>
            <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
              {activeTab === "predict" && "IMDb Live Movie Estimator"}
              {activeTab === "eda" && "Exploratory Density Analytics"}
              {activeTab === "models" && "Model Learning Comparative Lab"}
              {activeTab === "submission" && "Exportable Repository Artifacts"}
            </h1>
            <p className="text-[11px] text-slate-400 font-semibold mt-0.5">
              CodSoft Data Science Internship Case Study
            </p>
          </div>

          <div className="flex gap-4 items-center shrink-0">
            <div className="text-right">
              <p className="text-[10px] text-slate-450 uppercase font-black tracking-widest">Optimal Architecture</p>
              <p className="text-sm font-bold text-emerald-600 flex items-center justify-end gap-1">
                <span>Random Forest</span>
                <span className="font-mono bg-emerald-50 border border-emerald-100/80 text-[10px] px-1.5 py-0.2 rounded-full font-bold">R² {metrics.randomForest.r2}</span>
              </p>
            </div>
            <div className="w-9 h-9 rounded-xl bg-indigo-100/30 border border-indigo-200/50 flex items-center justify-center font-extrabold text-indigo-700 text-xs">
              M
            </div>
          </div>
        </header>

        {/* Statistics cards grid row using Glass background theme */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
          <MetricCard
            title="Cleaned Records"
            value={cleanedCount}
            description={`Filtered from ${diagnostics.originalCount}`}
            icon={<FolderHeart className="w-5 h-5 text-indigo-600" />}
            trend="up"
            trendValue="100%"
          />
          <MetricCard
            title="Validation Partition"
            value="20% Split"
            description={`Tested on ${diagnostics.testSize} records`}
            icon={<Award className="w-5 h-5 text-indigo-600" />}
            trend="up"
            trendValue="Optimal"
          />
          <MetricCard
            title="Imputed Cells"
            value={diagnostics.imputedYearCount + diagnostics.imputedDurationCount + diagnostics.imputedVotesCount}
            description="Mean / median frequency maps"
            icon={<Calendar className="w-5 h-5 text-indigo-600" />}
            trend="neutral"
            trendValue="Imputed"
          />
          <MetricCard
            title="Feature Space"
            value="11 Dimensions"
            description="Log votes scaling, genre-encoded"
            icon={<Sparkles className="w-5 h-5 text-indigo-600" />}
            trend="neutral"
            trendValue="Optimized"
          />
        </div>

        {/* Dynamic Inner Panel Body */}
        <div className="grow transition-all duration-300">
          {activeTab === "predict" && <PredictorForm />}
          {activeTab === "eda" && <EdaDashboard movies={RAW_MOVIES.filter(m => m.year !== null && m.rating !== null && m.votes !== null).map(m => m as any)} />}
          {activeTab === "models" && <ModelExplorer />}
          {activeTab === "submission" && <SubmissionFiles />}
        </div>
      </main>

      {/* Story Sliding Drawer / Reflections Sidebar */}
      {showStoryDrawer && (
        <div className="fixed inset-0 z-50 overflow-hidden" aria-labelledby="slide-over-title" role="dialog" aria-modal="true">
          <div className="absolute inset-0 overflow-hidden">
            {/* Overlay backdrop */}
            <div 
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity duration-300"
              onClick={() => setShowShowStoryDrawer(false)}
            ></div>

            <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10">
              <div className="pointer-events-auto w-screen max-w-md transform bg-slate-900 text-slate-100 border-l border-slate-800 shadow-2xl transition duration-300 ease-in-out">
                <div className="flex h-full flex-col overflow-y-scroll py-6 pl-6 pr-4">
                  
                  {/* Drawer Header */}
                  <div className="flex items-center justify-between pb-4 border-b border-slate-800 shrink-0">
                    <div>
                      <h2 className="text-md font-bold tracking-tight text-white flex items-center gap-2">
                        <MessageSquare className="w-5 h-5 text-indigo-400" />
                        <span>Family Reflections Log</span>
                      </h2>
                      <p className="text-[10px] text-indigo-400 uppercase font-black mt-0.5 tracking-widest">June 17, 2026 - Prince&apos;s Pavilion</p>
                    </div>
                    <button
                      onClick={() => setShowShowStoryDrawer(false)}
                      className="rounded-md text-slate-400 hover:text-white focus:outline-none p-1.5 hover:bg-slate-800 transition"
                    >
                      ✕
                    </button>
                  </div>

                  {/* Narrative content block */}
                  <div className="relative mt-6 flex-1 space-y-6 text-xs md:text-sm text-slate-350 leading-relaxed pr-2">
                    
                    {/* Scene context */}
                    <div className="p-4 bg-slate-850/80 rounded-xl border border-slate-800 text-[11px] text-slate-400 mb-6 italic leading-relaxed">
                      Felipe, Letizia, Leonor, and Sofía are gathered in the living quarters of the Prince&apos;s Pavilion in Kyoto. The evening air is cool. Soft classical keys float from Leonor&apos;s Spotify playlist in the background. They are gathered around a prototype of the movie recommender model...
                    </div>

                    {/* Conversation thread */}
                    <div className="space-y-4">
                      
                      {/* Sofía message */}
                      <div className="flex gap-3">
                        <div className="w-8 h-8 rounded-full bg-pink-500/25 text-pink-400 font-extrabold flex items-center justify-center shrink-0 border border-pink-500/10 text-xs">S</div>
                        <div className="bg-slate-850 p-3.5 rounded-2xl rounded-tl-none border border-slate-800">
                          <p className="font-bold text-pink-400 text-xs mb-1">Sofía (24)</p>
                          <p className="text-slate-300">
                            Look at this! The Random Forest metrics actually show an R² of 0.55 on the test split. That&apos;s significantly higher than those simple Linear Regressor equations. Let me text this snapshot to our group on iMessage!
                          </p>
                        </div>
                      </div>

                      {/* Letizia message */}
                      <div className="flex gap-3">
                        <div className="w-8 h-8 rounded-full bg-emerald-500/25 text-emerald-400 font-extrabold flex items-center justify-center shrink-0 border border-emerald-500/10 text-xs">L</div>
                        <div className="bg-slate-850 p-3.5 rounded-2xl rounded-tl-none border border-slate-800">
                          <p className="font-bold text-emerald-400 text-xs mb-1">Queen Letizia (53)</p>
                          <p className="text-slate-300">
                            The log transform of variables was a highly sensible choice, Sofía. Real-world votes follow such a stark right-skewed distribution. Imputing with the dataset median ensures we don&apos;t skew the Pearson correlations. It is delightfully robust.
                          </p>
                        </div>
                      </div>

                      {/* King Felipe message */}
                      <div className="flex gap-3">
                        <div className="w-8 h-8 rounded-full bg-blue-500/25 text-blue-400 font-extrabold flex items-center justify-center shrink-0 border border-blue-500/10 text-xs">F</div>
                        <div className="bg-slate-850 p-3.5 rounded-2xl rounded-tl-none border border-slate-800">
                          <p className="font-bold text-blue-400 text-xs mb-1">King Felipe (58)</p>
                          <p className="text-slate-300">
                            Indeed. This is much like managing tactics. Over-splitting our parameters—much like over-planning a football format—leads to high variance and unstable predictions. The ensemble forest model behaves like an authoritative group decision.
                          </p>
                        </div>
                      </div>

                      {/* Sofía teasing */}
                      <div className="flex gap-3">
                        <div className="w-8 h-8 rounded-full bg-pink-500/25 text-pink-400 font-extrabold flex items-center justify-center shrink-0 border border-pink-500/10 text-xs">S</div>
                        <div className="bg-slate-850 p-3.5 rounded-2xl rounded-tl-none border border-slate-800">
                          <p className="font-bold text-pink-400 text-xs mb-1">Sofía (24)</p>
                          <p className="text-slate-300">
                            By the way, Leonor... speaking of high-rating blockbusters, I noticed you spent almost an hour studying the entries with <strong className="text-indigo-400 font-bold">Jalen Espinas</strong> in the cast lists. He&apos;s the 25-year-old lead actor who represents the typical romantic blockbuster archetype. Your cheeks are going crimson!
                          </p>
                        </div>
                      </div>

                      {/* Leonor blush */}
                      <div className="flex gap-3">
                        <div className="w-8 h-8 rounded-full bg-indigo-500/25 text-indigo-400 font-extrabold flex items-center justify-center shrink-0 border border-indigo-500/10 text-xs">L</div>
                        <div className="bg-slate-850 p-3.5 rounded-2xl rounded-tl-none border border-slate-800">
                          <p className="font-bold text-indigo-400 text-xs mb-1">Leonor (25)</p>
                          <p className="text-slate-300">
                            Nonsense, Sofía! I was examining his records because his movies have a highly robust votes representation on IMDB. His profile is fascinating—he took on headliner roles at exactly my age, managing enormous public visibility. In a way, I felt a deep, strange connection to his journey... but it&apos;s strictly for the math!
                          </p>
                        </div>
                      </div>

                      {/* Letizia soft support */}
                      <div className="flex gap-3">
                        <div className="w-8 h-8 rounded-full bg-emerald-500/25 text-emerald-400 font-extrabold flex items-center justify-center shrink-0 border border-emerald-500/10 text-xs">L</div>
                        <div className="bg-slate-850 p-3.5 rounded-2xl rounded-tl-none border border-slate-800">
                          <p className="font-bold text-emerald-400 text-xs mb-1">Queen Letizia (53)</p>
                          <p className="text-slate-300">
                            It is perfectly natural to search for corresponding narratives in others, darling. True leadership, whether under the lens of the film industry or the weights of a crown, requires immense courage and a quiet, deliberate composure. Let&apos;s look at his predicted rating again.
                          </p>
                        </div>
                      </div>

                    </div>

                    {/* Spotify Music segment mimicry */}
                    <div className="pt-6 border-t border-slate-800 flex items-center justify-between mt-8 text-[11px] text-slate-400 shrink-0">
                      <div className="flex items-center gap-2">
                        <Volume2 className="w-4 h-4 text-emerald-500 animate-pulse" />
                        <span>Playing: Chopin - Nocturne in E-flat Major</span>
                      </div>
                      <span className="text-[10px] text-slate-500 uppercase tracking-widest font-black">Spotify</span>
                    </div>

                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
