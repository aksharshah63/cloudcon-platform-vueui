import useLocalForage from "../../../use/utils/useLocalForage";
import { IRecord, IUpvise } from "../../../store/modules/upvise.d";
import { IProjectDetails } from "./planner.d";

export default function useControllerProjectDetails(upvise: IUpvise) {
  const state = upvise.state();
  const projectid = upvise.upviseSelector[0];

  const fetch = () => upvise.fetch("project");
  const getMetadata = () => upvise.metadata("project");
  const getForageData = async () => await useLocalForage.getDataForkeys([
    "uny.notes.fields",
  ], useLocalForage.getInstance("upvise", "tables"));

  const getProject = () =>
    upvise.recordData("TableUnybizProjectsProjects", projectid);

  const getGroupedCustomFields = async () => {
    const customFieldsData = (await getForageData())["uny.notes.fields"]
      .filter(f => f.formid === "projects")
      .sort((a, b) => Number(a.rank) - Number(b.rank));
    const groupedCustomFields: { name: string, fields: IRecord[] }[] = [];

    customFieldsData.forEach(c => {
      if (c.type === "header") {
        groupedCustomFields.push({ name: c.label as string, fields: [] });
      } else if (!groupedCustomFields.at(-1)) {
        groupedCustomFields.push({ name: "Project" as string, fields: [] });
        groupedCustomFields.at(-1)?.fields.push(c);
      } else {
        groupedCustomFields.at(-1)?.fields.push(c);
      }
    });

    return groupedCustomFields;
  };

  const doSaveModelEntities = (
    TableUnybizProjectsProject: IProjectDetails
  ): Promise<void> => {
    const payload = {
      TableUnybizProjectsProjects:
        [TableUnybizProjectsProject] as unknown as IRecord[],
    } as Record<string, IRecord[]>;
    return upvise.update(payload);
  };

  return {
    state,
    projectid,
    fetch,
    getMetadata,
    getProject,
    getGroupedCustomFields,
    doSaveModelEntities,
  };
}
