export interface RawMovie {
  name: string;
  year: number | null; // e.g. 2019
  duration: number | null; // minutes
  genres: string[]; // e.g. ["Drama", "Romance"]
  rating: number | null; // 1-10
  votes: number | null; // e.g. 1086
  director: string;
  actors: string[];
}

export interface CleanMovie {
  name: string;
  year: number;
  duration: number;
  genres: string[];
  rating: number;
  votes: number;
  director: string;
  actors: string[];
}

export interface FeatureVector {
  features: number[]; // [year_norm, duration_norm, log_votes_norm, genre_1, genre_2, ...]
  target: number; // rating
}

export interface EvaluationMetrics {
  mae: number;
  mse: number;
  rmse: number;
  r2: number;
}

export interface ModelComparison {
  linearRegression: EvaluationMetrics;
  decisionTree: EvaluationMetrics;
  randomForest: EvaluationMetrics;
}

export interface PredictionInput {
  genres: string[];
  year: number;
  duration: number;
  votes: number;
}
