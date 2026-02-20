export interface DailyTarget {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
}

export interface TrainingConfig {
  trainingDays: number; // 5 meals
  restDays: number; // 3 meals
  periWorkoutCarbWeight: number; // 0.65
  periWorkoutFatWeight: number; // 0.15
}

export interface Meal {
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
}

export interface Plan {
  name: string;
  meals: Meal[];
  totals: DailyTarget;
}

export class FormulaEngine {
  private dailyTarget: DailyTarget;
  private config: TrainingConfig;

  constructor(dailyTarget: DailyTarget, config: TrainingConfig) {
    this.dailyTarget = dailyTarget;
    this.config = config;
  }

  private calculateCalories(protein: number, carbs: number, fat: number): number {
    return Math.round(protein * 4 + carbs * 4 + fat * 9);
  }

  private distributeMacros(
    mealCount: number,
    periWorkoutIndices: number[] = [] // 0-based indices of peri-workout meals
  ): Meal[] {
    const isTrainingDay = periWorkoutIndices.length > 0;
    
    // Protein & Fiber: Even distribution
    const proteinPerMeal = Math.round((this.dailyTarget.protein / mealCount) * 10) / 10;
    const fiberPerMeal = Math.round((this.dailyTarget.fiber / mealCount) * 10) / 10;

    // Carbs & Fat distribution logic
    let carbDistribution: number[] = new Array(mealCount).fill(0);
    let fatDistribution: number[] = new Array(mealCount).fill(0);

    if (isTrainingDay) {
      const periCarbsTotal = this.dailyTarget.carbs * this.config.periWorkoutCarbWeight;
      const otherCarbsTotal = this.dailyTarget.carbs * (1 - this.config.periWorkoutCarbWeight);
      
      const periFatTotal = this.dailyTarget.fat * this.config.periWorkoutFatWeight;
      const otherFatTotal = this.dailyTarget.fat * (1 - this.config.periWorkoutFatWeight);

      const periCount = periWorkoutIndices.length;
      const otherCount = mealCount - periCount;

      const periCarbPerMeal = periCarbsTotal / periCount;
      const otherCarbPerMeal = otherCarbsTotal / otherCount;

      const periFatPerMeal = periFatTotal / periCount;
      const otherFatPerMeal = otherFatTotal / otherCount;

      for (let i = 0; i < mealCount; i++) {
        if (periWorkoutIndices.includes(i)) {
            // Peri-workout meal
            carbDistribution[i] = periCarbPerMeal;
            fatDistribution[i] = periFatPerMeal;
        } else {
            // Regular meal
            carbDistribution[i] = otherCarbPerMeal;
            fatDistribution[i] = otherFatPerMeal;
        }
      }

    } else {
      // Rest Day: Even distribution
      const carbsPerMeal = this.dailyTarget.carbs / mealCount;
      const fatPerMeal = this.dailyTarget.fat / mealCount;
      carbDistribution.fill(carbsPerMeal);
      fatDistribution.fill(fatPerMeal);
    }

    // Round values
    const meals: Meal[] = [];
    for (let i = 0; i < mealCount; i++) {
        const p = proteinPerMeal;
        const c = Math.round(carbDistribution[i] * 10) / 10;
        const f = Math.round(fatDistribution[i] * 10) / 10;
        const fib = fiberPerMeal;
        
        meals.push({
            name: `Meal ${i + 1}`,
            protein: p,
            carbs: c,
            fat: f,
            fiber: fib,
            calories: this.calculateCalories(p, c, f)
        });
    }

    // Adjust for rounding errors to match totals exactly on the last meal (non-peri preferably, or just last meal)
    // However, exact match might be tricky with float rounding. Let's just sum up and adjust the last meal.
    
    let currentTotals = meals.reduce((acc, meal) => ({
        calories: acc.calories + meal.calories,
        protein: acc.protein + meal.protein,
        carbs: acc.carbs + meal.carbs,
        fat: acc.fat + meal.fat,
        fiber: acc.fiber + meal.fiber
    }), { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 });

    const lastMeal = meals[meals.length - 1];
    
    // Adjust Protein
    const proteinDiff = this.dailyTarget.protein - currentTotals.protein;
    if (Math.abs(proteinDiff) > 0.01) {
        lastMeal.protein = Math.round((lastMeal.protein + proteinDiff) * 10) / 10;
    }
    
    // Adjust Fiber
    const fiberDiff = this.dailyTarget.fiber - currentTotals.fiber;
    if (Math.abs(fiberDiff) > 0.01) {
        lastMeal.fiber = Math.round((lastMeal.fiber + fiberDiff) * 10) / 10;
    }

    // Adjust Carbs
    const carbsDiff = this.dailyTarget.carbs - currentTotals.carbs;
    if (Math.abs(carbsDiff) > 0.01) {
        lastMeal.carbs = Math.round((lastMeal.carbs + carbsDiff) * 10) / 10;
    }

    // Adjust Fat
    const fatDiff = this.dailyTarget.fat - currentTotals.fat;
    if (Math.abs(fatDiff) > 0.01) {
        lastMeal.fat = Math.round((lastMeal.fat + fatDiff) * 10) / 10;
    }

    // Recalculate calories for last meal
    lastMeal.calories = this.calculateCalories(lastMeal.protein, lastMeal.carbs, lastMeal.fat);

    return meals;
  }

  public generateMorningTrainingPlan(): Plan {
    // 5 meals. Meal 1 (Pre), Meal 2 (Post). Indices: 0, 1
    const meals = this.distributeMacros(5, [0, 1]);
    meals[0].name = "Meal 1 (Pre-Workout)";
    meals[1].name = "Meal 2 (Post-Workout)";
    return {
        name: "Morning Training",
        meals,
        totals: this.calculateTotals(meals)
    };
  }

  public generateAfternoonTrainingPlan(): Plan {
    // 5 meals. Meal 2 (Pre), Meal 3 (Post). Indices: 1, 2
    const meals = this.distributeMacros(5, [1, 2]);
    meals[1].name = "Meal 2 (Pre-Workout)";
    meals[2].name = "Meal 3 (Post-Workout)";
    return {
        name: "Afternoon Training",
        meals,
        totals: this.calculateTotals(meals)
    };
  }

  public generateEveningTrainingPlan(): Plan {
    // 5 meals. Meal 4 (Pre), Meal 5 (Post). Indices: 3, 4
    const meals = this.distributeMacros(5, [3, 4]);
    meals[3].name = "Meal 4 (Pre-Workout)";
    meals[4].name = "Meal 5 (Post-Workout)";
    return {
        name: "Evening Training",
        meals,
        totals: this.calculateTotals(meals)
    };
  }

  public generateRestDayPlan(): Plan {
    // 3 meals. No peri-workout logic.
    const meals = this.distributeMacros(3, []);
    return {
        name: "Rest Day",
        meals,
        totals: this.calculateTotals(meals)
    };
  }

  private calculateTotals(meals: Meal[]): DailyTarget {
    return meals.reduce((acc, meal) => ({
      calories: acc.calories + meal.calories,
      protein: Math.round((acc.protein + meal.protein) * 10) / 10,
      carbs: Math.round((acc.carbs + meal.carbs) * 10) / 10,
      fat: Math.round((acc.fat + meal.fat) * 10) / 10,
      fiber: Math.round((acc.fiber + meal.fiber) * 10) / 10,
    }), { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 });
  }
}
