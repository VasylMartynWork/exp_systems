import AnalyticsEngine from '../analytics/AnalyticsEngine.js';
import { EvaluationService } from './EvaluationService.js';
import { CriterionService } from './CriterionService.js';
import { AlternativeService } from './AlternativeService.js';

export class DecisionService {
  /**
   * Calculate decision using weighted sum method
   * @param {String} algorithm - Decision algorithm name
   * @returns {Promise<Object>} Rankings and explanation
   */
  static async calculateDecision(algorithm = 'weighted_sum') {
    // Validate algorithm
    const supportedMethods = AnalyticsEngine.getSupportedMethods();
    const selectedMethod = supportedMethods.find(m => m.name === algorithm);

    if (!selectedMethod) {
      throw new Error(
        `Algorithm "${algorithm}" not supported. Available: ${supportedMethods
          .map(m => m.name)
          .join(', ')}`
      );
    }

    if (!selectedMethod.implemented) {
      throw new Error(
        `Algorithm "${algorithm}" is not yet implemented. Available methods: weighted_sum`
      );
    }

    // Get evaluation matrix
    const matrix = await EvaluationService.getMatrix();

    // Validate matrix
    if (!matrix.alternatives || matrix.alternatives.length === 0) {
      throw new Error('No alternatives found. Please add alternatives first.');
    }

    if (!matrix.criteria || matrix.criteria.length === 0) {
      throw new Error('No criteria found. Please add criteria first.');
    }

    // Get weights
    const weightsData = await CriterionService.getAllWeights();
    const weights = weightsData.weights;

    // Check if weights are set
    const totalWeight = Object.values(weights).reduce((sum, w) => sum + w, 0);
    if (totalWeight === 0) {
      throw new Error(
        'No weights set for criteria. Please set weights using PUT /api/criteria/:id/weight before calculating decisions.'
      );
    }

    // Normalize weights if needed
    const normalizedWeights = {};
    Object.entries(weights).forEach(([id, weight]) => {
      normalizedWeights[id] = weight / totalWeight;
    });

    // Calculate scores
    let rankings;

    switch (algorithm) {
      case 'weighted_sum':
        rankings = AnalyticsEngine.calculateWeightedSumSimple(matrix, normalizedWeights);
        break;
      default:
        throw new Error(`Algorithm "${algorithm}" implementation not found.`);
    }

    if (!rankings || rankings.length === 0) {
      throw new Error('Failed to calculate scores. Check matrix data and weights.');
    }

    // Generate explanation
    const explanation = AnalyticsEngine.generateExplanation(
      rankings,
      matrix,
      normalizedWeights
    );

    return {
      algorithm,
      criteria_count: matrix.criteria.length,
      alternatives_count: matrix.alternatives.length,
      weights: normalizedWeights,
      rankings,
      best_choice: rankings[0],
      explanation,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Get evaluation matrix data
   */
  static async getEvaluationMatrix() {
    return await EvaluationService.getMatrix();
  }

  /**
   * Get supported algorithms
   */
  static getSupportedAlgorithms() {
    return AnalyticsEngine.getSupportedMethods();
  }
}

export default DecisionService;
