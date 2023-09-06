type ICsvArray = ICsvRow[];

type ICsvRow = ICsvDataType[];

type ICsvDataType = string | number;

export default {
  export(data: ICsvArray, fileName: string): void {
    const csvString =
      "data:text/csv;charset=utf-8," + getCsvStringFromData(data);
    let encodedUri = encodeURI(csvString);
    encodedUri = encodedUri.replaceAll("#", "%23");
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${fileName}.csv`);
    document.body.appendChild(link);
    link.click();
  },

  getColumnIndex(headerRow: string[], name: string): number | undefined {
    const index: number = headerRow.findIndex(
      (n) => n.trim().toLocaleLowerCase() == name.trim().toLocaleLowerCase()
    );
    return index == -1 ? undefined : index;
  },
};

function getCsvStringFromData(data: ICsvArray): string {
  return data
    .map((row) => row.map((value) => `"${value}"`).join(","))
    .join("\n");
}
