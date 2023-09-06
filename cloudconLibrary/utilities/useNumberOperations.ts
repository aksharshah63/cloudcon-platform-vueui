export default {
  sum(number1?: number | null, number2?: number | null, rounding = 2) {
    return this.round(
      (Number(number1) || 0) + (Number(number2) || 0),
      rounding
    );
  },

  subtract(number1?: number | null, number2?: number | null, rounding = 2) {
    return this.round(
      (Number(number1) || 0) - (Number(number2) || 0),
      rounding
    );
  },

  multiply(number1?: number | null, number2?: number | null, rounding = 2) {
    return this.round(
      (Number(number1) || 0) * (Number(number2) || 0),
      rounding
    );
  },

  divide(number1?: number | null, number2?: number | null, rounding = 2) {
    return number2
      ? this.round((Number(number1) || 0) / (Number(number2) || 1), rounding)
      : 0;
  },

  round(number: number, rounding = 2) {
    return Number((Number(number) || 0).toFixed(rounding));
  },
};
