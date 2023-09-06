interface ILabels {
  [key: string]: { [key: string]: string };
}

export default {
  severity: {
    1: "Very Low",
    2: "Low",
    3: "Medium",
    4: "High",
    5: "Extreme",
  },

  consequence: {
    1: "Insignificant",
    2: "Minor",
    3: "Moderate",
    4: "Major",
    5: "Catastrophic",
  },

  likelihood: {
    1: "May Occur",
    2: "Unlikely",
    3: "Possible",
    4: "Likely",
    5: "Almost Certain",
  },
} as ILabels;

// enum Severity {
//   "_" = 0,
//   "Very Low" = 1,
//   "Low" = 2,
//   "Medium" = 3,
//   "High" = 4,
//   "Extreme" = 5,
// }

// function severityByNumber(value: number): string {
//   switch (value) {
//     case 1:
//       return Severity[1];
//     case 2:
//       return Severity[2];
//     case 3:
//       return Severity[3];
//     case 4:
//       return Severity[4];
//     case 5:
//       return Severity[5];
//     default:
//       return "";
//   }
// }

// function severityByString(value: string): number {
//   const lowerString = value.toLowerCase().trim();
//   switch (lowerString) {
//     case "very low":
//       return Severity["Very Low"];
//     case "low":
//       return Severity.Low;
//     case "medium":
//       return Severity.Medium;
//     case "high":
//       return Severity.High;
//     case "extreme":
//       return Severity.Extreme;
//     case "":
//       return Severity["_"];
//     default:
//       return -1;
//   }
// }

// enum Consequence {
//   "_" = 0,
//   "Insignificant" = 1,
//   "Minor" = 2,
//   "Moderate" = 3,
//   "Major" = 4,
//   "Catastrophic" = 5,
// }

// function consequenceByNumber(value: number): string {
//   switch (value) {
//     case 1:
//       return Consequence[1];
//     case 2:
//       return Consequence[2];
//     case 3:
//       return Consequence[3];
//     case 4:
//       return Consequence[4];
//     case 5:
//       return Consequence[5];
//     default:
//       return "";
//   }
// }

// function consequenceByString(value: string): number {
//   const lowerString = value.toLowerCase().trim();
//   switch (lowerString) {
//     case "insignificant":
//       return Consequence.Insignificant;
//     case "minor":
//       return Consequence.Minor;
//     case "moderate":
//       return Consequence.Moderate;
//     case "major":
//       return Consequence.Major;
//     case "catastrophic":
//       return Consequence.Catastrophic;
//     case "":
//       return Consequence["_"];
//     default:
//       return -1;
//   }
// }

// enum Likelihood {
//   "_" = 0,
//   "May Occur" = 1,
//   "Unlikely" = 2,
//   "Possible" = 3,
//   "Likely" = 4,
//   "Almost Certain" = 5,
// }

// function likelihoodByNumber(value: number): string {
//   switch (value) {
//     case 1:
//       return Likelihood[1];
//     case 2:
//       return Likelihood[2];
//     case 3:
//       return Likelihood[3];
//     case 4:
//       return Likelihood[4];
//     case 5:
//       return Likelihood[5];
//     default:
//       return "";
//   }
// }

// function likelihoodByString(value: string): number {
//   const lowerString = value.toLowerCase().trim();
//   switch (lowerString) {
//     case "may occur":
//       return Likelihood["May Occur"];
//     case "unlikely":
//       return Likelihood.Unlikely;
//     case "possible":
//       return Likelihood.Possible;
//     case "likely":
//       return Likelihood.Likely;
//     case "almost certain":
//       return Likelihood["Almost Certain"];
//     case "":
//       return Likelihood["_"];
//     default:
//       return -1;
//   }
// }

// export {
//   severityByNumber,
//   severityByString,
//   consequenceByNumber,
//   consequenceByString,
//   likelihoodByNumber,
//   likelihoodByString,
// };
