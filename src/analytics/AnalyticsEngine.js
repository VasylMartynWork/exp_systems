/**
 * AnalyticsEngine - Decision support and analysis component
 * 
 * Implements various multi-criteria decision analysis methods
 * to evaluate and rank alternatives based on weighted criteria.
 */

export class AnalyticsEngine {
  /**
   * Normalize evaluation values to 0-1 scale
   * @param {Array} values - Array of numeric values
   * @param {String} type - Criterion type: 'maximize' or 'minimize'
   * @returns {Array} Normalized values in 0-1 range
   */
  static normalizeValues(values, type) {
    if (!values || values.length === 0) return [];

    const validValues = values.filter(v => v !== null && v !== undefined);
    if (validValues.length === 0) return values.map(() => 0);

    const min = Math.min(...validValues);
    const max = Math.max(...validValues);

    if (min === max) return values.map(() => 0.5);

    return values.map(value => {
      if (value === null || value === undefined) return 0;

      const normalized = (value - min) / (max - min);

      if (type === 'minimize') {
        // For minimize criteria, invert the score (lower is better)
        return 1 - normalized;
      }
      return normalized;
    });
  }

  /**
   * Alternative normalization approach - simpler
   * Normalize all values per criterion
   */
  static calculateWeightedSumSimple(matrix, weights) {
    if (!matrix || !matrix.alternatives || !matrix.criteria) {
      throw new Error('Invalid matrix structure');
    }

    const alternatives = matrix.alternatives;
    const criteria = matrix.criteria;
    const evaluations = matrix.evaluations;

    // Build normalized matrix
    const critNormalized = {};

    criteria.forEach(crit => {
      // Get all values for this criterion
      const values = [];
      const valueMap = {};

      alternatives.forEach(alt => {
        const key = `${alt.id}_${crit.id}`;
        const value = evaluations[key];
        if (value !== null && value !== undefined) {
          values.push(value);
          valueMap[alt.id] = value;
        }
      });

      // Normalize
      if (values.length > 0) {
        const normalized = this.normalizeValues(values, crit.type);
        const idList = alternatives.filter(a => valueMap[a.id] !== undefined).map(a => a.id);

        critNormalized[crit.id] = {};
        idList.forEach((altId, idx) => {
          critNormalized[crit.id][altId] = normalized[idx];
        });
      }
    });

    // Calculate weighted scores
    const scores = alternatives.map(alt => {
      let score = 0;
      let count = 0;

      criteria.forEach(crit => {
        const weight = weights[crit.id] || 0;
        const normValue = critNormalized[crit.id]?.[alt.id];

        if (normValue !== undefined) {
          score += weight * normValue;
          count++;
        }
      });

      return {
        alternative_id: alt.id,
        alternative_name: alt.name,
        score: count > 0 ? Math.round(score * 100) / 100 : 0
      };
    });

    // Sort and rank
    scores.sort((a, b) => b.score - a.score);
    scores.forEach((s, idx) => {
      s.rank = idx + 1;
    });

    return scores;
  }

  /**
   * Generate explanation for decision
   * @param {Object} result - Calculation result with rankings
   * @param {Object} matrix - Evaluation matrix
   * @param {Object} weights - Criterion weights
   * @returns {String} Human-readable explanation
   */
  static generateExplanation(result, matrix, weights) {
    if (!result || result.length === 0) {
      return 'Unable to generate explanation: no results available.';
    }

    const best = result[0];
    const alternatives = matrix.alternatives;
    const criteria = matrix.criteria;
    const evaluations = matrix.evaluations;

    // Find criteria with highest weights
    const weightedCriteria = criteria
      .map(c => ({ ...c, weight: weights[c.id] || 0 }))
      .filter(c => c.weight > 0)
      .sort((a, b) => b.weight - a.weight);

    const topCriteria = weightedCriteria.slice(0, 2);

    let explanation = `**${best.alternative_name}** was selected as the best alternative with a score of **${best.score}/1.0**.\n\n`;

    explanation += '**Key reasons:**\n';

    topCriteria.forEach(crit => {
      const value = evaluations[`${best.alternative_id}_${crit.id}`];
      if (value !== undefined && value !== null) {
        const weight = (crit.weight * 100).toFixed(1);
        const type = crit.type === 'maximize' ? 'maximized' : 'minimized';
        explanation += `• **${crit.name}** (${weight}% weight, ${type}): `;

        // Compare with others
        const allValues = alternatives
          .map(alt => evaluations[`${alt.id}_${crit.id}`])
          .filter(v => v !== null && v !== undefined);

        if (allValues.length > 0) {
          const min = Math.min(...allValues);
          const max = Math.max(...allValues);

          if (crit.type === 'maximize') {
            if (value === max) {
              explanation += `**${value}** (best among alternatives)\n`;
            } else {
              explanation += `${value} (close to best: ${max})\n`;
            }
          } else {
            if (value === min) {
              explanation += `**${value}** (best among alternatives)\n`;
            } else {
              explanation += `${value} (close to best: ${min})\n`;
            }
          }
        } else {
          explanation += `${value}\n`;
        }
      }
    });

    if (result.length > 1) {
      explanation += `\n**Rankings:**\n`;
      result.slice(0, 3).forEach(r => {
        explanation += `${r.rank}. ${r.alternative_name} - ${r.score}\n`;
      });
    }

    return explanation;
  }

  /**
   * Get supported decision-making methods
   * @returns {Array} List of available methods
   */
  static getSupportedMethods() {
    return [
      {
        name: 'weighted_sum',
        description: 'Weighted sum method - simple and intuitive',
        implemented: true
      },
      {
        name: 'topsis',
        description: 'TOPSIS (Technique for Order of Preference by Similarity to Ideal Solution)',
        implemented: false
      },
      {
        name: 'ahp',
        description: 'AHP (Analytic Hierarchy Process)',
        implemented: false
      },
      {
        name: 'electre',
        description: 'ELECTRE (Elimination et Choix Traduisant la REalité)',
        implemented: false
      },
      {
        name: 'vikor',
        description: 'VIKOR (VIseKriterijumska Optimizacija i KOmpromisno Resenje)',
        implemented: false
      }
    ];
  }
}

export default AnalyticsEngine;

