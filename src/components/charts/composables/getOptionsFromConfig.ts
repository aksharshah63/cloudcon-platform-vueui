import { IChartConfig, IGenericChartConfig } from "../types/ChartInterfaces";
import { Options } from "highcharts";
// const _ = require("lodash");
import _ from "lodash";

const fieldLocation: { [key: string]: string[] } = {
  type: ["chart", "type"],
  title: ["title", "text"],
  subtitle: ["subtitle", "text"],
  categories: ["xAxis", "categories"],
  xAxisTitle: ["xAxis", "title", "text"],
  yAxisTitle: ["yAxis", "title", "text"],
  yAxisFormat: ["yAxis", "labels", "format"],
  legend: ["legend", "enabled"],
  backgroundColor: ["chart", "backgroundColor"],
  yAxisVisible: ["yAxis", "visible"],
  xAxisVisible: ["xAxis", "visible"],
  xAxisLineWidth: ["xAxis", "lineWidth"],
  styledMode: ["chart", "styledMode"],
  columnRadius: ["plotOptions", "column", "borderRadius"],
  borderWidth: ["plotOptions", "column", "borderWidth"],
  colors: ["colors"],
  dataLabels: ["plotOptions", "column", "dataLabels"],
  pointPadding: ["plotOptions", "column", "pointPadding"],
  groupPadding: ["plotOptions", "column", "groupPadding"],
  marginTop: ["chart", "marginTop"],
  height: ["chart", "height"],
  className: ["plotOptions", "series", "className"],
  plotOptions: ["plotOptions"],
  tooltip: ["tooltip"],
};

export default function getOptionsFromConfig(
  config: IChartConfig | IGenericChartConfig
): Options {
  const options = {};
  for (const field in config) {
    if (field in fieldLocation)
      _.merge(options, buildNewOption(fieldLocation[field], config[field]));
  }

  return options;
}

function buildNewOption(loc: string[], val: any): any {
  if (loc.length == 1) {
    return { [loc[0]]: val };
  } else {
    return { [loc[0]]: buildNewOption(loc.slice(1), val) };
  }
}
