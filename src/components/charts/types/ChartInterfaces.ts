export interface IChartConfig {
  title?: string;
  subtitle?: string;
  xAxisTitle?: string;
  yAxisTitle?: string;
  legend?: boolean;
  categories?: string[];
  yAxisFormat?: string;
  backgroundColor?: string;
  yAxisVisible?: boolean;
  xAxisLineWidth?: number;
  xAxisVisible?: boolean;
  styledMode?: boolean;
  columnRadius?: number;
  borderWidth?: number;
  colors?: string[];
  dataLabels?: any;
  plotOptions?: Record<string, unknown>;
  numberOfSeries?: number;
  [key: string]: any;
}

export interface IPieChartConfig extends IChartConfig {
  seriesName?: string;
}

export interface IGenericChartConfig extends IChartConfig {
  type: string;
}
