export interface IEquipmentDetails {
  numberOfForms: number;
  numberOfFormsCompleted: number;
  numberOfJobs: number;
  utilizationAverage: number;
  utilizationTotal: number;
  nextMaintenanceDate: number;
  healthStatus: string;
  avgFuelCostPerMile: number;
  avgFuelCostPerGallon: number;
  totalFuelCost: number;
  operatingCosts: number;
  servicingCosts: number;
  totalCosts: number;
  avgInvoice: number;
  totalInvoices: number;
  totalRevenue: number;
}
