import utils from "../../use/function/useUtils";

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export default function useParseRulesController() {
  function getRules(rules: string) {
    if (!rules) return [];
    const rulesArray: Record<string, unknown>[] = JSON.parse(rules);
    const ruleDescriptionsArray = rulesArray.map((r) => {
      const d = r.ruledetails as Record<string, unknown>;
      let operationLabel = d["operationLabel"]
        ? (d["operationLabel"] as string)
        : "";
      operationLabel = operationLabel.toLowerCase();
      let valueLabel = d["valueLabel"] ? (d["valueLabel"] as string) : "";
      valueLabel = valueLabel.toLowerCase();
      // convert epochs into readable dates/times
      if (d["type"] === "static") {
        const dateFormat =
          r.fieldtype === "time"
            ? "hh:mm a"
            : r.fieldtype === "date"
            ? "YYYY-MM-DD"
            : "YYYY-MM-DD hh:mm a";

        if (d["value"])
          d["value"] = utils.getDate(d["value"] as string, dateFormat);
        if (d["value1"])
          d["value1"] = utils.getDate(d["value1"] as string, dateFormat);
        if (d["value2"])
          d["value2"] = utils.getDate(d["value2"] as string, dateFormat);
      }

      if (d["type"] === "relative") {
        const v = d["value"] as string;
        const valueArray =
          v.charAt(0) === "+" || v.charAt(0) === "-"
            ? [
                v.charAt(0) === "+" ? "after" : "before",
                v.substring(1, v.length - 1),
                v.charAt(v.length - 1),
              ]
            : ["after", v.substring(0, v.length - 1), v.charAt(v.length - 1)];
        return `"${valueArray[1]}${valueArray[2]}" ${valueArray[0]} ${r.fieldname}`;
      } else if (d["operationLabel"] && d["value"]) {
        return `${r.fieldname} ${operationLabel} "${d["value"]}"`;
      } else if (d["operationLabel"] && d["value1"] && d["value2"]) {
        return `${r.fieldname} between "${d["value1"]}" and "${d["value2"]}"`;
      } else if (d["operationLabel"]) {
        return `${r.fieldname} is ${operationLabel}`;
      } else if (d["value"]) {
        if (r.fieldtype === "selectmulti") {
          const valueArray = d["value"] as [];
          return valueArray.length <= 1
            ? `${r.fieldname} is ${valueArray}`
            : `${r.fieldname} are ${valueArray.join(", ")}`;
        } else return `${r.fieldname} is ${d["value"]}`;
      } else {
        return `${r.fieldname}`;
      }
    });
    return ruleDescriptionsArray;
  }

  return { getRules };
}
