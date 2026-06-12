import { useMemo, useState } from "react";
import WhatsAppButton from "./WhatsAppButton";

export default function BMICalculator() {
  const [height, setHeight] = useState(170);
  const [weight, setWeight] = useState(70);

  const bmi = useMemo(() => {
    const value = weight / Math.pow(height / 100, 2);
    return Number(value.toFixed(1));
  }, [height, weight]);

  const result = useMemo(() => {
    if (bmi < 18.5) {
      return {
        status: "Underweight",
        range: "Below 18.5",
        suggestion:
          "Focus on healthy weight gain with strength training, proper meals, and trainer-guided progression.",
      };
    }

    if (bmi < 25) {
      return {
        status: "Normal",
        range: "18.5 - 24.9",
        suggestion:
          "Maintain your fitness with strength training, cardio, mobility, and a balanced diet plan.",
      };
    }

    if (bmi < 30) {
      return {
        status: "Overweight",
        range: "25 - 29.9",
        suggestion:
          "A structured fat-loss plan with strength training, cardio, diet guidance, and consistency can help.",
      };
    }

    return {
      status: "Obese",
      range: "30 and above",
      suggestion:
        "Start with safe guided workouts, low-impact cardio, diet guidance, and gradual progress tracking.",
    };
  }, [bmi]);

  return (
    <section className="section">
      <div className="container bmi-grid">
        <div className="card highlight-card">
          <div className="section-head">
            <p>Health Check</p>
            <h2>BMI Calculator</h2>
            <span>
              Check your Body Mass Index and get a simple fitness direction.
              BMI is a general indicator, not a medical diagnosis.
            </span>
          </div>

          <div className="range-group">
            <label>Height: {height} cm</label>
            <input
              type="range"
              min="120"
              max="220"
              value={height}
              onChange={(e) => setHeight(Number(e.target.value))}
            />
          </div>

          <div className="range-group">
            <label>Weight: {weight} kg</label>
            <input
              type="range"
              min="30"
              max="180"
              value={weight}
              onChange={(e) => setWeight(Number(e.target.value))}
            />
          </div>

          <div className="bmi-manual-grid">
            <div className="form-group">
              <label>Height in cm</label>
              <input
                type="number"
                min="120"
                max="220"
                value={height}
                onChange={(e) => setHeight(Number(e.target.value))}
              />
            </div>

            <div className="form-group">
              <label>Weight in kg</label>
              <input
                type="number"
                min="30"
                max="180"
                value={weight}
                onChange={(e) => setWeight(Number(e.target.value))}
              />
            </div>
          </div>
        </div>

        <div className="card bmi-result-card">
          <h2>Your BMI Result</h2>

          <div className="bmi-value">{bmi}</div>

          <div className="bmi-status">
            BMI Status: <strong>{result.status}</strong>
          </div>

          <div className="bmi-suggestion-box">
            <p>
              <strong>Range:</strong> {result.range}
            </p>

            <p>
              <strong>Suggestion:</strong> {result.suggestion}
            </p>
          </div>

          <div className="bmi-info-grid">
            <div>Below 18.5 • Underweight</div>
            <div>18.5 - 24.9 • Normal</div>
            <div>25 - 29.9 • Overweight</div>
            <div>30+ • Obese</div>
          </div>

          <WhatsAppButton
            text="Get Fitness Guidance"
            message={`Hi JK Fitness Zone, my BMI is ${bmi} and my status is ${result.status}. Please suggest the right training and diet guidance for me.`}
          />
        </div>
      </div>
    </section>
  );
}