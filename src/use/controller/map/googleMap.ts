import localforage from "localforage";
import moment from "moment";

export default function useControllerGoogleMap() {
  //     '<div id="content">' +
  //     '<h1 id="firstHeading" class="firstHeading">Test</h1>' +
  //     '<div id="bodyContent">' +
  //     "<p> " +
  //     '<a href="https://en.wikipedia.org/w/index.php?title=Uluru&oldid=297882194">' +
  //     "test</a> " +
  //     "</p>" +
  //     "</div>" +
  //     "</div>";

  async function getCentre(
    jobs: Record<string, any>[]
  ): Promise<Record<string, any>> {
    let totalLength = 0;
    let totalLat = 0;
    let totalLng = 0;
    for (const i of jobs) {
      if (i.geo == "") continue;

      totalLength += 1;
      for (const [index, coord] of i.geo.split(",").entries()) {
        if (index == 0) totalLat += parseFloat(coord);
        else totalLng += parseFloat(coord);
      }
    }

    if (totalLength == 0) return { lat: 0, lng: 0 };
    return { lat: totalLat / totalLength, lng: totalLng / totalLength };
  }

  async function jobToGoogleMapData(
    jobsReal: Record<string, any>[]
  ): Promise<Record<string, any>[]> {
    const jobs = JSON.parse(JSON.stringify(jobsReal));
    const gMapData: Record<string, any>[] = [];
    for (const i of jobs) {
      const jobRecord: Record<string, any> = {};
      const coords: Record<string, any> = {};
      if (i.geo == "") continue;

      for (const [index, coord] of i.geo.split(",").entries()) {
        if (index == 0) coords["lat"] = parseFloat(coord);
        else coords["lng"] = parseFloat(coord);
      }

      const jobType: string = await getJobType(i.custom);
      jobRecord.address = i.address;
      jobRecord.label = i.owner
        .split(" ")
        .map((name: string) => name.charAt(0))
        .join("")
        .toUpperCase();
      jobRecord.id = i.id;
      jobRecord.owner = i.owner !== "" ? i.owner : "Unassigned";
      jobRecord.name = i.name;
      jobRecord.location = coords;
      jobRecord.jobType = jobType;
      jobRecord.date = moment(i.duedate).format("LLLL");

      gMapData.push(jobRecord);
    }
    return gMapData;
  }

  async function getJobType(customString: string): Promise<string> {
    const custom = customString != "" ? JSON.parse(customString) : {};
    const localForageInstance = localforage.createInstance({
      name: "upvise",
      storeName: "tables",
    });

    const settings = await localForageInstance
      .getItem("system.user.settings")
      .then((results: unknown) => {
        return (results as { name: string; items: Record<string, any>[] })
          .items;
      });

    const jobTypeField = settings.find(
      (setting: Record<string, string>) => setting.id === "CUSTOM_JOB_TYPE"
    );
    if (jobTypeField) {
      if (jobTypeField.value in custom) return custom[jobTypeField.value];
    }
    return "";
  }

  async function getEmployees() {
    const localForageInstance = localforage.createInstance({
      name: "upvise",
      storeName: "tables",
    });

    const employees = await localForageInstance
      .getItem("unybiz.contacts.contacts")
      .then((results: unknown) => {
        return (results as { name: string; items: Record<string, any>[] })
          .items;
      });

    return employees.map((employee) => {
      return { name: employee.name };
    });
  }

  function goToJob(id: string) {
    return window.Engine.eval("Jobs.viewJob('" + id + "')", 0);
  }

  function writeJobContentString(record: Record<string, any>): string {
    const contentString =
      '<div id="content">' +
      '<h3 id="firstHeading" class="firstHeading"><b>' +
      record.name +
      "</b></h3>" +
      '<h4 style="color:' +
      (record.owner !== "Unassigned" ? "blue" : "red") +
      '">' +
      record.owner +
      "</h4>" +
      '<div id="bodyContent">' +
      "<p> " +
      "<b>" +
      record.jobType +
      "</b><br>" +
      record.date +
      "<br><br>" +
      record.address +
      "<br><br>" +
      '<div style="color:blue" onclick= "window.Engine.eval(\'Jobs.viewJob(\\\'' +
      record.id +
      "\\')', 0)\">" +
      "Go To Job </div> " +
      "</p>" +
      "</div>" +
      "</div>";

    return contentString;
  }

  return {
    jobToGoogleMapData,
    getEmployees,
    getCentre,
    writeJobContentString,
    goToJob,
  };
}
