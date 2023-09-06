export interface IContactTimesheets {
  id: string;
  name: string;
  timesheets: ITimesheet[];
  mappedTimesheets: IMappedTimesheets;
  payrollCellsInRange: IMappedPayrollCellsInRange;
}

// Key will be the date string eg. 14/12/2021
export interface IMappedTimesheets {
  [key: string]: IMappedTimesheetObject;
}

export interface IMappedTimesheetObject {
  date: number;
  timesheets: ITimesheet[];
  payrollItem: IMappedPayrollCells;
  // publicHoliday: boolean;
}

export interface IMappedPayrollCells {
  _calendar: IPayrollCell | null;
  [key: string]: IPayrollCell | null;
}

export interface IMappedPayrollCellsInRange {
  _calendar: (IPayrollCell | null)[];
  [key: string]: (IPayrollCell | null)[];
}

export interface IPayrollCell {
  contactid: string;
  timesheets: ITimesheet[];
  startString: string;
  lunchBreak: boolean;
  smokoBreak: boolean;
  end: number;
  start: number;
  status: number; // Approved, rejected etc
  shifts: IShift[];
  shiftTimes: IShiftTypes; // Need a way of showing what is ord hrs, ot 1.5x hrs and ot 2x hrs
  projectTimes: IProjectTime[]; // This should be array of timesheet records probably?
  numberOfTimesheets: number;
  _selected: boolean;
  _hasError?: boolean;
  _updated: boolean;
}

export interface IPayrollPeriod {
  startDay: number;
  endDay: number;
}

export interface IProjects {
  id: string;
  name: string;
  contacts: IContactTimesheets[];
}

export interface IProjectTime {
  projectId: string;
  projectName: string;
  hours: number;
}

export interface IShift {
  contactid: string;
  cost: number;
  name: string;
  projectid: string;
  qty: number;
  ruleid: string;
  timesheetid: string;
  status: number;
  unallocated: number;
  updateaccrualhistory: boolean;
}

export interface IShiftTypes {
  annualLeave: number;
  otherLeave: number;
  overtime1: number;
  overtime2: number;
  personalLeave: number;
  regular: number;
  rdoTaken: number;
  sickLeave: number;
  unpaidLeave: number;
  allowance: number;
  other: number;
}

export interface ITimesheet {
  id: string;
  contactid: string;
  start: string;
  end: string;
  startepoch: number;
  endepoch: number;
  status: number;
  sourceid: string;
  sourcetable: string;
  projectid: string;
  reimbursement: number;
  breaks: string;
  employmenttype: number;
  description: string;
  shifttype: number;
  approvedTimes: string;
  jobcode: string;
  activityid: string;
  additionalinfo: string;
  projectName?: string;
  activityName?: string;
}

export interface ITimesheetBreaks {
  lunch?: string;
  breakDuration_lunch?: number;
  smoko?: string;
  breakDuration_smoko?: number;
}
