import { IRecord, IUpvise } from "../../../store/modules/upvise.d";
import useLocalForage from "../../../use/utils/useLocalForage";
import {
  IContactTimesheets,
  IMappedPayrollCells,
  IMappedPayrollCellsInRange,
  IMappedTimesheetObject,
  IPayrollCell,
  IPayrollPeriod,
  IProjects,
  IProjectTime,
  IShift,
  IShiftTypes,
  ITimesheet,
  ITimesheetBreaks,
} from "../../../use/controller/payroll/payroll.d";
import { reactive } from "vue";
import { orderBy } from "lodash";
import moment from "moment-timezone";
import utils from "../../../use/function/useUtils";
import {
  TimesheetsShiftTypes,
  TimesheetsStatus,
  useTableNames,
} from "../../../use/utils/useConstants";
import useNumberOperations from "../../../use/utils/useNumberOperations";
import useDateOperations from "../../../use/utils/useDateOperations";
import { ILegendOption } from "../../../use/customInterfaces.d";

export default function useControllerPayroll(upvise: IUpvise) {
  const state = upvise.state();
  const fetch = () => upvise.fetch("payroll");
  const getMetadata = () => upvise.metadata("payroll");

  const week = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const UPVISE_DATE_FORMAT = "ddd MMM DD YYYY";
  const NO_PROJECT_ID = "NO_PROJECT_ID";
  const legendOptions: ILegendOption[] = [
    {
      name: "Ordinary",
      backgroundColour: "#ffffff",
      borderColour: "#f5f5f5",
    },
    {
      name: "Overtime 1",
      backgroundColour: "#e6f9fd",
    },
    {
      name: "Overtime 2",
      backgroundColour: "#b5edf9",
    },
    {
      name: "Leave",
      backgroundColour: "#fbf6fc",
      borderColour: "#dd66ff",
    },
    {
      name: "Other",
      backgroundColour: "#fff8ef",
      borderColour: "#784200",
    }
  ];

  const getForageData = async () =>
    await useLocalForage.getDataForkeys(
      [
        "unybiz.projects.projects",
        "unybiz.contacts.contacts",
        "system.user.settings",
      ],
      useLocalForage.getInstance("upvise", "tables")
    );

  function getCurrentWeek(
    cells: (IPayrollCell | null)[]
  ): (IPayrollCell | null)[] {
    return cells?.slice(7, 14);
  }

  function getCurrentDayCells(
    contacts: IContactTimesheets[],
    index: number,
    currentView: string
  ): (IPayrollCell | null)[] {
    const dayArray: (IPayrollCell | null)[] = [];
    if (currentView === "CALENDAR")
      contacts.forEach((contact) => {
        dayArray.push(contact.payrollCellsInRange._calendar[index]);
      });
    else if (currentView === "PROJECTS")
      contacts.forEach((contact) => {
        Object.keys(contact.payrollCellsInRange).forEach((id) => {
          if (id === "_calendar") return;
          dayArray.push(contact.payrollCellsInRange[id][index]);
        });
      });

    return dayArray;
  }

  function getEmployeeGroupSetting(settings: IRecord[]) {
    return (
      (settings.find((s) => s.id === "payroll_contact_groups")
        ?.value as string) ?? ""
    );
  }

  function getShiftTypeSettings(settings: IRecord[]) {
    const setting = settings.find((s) => TimesheetsShiftTypes.SETTING === s.id);
    if (!setting) return null;
    return JSON.parse((setting?.value as string) ?? "{}");
  }

  function getPayrollPeriod(settings: IRecord[]): IPayrollPeriod {
    const start =
      settings.find((s) => s.id === "payrollPeriodStartDay")?.value ?? 0;
    const end =
      settings.find((s) => s.id === "payrollPeriodEndDay")?.value ?? 6;
    return { startDay: start as number, endDay: end as number };
  }

  function getExcludedContactIds(settings: IRecord[]): string {
    return (
      (settings.find((s) => s.id === "payroll_contacts_exclude")
        ?.value as string) ?? ""
    );
  }

  function newContactTimesheetsRecord(): IContactTimesheets {
    return reactive({
      id: "",
      name: "",
      timesheets: [],
      mappedTimesheets: {},
      payrollCellsInRange: { _calendar: [] },
    });
  }

  function newMappedTimesheetObject(
    d: number,
    t: ITimesheet[],
    p: IMappedPayrollCells,
    publicHoliday = false
  ): IMappedTimesheetObject {
    return reactive({
      date: d,
      timesheets: t,
      payrollItem: p,
      publicHoliday: publicHoliday,
    });
  }

  function newPayrollCell(): IPayrollCell {
    return reactive({
      contactid: "",
      timesheets: [],
      startString: "",
      lunchBreak: false,
      smokoBreak: false,
      end: 0,
      start: 0,
      status: TimesheetsStatus.NOT_SET,
      shifts: [],
      shiftTimes: newShiftTypes(),
      projectTimes: [],
      numberOfTimesheets: 0,
      _selected: false,
      _updated: false,
    });
  }

  function newShiftTypes(): IShiftTypes {
    return reactive({
      regular: 0,
      overtime1: 0,
      overtime2: 0,
      annualLeave: 0,
      otherLeave: 0,
      personalLeave: 0,
      rdoTaken: 0,
      sickLeave: 0,
      unpaidLeave: 0,
      allowance: 0,
      other: 0,
    });
  }

  async function newProjectTime(projectId: string): Promise<IProjectTime> {
    return reactive({
      projectId: projectId,
      projectName:
        (
          await utils.getUpviseLocalForageRecord(
            "unybiz.projects.projects",
            projectId
          )
        )?.name ?? "",
      hours: 0,
    });
  }

  function mapTimesheets(
    contacts: IRecord[],
    groupId: string,
    excludedContacts: string
  ) {
    const timesheets = Object.values(
      upvise.entityData(useTableNames.PAYROLL_TIMESHEETS)
    ) as unknown as ITimesheet[];

    return orderBy(
      contacts
        .filter(
          (c) => inCorrectGroup(c, groupId) && notExcluded(c, excludedContacts)
        )
        .map((c) => {
          const mappedInfo = newContactTimesheetsRecord();
          mappedInfo.id = c.id as string;
          mappedInfo.name = c.name as string;
          mappedInfo.timesheets = timesheets.filter(
            (t) => t.contactid === c.id
          );
          return mappedInfo;
        }),
      ["name"],
      ["asc"]
    );
  }

  function inCorrectGroup(contact: IRecord, groupIds: string) {
    return groupIds
      .split("|")
      .some((g) =>
        contact.groupid
          ?.toString()
          .toLowerCase()
          .trim()
          .includes(g.toLowerCase().trim())
      );
  }

  function notExcluded(contact: IRecord, excludedIds: string) {
    return !excludedIds
      .split("|")
      .some(
        (id) =>
          contact.id?.toString().toLowerCase().trim() ===
          id.toLowerCase().trim()
      );
  }

  function getTimesheetsInDateRange(
    dates: number[],
    contactTimesheets: IContactTimesheets,
    isWeekTotal = false
  ): IMappedPayrollCellsInRange {
    const final: IMappedPayrollCellsInRange = {
      _calendar: initialiseDateRangeArray(),
    };

    // iterate over the dates based on the selectedDate to find matching attendance details
    dates.forEach((date, index) => {
      const dateString = momentToDateString(date);
      if (contactTimesheets.mappedTimesheets[dateString]) {
        const payrollCells =
          contactTimesheets.mappedTimesheets[dateString].payrollItem;
        Object.keys(payrollCells).forEach((id) => {
          if (!final[id]) final[id] = initialiseDateRangeArray();
          final[id][index] = payrollCells[id];
        });
        return;
      }

      const found = contactTimesheets.timesheets.filter((timesheet) =>
        moment(date).isSame(moment(timesheet.startepoch), "day")
      );

      const payrollCells = calculateNewPayrollCells(
        found,
        contactTimesheets.id
      );

      contactTimesheets.mappedTimesheets[dateString] = newMappedTimesheetObject(
        date,
        found,
        payrollCells
      );

      Object.keys(payrollCells).forEach((id) => {
        if (!id) return;
        if (!final[id]) final[id] = initialiseDateRangeArray();
        final[id][index] = payrollCells[id];
      });
    });

    if (isWeekTotal) {
      Object.keys(final).forEach((id) => {
        final[id] = final[id].slice(7, 14);
      });
    }

    return final;
  }

  function momentToDateString(date: number) {
    return moment(date).format("DD/MM/YYYY");
  }

  function calculateNewPayrollCells(
    timesheets: ITimesheet[],
    contactId: string
  ): IMappedPayrollCells {
    const newCells: IMappedPayrollCells = { _calendar: null };
    if (timesheets.length < 1) return newCells;

    newCells._calendar = newPayrollCell();
    newCells._calendar.numberOfTimesheets = timesheets.length;

    timesheets.forEach(async (t) => {
      const projectId = t.projectid ? t.projectid : NO_PROJECT_ID;
      if (!newCells[projectId]) newCells[projectId] = newPayrollCell();

      const generalCell = newCells._calendar;
      const projectCell = newCells[projectId];

      if (!generalCell || !projectCell) return;

      generalCell.timesheets.push(t);
      projectCell.timesheets.push(t);

      generalCell.contactid = contactId;
      projectCell.contactid = contactId;

      if (t.breaks && t.breaks !== "{}" && t.breaks !== "null") {
        const breaks = JSON.parse(t.breaks) as ITimesheetBreaks;
        if (breaks.lunch === "1") {
          generalCell.lunchBreak = true;
          projectCell.lunchBreak = true;
        }
        if (breaks.smoko === "1") {
          generalCell.smokoBreak = true;
          projectCell.smokoBreak = true;
        }
      }

      if (newCells._calendar!.end < t.endepoch) generalCell.end = t.endepoch;
      if (projectCell.end < t.endepoch) projectCell.end = t.endepoch;

      if (generalCell.start === 0 || generalCell.start > t.startepoch) {
        generalCell.start = t.startepoch;
        generalCell.startString = t.start;
      }
      if (projectCell.start === 0 || projectCell.start > t.startepoch) {
        projectCell.start = t.startepoch;
        projectCell.startString = t.start;
      }

      if (generalCell.status === TimesheetsStatus.NOT_SET)
        generalCell.status = t.status;
      else if (generalCell.status !== t.status)
        generalCell.status = TimesheetsStatus.CONFLICTING_STATUS;

      if (projectCell.status === TimesheetsStatus.NOT_SET)
        projectCell.status = t.status;
      else if (projectCell.status !== t.status)
        projectCell.status = TimesheetsStatus.CONFLICTING_STATUS;
    });

    return newCells;
  }

  function calculateShiftTimes(
    times: IShift[],
    shiftTypeIds: Record<string, string>
  ): IShiftTypes {
    const hours: IShiftTypes = newShiftTypes();
    times.forEach((t) => {
      if (shiftTypeIds[TimesheetsShiftTypes.REGULAR].includes(t.name)) {
        hours.regular = useNumberOperations.sum(hours.regular, t.qty, 1);
      } else if (
        shiftTypeIds[TimesheetsShiftTypes.OVERTIME_1].includes(t.name)
      ) {
        hours.overtime1 = useNumberOperations.sum(hours.overtime1, t.qty, 1);
      } else if (
        shiftTypeIds[TimesheetsShiftTypes.OVERTIME_2].includes(t.name)
      ) {
        hours.overtime2 = useNumberOperations.sum(hours.overtime2, t.qty, 1);
      } else if (
        shiftTypeIds[TimesheetsShiftTypes.ANNUAL_LEAVE].includes(t.name)
      ) {
        hours.annualLeave = useNumberOperations.sum(
          hours.annualLeave,
          t.qty,
          1
        );
      } else if (
        shiftTypeIds[TimesheetsShiftTypes.OTHER_LEAVE].includes(t.name)
      ) {
        hours.otherLeave = useNumberOperations.sum(hours.otherLeave, t.qty, 1);
      } else if (
        shiftTypeIds[TimesheetsShiftTypes.PERSONAL_LEAVE].includes(t.name)
      ) {
        hours.personalLeave = useNumberOperations.sum(
          hours.personalLeave,
          t.qty,
          1
        );
      } else if (
        shiftTypeIds[TimesheetsShiftTypes.RDO_TAKEN].includes(t.name)
      ) {
        hours.rdoTaken = useNumberOperations.sum(hours.rdoTaken, t.qty, 1);
      } else if (
        shiftTypeIds[TimesheetsShiftTypes.SICK_LEAVE].includes(t.name)
      ) {
        hours.sickLeave = useNumberOperations.sum(hours.sickLeave, t.qty, 1);
      } else if (
        shiftTypeIds[TimesheetsShiftTypes.UNPAID_LEAVE].includes(t.name)
      ) {
        hours.unpaidLeave = useNumberOperations.sum(
          hours.unpaidLeave,
          t.qty,
          1
        );
      } else if (
        shiftTypeIds[TimesheetsShiftTypes.ALLOWANCE].includes(t.name)
      ) {
        hours.allowance = useNumberOperations.sum(hours.allowance, t.qty, 1);
      } else if (shiftTypeIds[TimesheetsShiftTypes.OTHER].includes(t.name)) {
        hours.other = useNumberOperations.sum(hours.other, t.qty, 1);
      }
    });

    return hours;
  }

  async function caclulateProjectTimes(times: IShift[]) {
    const projectTimes: Record<string, IProjectTime> = {};
    for (const t of times) {
      if (!projectTimes[t.projectid])
        projectTimes[t.projectid] = await newProjectTime(t.projectid).then(
          (r) => r
        );
      projectTimes[t.projectid].hours = useNumberOperations.sum(projectTimes[t.projectid].hours, t.qty);
    }
    return Object.values(projectTimes);
  }

  // function convertMinutesToHours(minutes: number) {
  //   return useNumberOperations.round(minutes / 60);
  // }
  //
  // function calculateTimeMinusBreaks(
  //   totalTimeSeconds: number,
  //   breaks: ITimesheetBreaks
  // ): number {
  //   return (
  //     totalTimeSeconds -
  //     (breaks.breakDuration_lunch ?? 0) * 60 -
  //     (breaks.breakDuration_smoko ?? 0) * 60
  //   );
  // }

  function combineShiftTimes(...shifts: IShiftTypes[]): IShiftTypes {
    if (!shifts || shifts.length == 0) return newShiftTypes();
    return shifts?.reduce((a, b) => {
      return {
        annualLeave: useNumberOperations.sum(a.annualLeave, b.annualLeave),
        otherLeave: useNumberOperations.sum(a.otherLeave, b.otherLeave),
        regular: useNumberOperations.sum(a.regular, b.regular),
        overtime1: useNumberOperations.sum(a.overtime1, b.overtime1),
        overtime2: useNumberOperations.sum(a.overtime2, b.overtime2),
        personalLeave: useNumberOperations.sum(
          a.personalLeave,
          b.personalLeave
        ),
        rdoTaken: useNumberOperations.sum(a.rdoTaken, b.rdoTaken),
        sickLeave: useNumberOperations.sum(a.sickLeave, b.sickLeave),
        unpaidLeave: useNumberOperations.sum(a.unpaidLeave, b.unpaidLeave),
        allowance: useNumberOperations.sum(a.allowance, b.allowance),
        other: useNumberOperations.sum(a.other, b.other),
      };
    });
  }

  function combinePayrollCellShiftTimes(
    ...items: (IPayrollCell | null)[]
  ): IShiftTypes {
    return combineShiftTimes(
      ...items.map((x) => {
        if (x?.shiftTimes) return x.shiftTimes;
        else return newShiftTypes();
      })
    );
  }

  // function totalHours(hours: IShiftTypes) {
  //   return hours.regular + hours.overtime1 + hours.overtime2;
  // }

  function countTimesheetsByStatus(
    timesheetsByContact: IContactTimesheets[],
    timesheetsByProject: IProjects[],
    status: number,
    view: string
  ) {
    let count = 0;

    if (view === "CALENDAR")
      timesheetsByContact.forEach((t) => {
        count += getCurrentWeek(t.payrollCellsInRange._calendar).filter(
          (cell) => cell && cell.status === status
        ).length;
      });
    else if (view === "PROJECTS")
      timesheetsByProject.forEach((project) => {
        project.contacts.forEach((t) => {
          count += getCurrentWeek(t.payrollCellsInRange[project.id]).filter(
            (cell) => cell && cell.status === status
          ).length;
        });
      });

    return count;
  }

  function filterPayrollCells(
    payRollCells: (IPayrollCell | null)[],
    status: number | null,
    projectId: string
  ): IMappedPayrollCellsInRange {
    const filteredCells: IMappedPayrollCellsInRange = { _calendar: [] };
    filteredCells[projectId] = payRollCells?.map((cell) => {
      if (cell !== null && status !== null && cell.status !== status) {
        cell._selected = false;
        return null;
      } else return cell;
    });
    // Object.keys(payRollCells).forEach((id) => {
    //   filteredCells[id] = payRollCells[id].map((cell) => {
    //     if (cell !== null && status !== null && cell.status !== status) {
    //       cell._selected = false;
    //       return null;
    //     } else return cell;
    //   });
    // });
    return filteredCells;
  }

  function showContact(
    contact: IContactTimesheets,
    status: number | null,
    search: string,
    projectId = "_calendar"
  ) {
    if (status === null && search === "") return true;
    else {
      if (
        (status === null
          ? true
          : getCurrentWeek(contact.payrollCellsInRange[projectId])?.some(
              (cell) => cell !== null && cell.status === status
            ) || false) &&
        (search === ""
          ? true
          : contact.name.toLowerCase().includes(search.toLowerCase()))
      )
        return true;
      else {
        deselectEntireRow(contact, projectId);
        return false;
      }
    }
  }

  // deselects contact row in project view for projectId. If no projectId is specified, deselects contact row in calendar view
  function deselectEntireRow(
    contact: IContactTimesheets,
    projectId = "_calendar"
  ) {
    Object.values(contact.mappedTimesheets).forEach((mappedTimesheet) => {
      const payrollCell = mappedTimesheet.payrollItem[projectId];
      if (payrollCell) payrollCell._selected = false;
    });
  }

  // deselects column for projects or calendar view
  function deselectEntireColumn(
    contacts: IContactTimesheets[],
    index: number,
    view: string
  ) {
    contacts.forEach((contact) => {
      if (view === "CALENDAR") {
        const payrollCell = contact.payrollCellsInRange?._calendar?.[index];

        if (payrollCell) payrollCell._selected = false;
      } else if (view === "PROJECTS") {
        Object.entries(contact.payrollCellsInRange).forEach(
          ([string, payrollCellsInRange]) => {
            if (string !== "_calendar") {
              const payrollCell = payrollCellsInRange[index];

              if (payrollCell) payrollCell._selected = false;
            }
          }
        );
      }
    });
  }

  function initialiseDateRangeArray() {
    return new Array(21).fill(null);
  }

  function initialiseTimePeriod(payrollPeriod: IPayrollPeriod) {
    try {
      const result = window.eval("PayrollProcessor.initializePayrollPeriod()");
      if (result) return result.start;
    } catch {
      return getWeekStart(payrollPeriod);
    }
  }

  function getWeekStart(payrollPeriod: IPayrollPeriod, selectedDate?: number) {
    const currentDate = selectedDate ? moment(selectedDate) : moment();
    return useDateOperations.getStartOfWeek(
      currentDate.valueOf(),
      payrollPeriod.startDay
    );
  }

  function getWeekEnd(start: number) {
    return moment(start).add(6, "d").valueOf();
  }

  function updateTimePeriod(start: number, end: number): boolean {
    //console.log("updating time period: " + start + " to " + end);
    try {
      window.Engine.eval(
        `PayrollProcessor.setPayrollPeriod(${start}, ${end})`,
        0
      );
      return true;
    } catch {
      console.log(
        "Unable to update the PayrollProcessor.TimePeriod. This will affect being able to approve shifts."
      );
      return false;
    }
  }

  function getProcessedContactsArray() {
    try {
      const result = window.eval(
        "PayrollProcessor.getProcessedContactsAfterUpdate()"
      );
      //console.log("the result from the upvise function: ", result);
      if (result) return result;
      else return null;
    } catch {
      console.log(
        "Unable to get the PayrollProcessor.ProcessedContacts array. This will affect being able to approve shifts."
      );
      return null;
    }
  }

  async function updateUpvisePayroll(
    weekStart: number,
    weekEnd: number,
    contacts: IContactTimesheets[],
    shiftIds: Record<string, string>
  ): Promise<number> {
    let addedNewCell = false;
    if (!updateTimePeriod(weekStart, weekEnd)) return -1;

    const processedContactsArray = getProcessedContactsArray();
    if (
      processedContactsArray === null &&
      !Array.isArray(processedContactsArray)
    )
      return -1;
    const processedContacts = Object.assign(
      {},
      ...processedContactsArray.map((c: any) => ({ [c.id]: c }))
    );
    console.log("Processed Contacts: ", processedContacts);
    console.log("Contacts: ", contacts);

    for (const contact of contacts) {
      const id = contact.id;
      const dayShifts = processedContacts[id]?.dayCalcs;
      if (!dayShifts) {
        console.log("No day shifts found for " + contact.name);
        continue;
      }
      for (const day of Object.keys(dayShifts)) {
        const payrollCellIndex = findPayrollCellIndexByDate(
          contact.payrollCellsInRange._calendar,
          day
        );
        const status =
          processedContacts[id]?.discoveredDays[day]?.status ??
          contact.payrollCellsInRange._calendar[payrollCellIndex];

        if (payrollCellIndex < 0) {
          addedNewCell = true;
          const date = moment(day, UPVISE_DATE_FORMAT).valueOf();
          const newPayrollCells: IMappedPayrollCells = {
            _calendar: newPayrollCell(),
          };
          dayShifts[day].forEach((x: IShift) => {
            const id = x.projectid ? x.projectid : NO_PROJECT_ID;
            if (!newPayrollCells[id]) newPayrollCells[id] = newPayrollCell();
          });

          for (const id of Object.keys(newPayrollCells)) {
            const relevantDayCalcs = dayShifts[day].filter((x: IShift) =>
              id === "_calendar"
                ? true
                : x.projectid.toLowerCase() === id.toLowerCase()
            );
            if (relevantDayCalcs.length < 1) newPayrollCells[id] = null;
            const payrollCell = newPayrollCells[id];
            if (!payrollCell) continue;
            await assignDayCalcsToCell(
              payrollCell,
              relevantDayCalcs,
              status,
              id,
              shiftIds
            );
          }

          contact.mappedTimesheets[momentToDateString(date)] =
            newMappedTimesheetObject(
              date,
              [],
              newPayrollCells,
              checkPublicHoliday(dayShifts[day])
            );
        } else {
          for (const id of Object.keys(contact.payrollCellsInRange)) {
            const relevantDayCalcs = dayShifts[day].filter((x: IShift) =>
              id === "_calendar"
                ? true
                : x.projectid.toLowerCase() === id.toLowerCase()
            );
            if (relevantDayCalcs.length < 1)
              contact.payrollCellsInRange[id][payrollCellIndex] = null;
            const payrollCell =
              contact.payrollCellsInRange[id][payrollCellIndex];
            if (!payrollCell) continue;
            await assignDayCalcsToCell(
              payrollCell,
              relevantDayCalcs,
              status,
              id,
              shiftIds
            );
          }
        }
      }
    }
    return addedNewCell ? 1 : 0;
  }

  async function assignDayCalcsToCell(
    payrollCell: IPayrollCell,
    dayShifts: IShift[],
    status: number,
    id: string,
    shiftIds: Record<string, string>
  ) {
    const relevantTimesheetIds = new Set(
      dayShifts.map((shift) => shift.timesheetid)
    );

    payrollCell.shifts = dayShifts;
    payrollCell.timesheets = payrollCell.timesheets.filter((timesheet) =>
      relevantTimesheetIds.has(timesheet.id)
    );
    payrollCell.numberOfTimesheets = payrollCell.timesheets.length;

    if (!payrollCell._updated)
      payrollCell.status =
        id === "_calendar" ? status : getStatusFromDayCalcs(payrollCell.shifts);

    payrollCell.shiftTimes = calculateShiftTimes(dayShifts, shiftIds);
    payrollCell.projectTimes = await caclulateProjectTimes(dayShifts);
    if (!dayShifts || dayShifts.length < 1) {
      payrollCell._hasError = true;
    }
    payrollCell._updated = true;
  }

  function getStatusFromDayCalcs(dayCalcs: IShift[]): TimesheetsStatus {
    let status: TimesheetsStatus | null = null;

    dayCalcs.forEach((shift) => {
      if (status === null) status = shift.status;
      else if (status !== shift.status)
        status = TimesheetsStatus.CONFLICTING_STATUS;
    });

    return status ?? TimesheetsStatus.NOT_SET;
  }

  function checkPublicHoliday(dayCalcs: IShift[]): boolean {
    return dayCalcs.some((d) => d.timesheetid === "PAYROLL_PUBLIC_HOLIDAY");
  }

  function findPayrollCellIndexByDate(
    allPayrollCells: (IPayrollCell | null)[],
    day: string
  ): number {
    return allPayrollCells.findIndex((p) => {
      if (p) return moment(p.start).format(UPVISE_DATE_FORMAT) === day;
    });
  }

  function updateAccrualHistory(shifts: IShift[], status: TimesheetsStatus) {
    const shiftsString = JSON.stringify(shifts);

    try {
      window.Engine.eval(
        `PayrollProcessor.updateAccrualHistoryFrontend('${shiftsString}', ${
          status === TimesheetsStatus.REJECTED ? false : true
        })`,
        0
      );
      return true;
    } catch {
      console.log("Unable to update Accrual History.");
      return false;
    }
  }

  function insertApprovedPublicHolidayTimesheet(shifts: IShift[]) {
    try {
      window.Engine.eval(
        `PayrollProcessor.updateAccrualHistoryFrontend(${shifts})`,
        0
      );
      return true;
    } catch {
      console.log("Unable to insert approved public holiday timesheet.");
      return false;
    }
  }

  function doSaveModelEntities(payload: {
    [useTableNames.PAYROLL_TIMESHEETS]?: IRecord[];
  }): Promise<void> {
    return upvise.update(payload as Record<string, IRecord[]>);
  }

  function updateTimesheets(
    contactData: IContactTimesheets[],
    shiftMap: {
      approvedTimesMap: Record<string, IShift[]>;
      dates: string[];
      contacts: string[];
    },
    status: TimesheetsStatus
  ) {
    const timesheetsToSave: IRecord[] = [];

    // Specify timesheets to update using the map
    Object.entries(shiftMap.approvedTimesMap).forEach(
      ([timesheetId, shifts]) => {
        if (
          timesheetId === "PAYROLL_PUBLIC_HOLIDAY" &&
          status === TimesheetsStatus.APPROVED
        ) {
          insertApprovedPublicHolidayTimesheet(shifts);
        } else if (timesheetId !== "PAYROLL_PUBLIC_HOLIDAY") {
          const timesheet: IRecord = {
            id: timesheetId,
            status: status,
          };

          if (
            status === TimesheetsStatus.APPROVED ||
            status === TimesheetsStatus.SENT
          )
            timesheet.approvedTimes = JSON.stringify(shifts);

          timesheetsToSave.push(timesheet);
        }
      }
    );

    return doSaveModelEntities({
      [useTableNames.PAYROLL_TIMESHEETS]: timesheetsToSave,
    }).then(() => {
      return new Promise<void>((resolve) => {
        setTimeout(() => {
          updatePayrollCells(contactData, shiftMap.dates, shiftMap.contacts);

          Object.values(shiftMap.approvedTimesMap).forEach((shifts) => {
            updateAccrualHistory(shifts, status);
          });

          resolve();
        }, 5000);
      });
    });
  }

  // Add payroll cell information to approved times map, dates set and contacts set
  function addPayrollCellInformation(
    payrollCell: IPayrollCell,
    contactId: string,
    approvedTimesMap: Record<string, IShift[]>,
    dates: Set<string>,
    contacts: Set<string>
  ) {
    contacts.add(contactId);
    dates.add(momentToDateString(payrollCell.start));
    payrollCell.shifts.forEach((shift) => {
      if (!(shift.timesheetid in approvedTimesMap))
        approvedTimesMap[shift.timesheetid] = [];

      approvedTimesMap[shift.timesheetid].push(shift);
    });
  }

  // Build approvedTimesMap (key is the timesheetid and the value is an array of the shifts)
  function buildShiftsMapCalendar(contactData: IContactTimesheets[]): {
    approvedTimesMap: Record<string, IShift[]>;
    dates: string[];
    contacts: string[];
  } {
    const approvedTimesMap: Record<string, IShift[]> = {};
    const dates = new Set<string>();
    const contacts = new Set<string>();

    contactData.forEach((contact) => {
      Object.values(contact.mappedTimesheets).forEach((mappedTimesheet) => {
        const payrollCell = mappedTimesheet.payrollItem._calendar;

        if (payrollCell?._selected) {
          addPayrollCellInformation(
            payrollCell,
            contact.id,
            approvedTimesMap,
            dates,
            contacts
          );
        }
      });
    });

    return {
      approvedTimesMap: approvedTimesMap,
      dates: [...dates],
      contacts: [...contacts],
    };
  }

  // Build approvedTimesMap (key is the timesheetid and the value is an array of the shifts)
  function buildShiftsMapProjects(contactData: IContactTimesheets[]): {
    approvedTimesMap: Record<string, IShift[]>;
    dates: string[];
    contacts: string[];
  } {
    const approvedTimesMap: Record<string, IShift[]> = {};
    const dates = new Set<string>();
    const contacts = new Set<string>();

    contactData.forEach((contact) => {
      Object.values(contact.mappedTimesheets).forEach((mappedTimesheet) => {
        Object.entries(mappedTimesheet.payrollItem).forEach(
          ([string, payrollCell]) => {
            if (string !== "_calendar" && payrollCell?._selected)
              addPayrollCellInformation(
                payrollCell,
                contact.id,
                approvedTimesMap,
                dates,
                contacts
              );
          }
        );
      });
    });

    return {
      approvedTimesMap: approvedTimesMap,
      dates: [...dates],
      contacts: [...contacts],
    };
  }

  function setSelectedStatus(
    contactData: IContactTimesheets[],
    status: number,
    view: string
  ) {
    let shiftMap: {
      approvedTimesMap: Record<string, IShift[]>;
      dates: string[];
      contacts: string[];
    };

    if (view === "CALENDAR") shiftMap = buildShiftsMapCalendar(contactData);
    else if (view === "PROJECTS")
      shiftMap = buildShiftsMapProjects(contactData);
    else shiftMap = { approvedTimesMap: {}, dates: [], contacts: [] };

    return updateTimesheets(contactData, shiftMap, status);
  }

  function selectedPayrollCells(contactData: IContactTimesheets[]) {
    const map: IRecord[] = [];

    contactData.forEach((contact) => {
      Object.values(contact.mappedTimesheets).forEach((mappedTimesheet) => {
        if (
          mappedTimesheet.payrollItem &&
          mappedTimesheet.payrollItem._selected
        ) {
          map.push({
            contact: contact.name,
            payroll: mappedTimesheet.payrollItem as unknown as any,
          });
        }
      });
    });

    //console.log("selected payroll cells", map);
  }

  function updatePayrollCells(
    contactData: IContactTimesheets[],
    dates: string[],
    contacts: string[]
  ) {
    const timesheetsData = upvise.entityData(
      useTableNames.PAYROLL_TIMESHEETS
    ) as unknown as Record<string, ITimesheet>;

    contactData.forEach((contact) => {
      if (contacts.includes(contact.id)) {
        dates.forEach((date) => {
          const payrollCellsMap = contact.mappedTimesheets?.[date]?.payrollItem;
          if (payrollCellsMap)
            Object.values(payrollCellsMap).forEach((payrollCell) => {
              if (payrollCell)
                updatePayrollCellStatus(payrollCell, timesheetsData);
            });
        });
      }
    });
  }

  function updatePayrollCellStatus(
    payrollCell: IPayrollCell,
    timesheetsData: Record<string, ITimesheet>
  ) {
    if (payrollCell && payrollCell.timesheets.length > 0) {
      console.log("payroll cell to update", payrollCell);
      let newStatus: TimesheetsStatus | null = null;

      payrollCell.timesheets.forEach((timesheet) => {
        // Payroll cell timesheets do not reference objects in store after it has been updated (Probably to do with how updating the store is handled)
        const updatedTimesheetRecord = timesheetsData[timesheet.id];

        if (updatedTimesheetRecord) {
          console.log("updatedTimesheetRecord", updatedTimesheetRecord);
          if (newStatus === null) newStatus = updatedTimesheetRecord.status;
          else if (newStatus !== updatedTimesheetRecord.status)
            newStatus = TimesheetsStatus.CONFLICTING_STATUS;
        }
      });

      console.log("newStatus", newStatus);
      payrollCell.status = newStatus ?? TimesheetsStatus.NOT_SET;
    }
  }

  return {
    state,
    week,
    legendOptions,
    fetch,
    getMetadata,
    getForageData,
    getCurrentWeek,
    getCurrentDayCells,
    getEmployeeGroupSetting,
    getShiftTypeSettings,
    getPayrollPeriod,
    getExcludedContactIds,
    mapTimesheets,
    getTimesheetsInDateRange,
    combinePayrollCellShiftTimes,
    countTimesheetsByStatus,
    filterPayrollCells,
    showContact,
    deselectEntireRow,
    deselectEntireColumn,
    initialiseTimePeriod,
    getWeekStart,
    getWeekEnd,
    updateUpvisePayroll,
    setSelectedStatus,
    selectedPayrollCells,
    updatePayrollCells,
    doSaveModelEntities,
  };
}
