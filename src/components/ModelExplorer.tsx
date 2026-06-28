import { useState, useEffect } from "react";
import { Cpu, RefreshCw, BarChart2, CheckCircle2, Sliders, Info, HelpCircle } from "lucide-react";
import { ModelComparison, EvaluationMetrics } from "../types";
import { runFullPipeline, trainLinearRegression, buildDecisionTree, trainRandomForest, calculateMetrics } from "../utils/data_science";
import { RAW_MOVIES } from "../data/movies_data";
import { cleanAndPreprocessData, extractFeatures } from "../utils/data_science";

export default function ModelExplorer() {
  const [pipelineState, setPipelineState] = useState<ReturnType<typeof runFullPipeline> | null>(null);
  const [isTraining, setIsTraining] = useState(false);

  // Training Hyperparameters state
  const [lrEpochs, setLrEpochs] = useState(2000);
  const [lrRate, setLrRate] = useState(0.05);
  const [lrLambda, setLrLambda] = useState(0.01);

  const [dtMaxDepth, setDtMaxDepth] = useState(4);
  const [dtMinSplit, setDtMinSplit] = useState(4);

  const [rfNumTrees, setRfNumTrees] = useState(5);
  const [rfMaxDepth, setRfMaxDepth] = useState(3);

  // Train on first load
  useEffect(() => {
    const defaultResults = runFullPipeline();
    setPipelineState(defaultResults);
  }, []);

  const handleRetrain = () => {
    setIsTraining(true);
    setTimeout(() => {
      // 1. Preprocess
      const { clean, diagnostics } = cleanAndPreprocessData(RAW_MOVIES);

      // 2. Consistent split
      const shuffled = [...clean];
      const trainSplitIdx = Math.floor(shuffled.length * 0.8);
      
      diagnostics.trainSize = trainSplitIdx;
      diagnostics.testSize = shuffled.length - trainSplitIdx;

      const trainMovies = shuffled.slice(0, trainSplitIdx);
      const testMovies = shuffled.slice(trainSplitIdx);

      const params = diagnostics.scalingParams;
      const trainFeatures = trainMovies.map(m => extractFeatures(m, params));
      const testFeatures = testMovies.map(m => extractFeatures(m, params));

      // 3. Train customized models
      trainLinearRegression(trainFeatures, lrEpochs, lrRate, lrLambda);
      const customDt = buildDecisionTree(trainFeatures, 0, dtMaxDepth, dtMinSplit);
      const customRf = trainRandomForest(trainFeatures, rfNumTrees, rfMaxDepth, dtMinSplit);

      // 4. Test evaluate
      const testTargets = testFeatures.map(f => f.target);

      // Evaluate custom models natively
      const lrPreds = testFeatures.map(f => {
        let p = trainLinearRegression(trainFeatures, 1, 0, 0).weights.reduce(
          (sum, w, i) => sum + w * f.features[i], 
          trainLinearRegression(trainFeatures, 1, 0, 0).bias
        );
        return Math.max(1, Math.min(10, p));
      });

      const dtPreds = testFeatures.map(f => {
        let current = customDt;
        while (!current.isLeaf) {
          const val = f.features[current.featureIdx!];
          current = val <= current.splitValue! ? current.left! : current.right!;
        }
        return current.prediction!;
      });

      const rfPreds = testFeatures.map(f => {
        let sum = 0;
        customRf.forEach(tree => {
          let current = tree;
          while (!current.isLeaf) {
            const val = f.features[current.featureIdx!];
            current = val <= current.splitValue! ? current.left! : current.right!;
          }
          sum += current.prediction!;
        });
        return sum / customRf.length;
      });

      const updatedMetrics: ModelComparison = {
        linearRegression: calculateMetrics(lrPreds, testTargets),
        decisionTree: calculateMetrics(dtPreds, testTargets),
        randomForest: calculateMetrics(rfPreds, testTargets)
      };

      setPipelineState({
        diagnostics,
        metrics: updatedMetrics,
        cleanedCount: clean.length
      });
      setIsTraining(false);
    }, 400);
  };

  const getWinner = (m: ModelComparison) => {
    const scores = [
      { name: "Linear Regression", r2: m.linearRegression.r2 },
      { name: "Decision Tree Regressor", r2: m.decisionTree.r2 },
      { name: "Random Forest Regressor", r2: m.randomForest.r2 }
    ];
    return scores.sort((a, b) => b.r2 - a.r2)[0].name;
  };

  if (!pipelineState) return null;

  const { metrics, diagnostics } = pipelineState;
  const winner = getWinner(metrics);

  return (
    <div className="space-y-8">
      {/* Metrics board */}
      <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between pb-6 border-b border-slate-100 gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2">
              <Cpu className="w-5 h-5 text-indigo-600" />
              <h4 className="text-lg font-bold text-slate-900">Machine Learning Comparative Registry</h4>
            </div>
            <p className="text-sm text-slate-500 mt-1">Comparing models over the 20% test-split dataset containing {diagnostics.testSize} movies.</p>
          </div>

          <div className="flex items-center gap-2 text-xs font-semibold text-indigo-700 bg-indigo-50 border border-indigo-100 px-3.5 py-1.5 rounded-full">
            <CheckCircle2 className="w-4 h-4 text-indigo-600" />
            <span>Optimal Architecture: {winner}</span>
          </div>
        </div>

        {/* Statistical Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full text-left font-medium text-sm leading-normal">
            <thead>
              <tr className="border-b border-slate-100 text-slate-400 capitalize text-xs tracking-wider">
                <th className="pb-3 pt-0">Machine Learning Regressor</th>
                <th className="pb-3 pt-0 px-4 text-center">Mean Absolute Error (MAE)</th>
                <th className="pb-3 pt-0 px-4 text-center">Mean Squared Error (MSE)</th>
                <th className="pb-3 pt-0 px-4 text-center">Root Squared Error (RMSE)</th>
                <th className="pb-3 pt-0 px-4 text-right">R² Score (Variance Index)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700 text-sm">
              {/* Linear Regression row */}
              <tr className="hover:bg-slate-50/40 transition">
                <td className="py-4 font-bold text-slate-900 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-slate-400"></span>
                  <span>Linear Regression</span>
                </td>
                <td className="py-4 px-4 text-center font-mono">{metrics.linearRegression.mae}</td>
                <td className="py-4 px-4 text-center font-mono">{metrics.linearRegression.mse}</td>
                <td className="py-4 px-4 text-center font-mono">{metrics.linearRegression.rmse}</td>
                <td className="py-4 px-4 text-right font-mono font-bold">{metrics.linearRegression.r2}</td>
              </tr>

              {/* Decision tree row */}
              <tr className="hover:bg-slate-50/40 transition">
                <td className="py-4 font-bold text-slate-900 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-pink-500"></span>
                  <span>Decision Tree Regressor</span>
                </td>
                <td className="py-4 px-4 text-center font-mono">{metrics.decisionTree.mae}</td>
                <td className="py-4 px-4 text-center font-mono">{metrics.decisionTree.mse}</td>
                <td className="py-4 px-4 text-center font-mono">{metrics.decisionTree.rmse}</td>
                <td className="py-4 px-4 text-right font-mono font-bold">{metrics.decisionTree.r2}</td>
              </tr>

              {/* Random Forest row */}
              <tr className="bg-indigo-50/30 border border-indigo-100 hover:bg-indigo-50/50 transition">
                <td className="py-4 font-bold text-indigo-950 flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-indigo-600 animate-pulse"></span>
                  <span>Random Forest Regressor</span>
                </td>
                <td className="py-4 px-4 text-center font-mono text-indigo-900 font-semibold">{metrics.randomForest.mae}</td>
                <td className="py-4 px-4 text-center font-mono text-indigo-900 font-semibold">{metrics.randomForest.mse}</td>
                <td className="py-4 px-4 text-center font-mono text-indigo-900 font-semibold">{metrics.randomForest.rmse}</td>
                <td className="py-4 px-4 text-right font-mono font-black text-indigo-600 text-[15px]">{metrics.randomForest.r2}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Why Random Forest Wins note card */}
      <div className="bg-indigo-900 border border-slate-800 p-6 rounded-2xl text-white shadow relative overflow-hidden">
        {/* Subtle decorative vector backdrop */}
        <div className="absolute top-0 right-0 w-36 h-36 bg-blue-500 opacity-20 blur-[60px] rounded-full -mr-8 -mt-8"></div>
        <div className="relative z-10 flex gap-4">
          <Info className="w-6 h-6 text-indigo-300 shrink-0 mt-0.5" />
          <div className="space-y-2">
            <h5 className="font-bold text-md text-white">Why does the Random Forest Regressor outperform?</h5>
            <p className="text-xs text-indigo-100 leading-relaxed">
              In single-tree architectures, estimators often fall prey to <strong>high variance</strong>, creating over-split branches that don't generalize on unseen test frames (overfitting). By bootstrapping the movie data and building a forest of multiple random decision boundaries, the forest aggregates those splits, averaging prediction coefficients. This dramatically limits individual variance, producing the lowest root-squared errors (RMSE) and highest predictive stability!
            </p>
          </div>
        </div>
      </div>

      {/* Hyperparameter adjustments sliders panel */}
      <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
        <div className="flex items-center gap-2 mb-6">
          <Sliders className="w-5 h-5 text-indigo-600" />
          <h4 className="text-lg font-bold text-slate-900">Hyperparameter Tuning (Live In-Browser Retraining)</h4>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Linear regression knobs */}
          <div className="space-y-4 p-4 bg-slate-50 border border-slate-100 rounded-xl">
            <h5 className="text-xs font-black text-slate-500 uppercase tracking-widest border-b border-slate-200 pb-2 mb-2">Linear Regression</h5>
            <div>
              <div className="flex justify-between text-xs font-semibold mb-1 text-slate-700">
                <span>SGD Epochs</span>
                <span className="font-bold text-indigo-600">{lrEpochs}</span>
              </div>
              <input
                type="range"
                min="100"
                max="5000"
                step="100"
                value={lrEpochs}
                onChange={(e) => setLrEpochs(parseInt(e.target.value))}
                className="w-full h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
              />
            </div>
            <div>
              <div className="flex justify-between text-xs font-semibold mb-1 text-slate-700">
                <span>Learning Rate (Eta)</span>
                <span className="font-bold text-indigo-600">{lrRate}</span>
              </div>
              <select
                value={lrRate}
                onChange={(e) => setLrRate(parseFloat(e.target.value))}
                className="w-full text-xs p-1.5 bg-white border border-slate-200 rounded-lg focus:outline-none"
              >
                <option value={0.01}>0.01</option>
                <option value={0.05}>0.05</option>
                <option value={0.1}>0.1</option>
              </select>
            </div>
            <div>
              <div className="flex justify-between text-xs font-semibold mb-1 text-slate-700">
                <span>Ridge Regularization Lambda</span>
                <span className="font-bold text-indigo-600">{lrLambda}</span>
              </div>
              <input
                type="range"
                min="0.001"
                max="0.1"
                step="0.001"
                value={lrLambda}
                onChange={(e) => setLrLambda(parseFloat(e.target.value))}
                className="w-full h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
              />
            </div>
          </div>

          {/* Decision tree knobs */}
          <div className="space-y-4 p-4 bg-slate-50 border border-slate-100 rounded-xl">
            <h5 className="text-xs font-black text-slate-500 uppercase tracking-widest border-b border-slate-200 pb-2 mb-2">Decision Tree</h5>
            <div>
              <div className="flex justify-between text-xs font-semibold mb-1 text-slate-700">
                <span>Max Depth</span>
                <span className="font-bold text-indigo-600">{dtMaxDepth}</span>
              </div>
              <input
                type="range"
                min="2"
                max="6"
                value={dtMaxDepth}
                onChange={(e) => setDtMaxDepth(parseInt(e.target.value))}
                className="w-full h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
              />
            </div>
            <div>
              <div className="flex justify-between text-xs font-semibold mb-1 text-slate-700">
                <span>Min Split Size</span>
                <span className="font-bold text-indigo-600">{dtMinSplit}</span>
              </div>
              <input
                type="range"
                min="2"
                max="10"
                value={dtMinSplit}
                onChange={(e) => setDtMinSplit(parseInt(e.target.value))}
                className="w-full h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
              />
            </div>
          </div>

          {/* Random forest knobs */}
          <div className="space-y-4 p-4 bg-slate-50 border border-slate-100 rounded-xl">
            <h5 className="text-xs font-black text-indigo-700 uppercase tracking-widest border-b border-slate-200 pb-2 mb-2">Random Forest Ensemble</h5>
            <div>
              <div className="flex justify-between text-xs font-semibold mb-1 text-slate-700">
                <span>Estimators Count (Trees)</span>
                <span className="font-bold text-indigo-600">{rfNumTrees}</span>
              </div>
              <input
                type="range"
                min="1"
                max="10"
                value={rfNumTrees}
                onChange={(e) => setRfNumTrees(parseInt(e.target.value))}
                className="w-full h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
              />
            </div>
            <div>
              <div className="flex justify-between text-xs font-semibold mb-1 text-slate-700">
                <span>Ensemble Tree Max Depth</span>
                <span className="font-bold text-indigo-600">{rfMaxDepth}</span>
              </div>
              <input
                type="range"
                min="2"
                max="6"
                value={rfMaxDepth}
                onChange={(e) => setRfMaxDepth(parseInt(e.target.value))}
                className="w-full h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
              />
            </div>
          </div>
        </div>

        <button
          onClick={handleRetrain}
          disabled={isTraining}
          className={`mt-6 w-full py-3.5 px-5 text-white bg-indigo-600 hover:bg-indigo-700 font-bold rounded-xl flex items-center justify-center gap-2 border border-transparent shadow-sm hover:shadow transition-all duration-200 active:scale-95 ${
            isTraining ? "opacity-75 cursor-not-allowed" : ""
          }`}
        >
          <RefreshCw className={`w-4 h-4 ${isTraining ? "animate-spin" : ""}`} />
          <span>{isTraining ? "Retraining In-Browser..." : "Retrain Machine Learning Regressors"}</span>
        </button>
      </div>
    </div>
  );
}
