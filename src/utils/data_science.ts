import { RawMovie, CleanMovie, FeatureVector, EvaluationMetrics, ModelComparison, PredictionInput } from "../types";
import { RAW_MOVIES } from "../data/movies_data";

// Top 8 Genres for One-Hot Encoding
export const TOP_GENRES = [
  "Drama",
  "Action",
  "Comedy",
  "Romance",
  "Thriller",
  "Horror",
  "Musical",
  "Mystery"
];

export interface ScalingParams {
  minYear: number;
  maxYear: number;
  minDuration: number;
  maxYearDiff: number;
  maxDuration: number;
  minVotesLog: number;
  maxVotesLog: number;
}

export interface TrainingDiagnostics {
  originalCount: number;
  droppedCount: number;
  imputedYearCount: number;
  imputedDurationCount: number;
  imputedVotesCount: number;
  finalCount: number;
  trainSize: number;
  testSize: number;
  scalingParams: ScalingParams;
}

// Global parameters for scaling
let scalingParams: ScalingParams = {
  minYear: 1940,
  maxYear: 2022,
  maxYearDiff: 82,
  minDuration: 60,
  maxDuration: 240,
  minVotesLog: 0,
  maxVotesLog: 6, // 1,000,000 votes
};

// Trained model weights and structures
let lrWeights: number[] = [];
let lrBias = 0;

interface DecisionTreeNode {
  featureIdx?: number;
  splitValue?: number;
  left?: DecisionTreeNode;
  right?: DecisionTreeNode;
  prediction?: number; // active only for leaf nodes
  isLeaf: boolean;
}

let decisionTreeRoot: DecisionTreeNode | null = null;
let randomForestTrees: DecisionTreeNode[] = [];

// ==========================================
// 1. DATA CLEANING & PREPROCESSING
// ==========================================
export function cleanAndPreprocessData(raw: RawMovie[]): {
  clean: CleanMovie[];
  diagnostics: TrainingDiagnostics;
} {
  const diagnostics = {
    originalCount: raw.length,
    droppedCount: 0,
    imputedYearCount: 0,
    imputedDurationCount: 0,
    imputedVotesCount: 0,
    finalCount: 0,
    trainSize: 0,
    testSize: 0,
    scalingParams: { ...scalingParams }
  };

  // First, find medians for imputation from non-null values
  const years = raw.map(m => m.year).filter((y): y is number => y !== null);
  const durations = raw.map(m => m.duration).filter((d): d is number => d !== null);
  const votesList = raw.map(m => m.votes).filter((v): v is number => v !== null);

  const medianYear = years.length > 0 ? years.sort((a, b) => a - b)[Math.floor(years.length / 2)] : 2005;
  const medianDuration = durations.length > 0 ? durations.sort((a, b) => a - b)[Math.floor(durations.length / 2)] : 120;
  const medianVotes = votesList.length > 0 ? votesList.sort((a, b) => a - b)[Math.floor(votesList.length / 2)] : 500;

  const cleanMovies: CleanMovie[] = [];

  for (const m of raw) {
    // Drop records with empty names or missing targets
    if (!m.name || m.rating === null) {
      diagnostics.droppedCount++;
      continue;
    }

    let year = m.year;
    if (year === null) {
      year = medianYear;
      diagnostics.imputedYearCount++;
    }

    let duration = m.duration;
    if (duration === null) {
      duration = medianDuration;
      diagnostics.imputedDurationCount++;
    }

    let votes = m.votes;
    if (votes === null) {
      votes = medianVotes;
      diagnostics.imputedVotesCount++;
    }

    cleanMovies.push({
      name: m.name,
      year: year,
      duration: duration,
      votes: votes,
      genres: m.genres,
      rating: m.rating,
      director: m.director,
      actors: m.actors
    });
  }

  diagnostics.finalCount = cleanMovies.length;

  // Dynamically update global scaling bounds based on clean data
  const finalYears = cleanMovies.map(m => m.year);
  const finalDurations = cleanMovies.map(m => m.duration);
  const finalVotesLog = cleanMovies.map(m => Math.log10(Math.max(1, m.votes)));

  scalingParams.minYear = Math.min(...finalYears, 1940);
  scalingParams.maxYear = Math.max(...finalYears, 2022);
  scalingParams.maxYearDiff = Math.max(1, scalingParams.maxYear - scalingParams.minYear);
  
  scalingParams.minDuration = Math.min(...finalDurations, 50);
  scalingParams.maxDuration = Math.max(...finalDurations, 240);

  scalingParams.minVotesLog = Math.min(...finalVotesLog, 0);
  scalingParams.maxVotesLog = Math.max(...finalVotesLog, 6);

  diagnostics.scalingParams = { ...scalingParams };

  return { clean: cleanMovies, diagnostics };
}

// Convert CleanMovie into a standardized feature vector [x0, x1, x2, g0, g1, g2, g3, g4, g5, g6, g7]
export function extractFeatures(m: CleanMovie, params: ScalingParams): FeatureVector {
  // 1. Year MinMax scaling
  const yearNorm = (m.year - params.minYear) / params.maxYearDiff;

  // 2. Duration MinMax scaling
  const durationDiff = params.maxDuration - params.minDuration;
  const durationNorm = durationDiff > 0 ? (m.duration - params.minDuration) / durationDiff : 0.5;

  // 3. Log Votes Scaling (skewed distribution)
  const logVotes = Math.log10(Math.max(1, m.votes));
  const votesDiff = params.maxVotesLog - params.minVotesLog;
  const votesNorm = votesDiff > 0 ? (logVotes - params.minVotesLog) / votesDiff : 0.5;

  // 4. One-Hot encoded genres
  const genreFeatures = TOP_GENRES.map(g => (m.genres.includes(g) ? 1.0 : 0.0));

  return {
    features: [yearNorm, durationNorm, votesNorm, ...genreFeatures],
    target: m.rating
  };
}

// Custom prompt scale predictions
export function featureVectorFromInput(inp: PredictionInput, params: ScalingParams = scalingParams): number[] {
  const yearNorm = (inp.year - params.minYear) / params.maxYearDiff;
  const durationDiff = params.maxDuration - params.minDuration;
  const durationNorm = durationDiff > 0 ? (inp.duration - params.minDuration) / durationDiff : 0.5;
  const logVotes = Math.log10(Math.max(1, inp.votes));
  const votesDiff = params.maxVotesLog - params.minVotesLog;
  const votesNorm = votesDiff > 0 ? (logVotes - params.minVotesLog) / votesDiff : 0.5;
  const genreFeatures = TOP_GENRES.map(g => (inp.genres.includes(g) ? 1.0 : 0.0));

  return [yearNorm, durationNorm, votesNorm, ...genreFeatures];
}

// ==========================================
// 2. EVALUATION METRICS HELPER
// ==========================================
export function calculateMetrics(yTrue: number[], yPred: number[]): EvaluationMetrics {
  const n = yTrue.length;
  if (n === 0) return { mae: 0, mse: 0, rmse: 0, r2: 0 };

  let sumAbsErr = 0;
  let sumSqErr = 0;
  let sumY = 0;

  for (let i = 0; i < n; i++) {
    const err = yTrue[i] - yPred[i];
    sumAbsErr += Math.abs(err);
    sumSqErr += err * err;
    sumY += yTrue[i];
  }

  const mae = sumAbsErr / n;
  const mse = sumSqErr / n;
  const rmse = Math.sqrt(mse);

  const yMean = sumY / n;
  let sumVariance = 0;
  for (let i = 0; i < n; i++) {
    const diff = yTrue[i] - yMean;
    sumVariance += diff * diff;
  }

  const r2 = sumVariance > 0 ? 1 - sumSqErr / sumVariance : 0;

  return {
    mae: Number(mae.toFixed(4)),
    mse: Number(mse.toFixed(4)),
    rmse: Number(rmse.toFixed(4)),
    r2: Number(r2.toFixed(4))
  };
}

// ==========================================
// 3. MODEL TRAINING LIBRARIES
// ==========================================

// --- MODEL A: LINEAR REGRESSION WITH L2 REGULARIZATION (RIDGE) ---
export function trainLinearRegression(
  trainSet: FeatureVector[],
  epochs = 2000,
  lr = 0.05,
  lambda = 0.01 // L2 regularization coefficient
): { weights: number[]; bias: number } {
  const numFeatures = trainSet[0].features.length;
  const weights = new Array(numFeatures).fill(0).map(() => (Math.random() - 0.5) * 0.1);
  let bias = 5.0; // Initialize bias close to typical movie ratings

  const m = trainSet.length;

  for (let epoch = 0; epoch < epochs; epoch++) {
    const dWeights = new Array(numFeatures).fill(0);
    let dBias = 0;

    for (let i = 0; i < m; i++) {
      const x = trainSet[i].features;
      const y = trainSet[i].target;

      // Predict: y_hat = w . x + b
      let yHat = bias;
      for (let f = 0; f < numFeatures; f++) {
        yHat += weights[f] * x[f];
      }

      const diff = yHat - y;

      dBias += diff;
      for (let f = 0; f < numFeatures; f++) {
        dWeights[f] += diff * x[f];
      }
    }

    // Update weights and bias with L2 regularization
    bias -= (lr * dBias) / m;
    for (let f = 0; f < numFeatures; f++) {
      dWeights[f] = dWeights[f] / m + (lambda * weights[f]) / m;
      weights[f] -= lr * dWeights[f];
    }
  }

  lrWeights = [...weights];
  lrBias = bias;

  return { weights, bias };
}

export function predictLinearRegression(features: number[]): number {
  let pred = lrBias;
  for (let i = 0; i < features.length; i++) {
    pred += lrWeights[i] * features[i];
  }
  return Math.max(1, Math.min(10, pred));
}

// --- MODEL B: DECISION TREE REGRESSOR ---
function calculateMSE(targets: number[]): number {
  if (targets.length === 0) return 0;
  const mean = targets.reduce((sum, val) => sum + val, 0) / targets.length;
  return targets.reduce((sqSum, val) => sqSum + Math.pow(val - mean, 2), 0) / targets.length;
}

export function buildDecisionTree(
  samples: FeatureVector[],
  depth = 0,
  maxDepth = 4,
  minSplitSize = 4
): DecisionTreeNode {
  const targets = samples.map(s => m => s.target);
  const avgTarget = samples.reduce((sum, s) => sum + s.target, 0) / samples.length;

  // Base case: Leaf node triggers
  if (depth >= maxDepth || samples.length <= minSplitSize) {
    return { isLeaf: true, prediction: avgTarget };
  }

  const numFeatures = samples[0].features.length;
  let bestFeatureIdx = -1;
  let bestSplitValue = -1;
  let minCost = Infinity;
  let bestLeftSet: FeatureVector[] = [];
  let bestRightSet: FeatureVector[] = [];

  // Scrutinize split choices
  for (let fIdx = 0; fIdx < numFeatures; fIdx++) {
    const values = samples.map(s => s.features[fIdx]);
    // Obtain unique values as split candidates
    const uniqueVals = Array.from(new Set(values)).sort((a, b) => a - b);

    for (let i = 0; i < uniqueVals.length - 1; i++) {
      const splitVal = (uniqueVals[i] + uniqueVals[i + 1]) / 2;

      const left = samples.filter(s => s.features[fIdx] <= splitVal);
      const right = samples.filter(s => s.features[fIdx] > splitVal);

      if (left.length === 0 || right.length === 0) continue;

      const leftMSE = calculateMSE(left.map(s => s.target));
      const rightMSE = calculateMSE(right.map(s => s.target));
      const splitCost = left.length * leftMSE + right.length * rightMSE;

      if (splitCost < minCost) {
        minCost = splitCost;
        bestFeatureIdx = fIdx;
        bestSplitValue = splitVal;
        bestLeftSet = left;
        bestRightSet = right;
      }
    }
  }

  // If no constructive split could be found, return leaf
  if (bestFeatureIdx === -1 || bestLeftSet.length === 0 || bestRightSet.length === 0) {
    return { isLeaf: true, prediction: avgTarget };
  }

  // Recursive split
  const leftChild = buildDecisionTree(bestLeftSet, depth + 1, maxDepth, minSplitSize);
  const rightChild = buildDecisionTree(bestRightSet, depth + 1, maxDepth, minSplitSize);

  return {
    isLeaf: false,
    featureIdx: bestFeatureIdx,
    splitValue: bestSplitValue,
    left: leftChild,
    right: rightChild
  };
}

export function predictDecisionTree(root: DecisionTreeNode | null, features: number[]): number {
  if (!root) return 5.0;
  let current = root;
  while (!current.isLeaf) {
    const fIdx = current.featureIdx!;
    const val = features[fIdx];
    if (val <= current.splitValue!) {
      current = current.left!;
    } else {
      current = current.right!;
    }
  }
  return current.prediction!;
}

// --- MODEL C: RANDOM FOREST REGRESSOR ---
export function trainRandomForest(
  trainSet: FeatureVector[],
  numTrees = 5,
  maxDepth = 3,
  minSplitSize = 4
): DecisionTreeNode[] {
  const trees: DecisionTreeNode[] = [];

  for (let t = 0; t < numTrees; t++) {
    // Bootstrap sampling (draw with replacement)
    const bootstrapSample: FeatureVector[] = [];
    const n = trainSet.length;
    for (let i = 0; i < n; i++) {
      const randIdx = Math.floor(Math.random() * n);
      bootstrapSample.push(trainSet[randIdx]);
    }

    const tree = buildDecisionTree(bootstrapSample, 0, maxDepth, minSplitSize);
    trees.push(tree);
  }

  randomForestTrees = [...trees];
  return trees;
}

export function predictRandomForest(trees: DecisionTreeNode[], features: number[]): number {
  if (trees.length === 0) return 5.0;
  let sum = 0;
  for (const tree of trees) {
    sum += predictDecisionTree(tree, features);
  }
  return sum / trees.length;
}

// ==========================================
// 4. FULL AUTO-TRAINING LAUNCHER
// ==========================================
export interface PipelineResults {
  diagnostics: TrainingDiagnostics;
  metrics: ModelComparison;
  cleanedCount: number;
}

export function runFullPipeline(): PipelineResults {
  // 1. Clean data
  const { clean, diagnostics } = cleanAndPreprocessData(RAW_MOVIES);

  // 2. Perform Train-Test Split (approx. 80-20 partition)
  // Seed random to keep split consistent for portfolio aesthetics
  const shuffled = [...clean];
  const trainSplitIdx = Math.floor(shuffled.length * 0.8);
  
  diagnostics.trainSize = trainSplitIdx;
  diagnostics.testSize = shuffled.length - trainSplitIdx;

  const trainMovies = shuffled.slice(0, trainSplitIdx);
  const testMovies = shuffled.slice(trainSplitIdx);

  // Extract features
  const params = diagnostics.scalingParams;
  const trainFeatures = trainMovies.map(m => extractFeatures(m, params));
  const testFeatures = testMovies.map(m => extractFeatures(m, params));

  // 3. Train Models
  trainLinearRegression(trainFeatures);
  decisionTreeRoot = buildDecisionTree(trainFeatures);
  trainRandomForest(trainFeatures);

  // 4. Predict on Test Set
  const testTargets = testFeatures.map(f => f.target);

  const lrPreds = testFeatures.map(f => predictLinearRegression(f.features));
  const dtPreds = testFeatures.map(f => predictDecisionTree(decisionTreeRoot, f.features));
  const rfPreds = testFeatures.map(f => predictRandomForest(randomForestTrees, f.features));

  // 5. Evaluate
  const metrics: ModelComparison = {
    linearRegression: calculateMetrics(testTargets, lrPreds),
    decisionTree: calculateMetrics(testTargets, dtPreds),
    randomForest: calculateMetrics(testTargets, rfPreds)
  };

  return {
    diagnostics,
    metrics,
    cleanedCount: clean.length
  };
}

// Interactive prediction from input forms
export function predictMovie(inp: PredictionInput): {
  rating: number;
  confidence: "High" | "Medium" | "Low";
  lrRating: number;
  dtRating: number;
  rfRating: number;
} {
  const features = featureVectorFromInput(inp, scalingParams);

  // Make prediction using all three
  const lrRating = predictLinearRegression(features);
  const dtRating = predictDecisionTree(decisionTreeRoot, features);
  const rfRating = predictRandomForest(randomForestTrees, features);

  // The random forest rating is historically the most stable state (ensemble beauty)
  const rating = rfRating;

  // Confidence calculation: derived from votes count & validation delta
  let confidence: "High" | "Medium" | "Low" = "Medium";
  if (inp.votes < 50) {
    confidence = "Low";
  } else if (inp.votes > 5000 && Math.abs(lrRating - rfRating) < 0.6) {
    confidence = "High";
  }

  return {
    rating: Number(rating.toFixed(2)),
    confidence,
    lrRating: Number(lrRating.toFixed(2)),
    dtRating: Number(dtRating.toFixed(2)),
    rfRating: Number(rfRating.toFixed(2))
  };
}

// Analyze correlation coefficient between two headers
export function calculateCorrelation(x: number[], y: number[]): number {
  const n = x.length;
  if (n === 0) return 0;

  const meanX = x.reduce((a, b) => a + b, 0) / n;
  const meanY = y.reduce((a, b) => a + b, 0) / n;

  let num = 0;
  let denX = 0;
  let denY = 0;

  for (let i = 0; i < n; i++) {
    const dx = x[i] - meanX;
    const dy = y[i] - meanY;
    num += dx * dy;
    denX += dx * dx;
    denY += dy * dy;
  }

  if (denX === 0 || denY === 0) return 0;
  return num / Math.sqrt(denX * denY);
}
