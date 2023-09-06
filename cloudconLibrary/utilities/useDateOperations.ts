import moment, { DurationInputArg2 } from "moment";
import maths from "../utilities/useNumberOperations";

export default {
  getNextMonth(date: number): number {
    return moment(date).add(1, "M").valueOf();
  },
  getPreviousMonth(date: number): number {
    return moment(date).add(-1, "M").valueOf();
  },

  getNextEpoch(
    date: number,
    duration: number,
    format: DurationInputArg2
  ): number {
    return moment(date).add(duration, format).valueOf();
  },

  getStartOfYear(date: number): number {
    return moment(date).startOf("year").valueOf();
  },

  getStartOfMonth(date: number): number {
    //const startOfWeek = moment(date).startOf("week")
    return moment(date).startOf("month").valueOf();
  },

  getEndOfMonth(date: number): number {
    return moment(date).endOf("month").valueOf();
  },
  getStartOfWeek(date: number, customWeekStart?: number): number {
    if (customWeekStart) {
      const currentDay = moment(date).day();
      if (customWeekStart <= currentDay)
        return moment(date)
          .subtract(currentDay - customWeekStart, "d")
          .startOf("day")
          .valueOf();
      return moment(date)
        .subtract(7 - customWeekStart + currentDay, "d")
        .startOf("day")
        .valueOf();
    }
    //const startOfWeek = moment(date).startOf("week")
    return moment(date).startOf("week").valueOf();
  },

  getEndOfWeek(date: number, customWeekEnd?: number): number {
    if (customWeekEnd) {
      const currentDay = moment(date).day();
      if (customWeekEnd >= currentDay)
        return moment(date)
          .add(customWeekEnd - currentDay, "d")
          .endOf("day")
          .valueOf();
      return moment(date)
        .add(7 + customWeekEnd - currentDay, "d")
        .endOf("day")
        .valueOf();
    }
    return moment(date).endOf("week").valueOf();
  },

  getStartOfDay(date: number): number {
    return moment(date).startOf("day").valueOf();
  },

  getNextDay(date: number): number {
    return moment(date).add(1).valueOf();
  },
  getPreviousDay(date: number): number {
    return moment(date).add(-1).valueOf();
  },

  getCurrentDayString(date: number): string {
    return moment(date).format("DD MMM YYYY");
  },

  getYearWeekString(date: number): string {
    const momentDate = moment(date);
    return momentDate.format("YYYY") + "-" + momentDate.format("ww");
  },

  getDateString(date: number, format = "DD MMM YYYY"): string {
    return moment(date).format(format);
  },

  getFormattedDateString(date: number, format: string): string {
    return moment(date).format(format);
  },
  getPreviousFormattedDateString(
    date: number,
    format: string,
    amount: number,
    timeInterval: string
  ): string {
    return moment(date)
      .subtract(amount, timeInterval as DurationInputArg2)
      .format(format);
  },

  // get duration in hours and minutes (e.g. 26h 5m). Duration input is in milliseconds
  getDuration(
    duration: number,
    durationFormat: moment.unitOfTime.DurationConstructor = "ms"
  ) {
    const m = moment.duration(duration, durationFormat);
    const days = m.days();
    const hours = m.hours();
    const minutes = m.minutes();
    return `${maths.sum(maths.multiply(days, 24), hours)}h ${minutes}m`;
  },

  getDurationBetweenDates(
    startDate: number,
    endDate: number,
    durationFormat: moment.unitOfTime.Base = "s"
  ): number {
    const startDateMoment = moment(startDate);
    const endDateMoment = moment(endDate);

    return moment
      .duration(endDateMoment.diff(startDateMoment))
      .as(durationFormat);
  },
};
