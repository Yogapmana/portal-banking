/**
 * ML Scoring Service
 * Calls the Python ML microservice to get customer scores
 */

const ML_SERVICE_URL = process.env.ML_SERVICE_URL || "http://ml-service:5000";

class ScoringService {
  constructor() {
    this.baseUrl = ML_SERVICE_URL;
    this.timeout = 10000; // 10 seconds
  }

  /**
   * Check if ML service is available
   */
  async isAvailable() {
    try {
      const response = await fetch(`${this.baseUrl}/health`, {
        method: "GET",
        signal: AbortSignal.timeout(5000),
      });
      const data = await response.json();
      return data.model_loaded === true;
    } catch (error) {
      console.warn("ML Service unavailable:", error.message);
      return false;
    }
  }

  /**
   * Calculate score for a customer using ML model (ML-first approach)
   * @param {Object} customerData - Customer data
   * @returns {Promise<Object>} Score result { score, probability, priority, method }
   */
  async calculateScore(customerData) {
    try {
      // Primary method: ML prediction
      const mlInput = this._prepareInput(customerData);
      const response = await fetch(`${this.baseUrl}/predict`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(mlInput),
        signal: AbortSignal.timeout(this.timeout),
      });

      if (response.ok) {
        const mlResult = await response.json();
        // Use ML result directly
        return {
          score: mlResult.score,
          probability: mlResult.probability,
          priority: mlResult.priority,
          method: "ml",
        };
      } else {
        // ML service returned error, use fallback
        console.warn(`ML service returned status ${response.status}, using fallback scoring`);
        return {
          ...this._fallbackScore(customerData),
          method: "fallback",
        };
      }
    } catch (error) {
      // ML service unavailable (timeout, network error, etc.)
      console.error("ML service unavailable:", error.message);
      return {
        ...this._fallbackScore(customerData),
        method: "fallback",
      };
    }
  }

  /**
   * Batch scoring for multiple customers
   * @param {Array} customers - Array of customer data
   * @returns {Promise<Array>} Array of score results
   */
  async calculateBatchScore(customers) {
    try {
      const mlInputs = customers.map((c) => this._prepareInput(c));

      const response = await fetch(`${this.baseUrl}/predict/batch`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(mlInputs),
        signal: AbortSignal.timeout(this.timeout * 2),
      });

      if (!response.ok) {
        throw new Error("Batch prediction failed");
      }

      const result = await response.json();
      return result.predictions;
    } catch (error) {
      console.error("ML batch scoring error:", error.message);
      // Fallback to rule-based for all
      return customers.map((c) => this._fallbackScore(c));
    }
  }

  /**
   * Prepare input data for ML service
   */
  _prepareInput(data) {
    // Model only uses 7 key features: age, job, marital, education, default, housing, loan
    return {
      age: parseInt(data.age) || 35,
      job: (data.job || "unknown").toLowerCase(),
      marital: (data.marital || "unknown").toLowerCase(),
      education: (data.education || "unknown").toLowerCase(),
      default: (data.default || "no").toLowerCase(),
      housing: (data.housing || "unknown").toLowerCase(),
      loan: (data.loan || "unknown").toLowerCase(),
    };
  }

  /**
   * Fallback rule-based scoring when ML service is unavailable
   */
  _fallbackScore(data) {
    let score = 50; // Base score

    // Age factor (25-55 optimal)
    const age = parseInt(data.age) || 35;
    if (age >= 25 && age <= 55) score += 10;
    else if (age > 55 && age <= 65) score += 5;
    else if (age < 25) score -= 5;

    // Job factor
    const stableJobs = ["admin.", "management", "technician", "retired"];
    const job = (data.job || "").toLowerCase();
    if (stableJobs.includes(job)) score += 15;
    else if (job === "unemployed") score -= 15;
    else if (job === "student") score -= 5;

    // Education factor
    const education = (data.education || "").toLowerCase();
    if (education.includes("university") || education.includes("degree"))
      score += 10;
    else if (education.includes("professional")) score += 8;
    else if (education.includes("high.school")) score += 5;

    // Housing factor
    if ((data.housing || "").toLowerCase() === "yes") score += 10;

    // Loan factor
    if ((data.loan || "").toLowerCase() === "no") score += 5;

    // Default factor (credit history)
    if ((data.default || "").toLowerCase() === "yes") score -= 20;

    // Normalize score to 0-100
    score = Math.max(0, Math.min(100, score));

    // Determine priority
    let priority = "LOW";
    if (score >= 70) priority = "HIGH";
    else if (score >= 40) priority = "MEDIUM";

    return {
      score: Math.round(score * 100) / 100,
      probability: score / 100,
      priority,
    };
  }
}

module.exports = ScoringService;
