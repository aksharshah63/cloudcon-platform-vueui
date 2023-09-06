import {
  IUpviseDataMessage,
  IUpvise,
  IGridSlicing,
  IRecord,
} from "../../../store/modules/upvise.d";
import { ILicenseManagementRecord } from "./licenseManagement.d";
import { reactive } from "vue";
import utils from "../../../use/function/useUtils";

export default function useControllerLicenseManagement(upvise: IUpvise) {
  const state = upvise.state();
  const fetch = () => upvise.fetch("licenseManagement");
  const getMetadata = () => upvise.metadata("licenseManagement");

  function setDepartmentNames() {
    const copyLicenseData = JSON.parse(
      JSON.stringify(
        Object.values(
          upvise.entityData("TableEmployeedashboardLicensemanagement")
        )
      )
    ) as IRecord[];
    const departmentLookupsData = Object.values(
      upvise.entityData("TableEmployeedashboardLookups")
    ).filter((l) => l.lookuptype === "Department");

    copyLicenseData.forEach((l) => {
      const departmentName = departmentLookupsData.find(
        (d) => d.id === l.departmentid
      );
      if (departmentName)
        l.departmentName = departmentName.lookupvalue as unknown as string;
    });

    upvise.updateStore({
      TableEmployeedashboardLicensemanagement: copyLicenseData,
    });
  }
  // function copyModelEntities(
  //   license: ILicenseManagementRecord[]
  // ): IUpviseDataMessage {
  //   const state = upvise.state(ENDPOINTS.FETCH);
  //   const result = new UpviseDataMessage(
  //     state.client,
  //     state.module,
  //     state.selection,
  //     state.configuration,
  //     state.definition
  //   );
  //   result.persistence.model.licensemanagement = new TableResponse(
  //     state.persistence.model.licensemanagement.title,
  //     state.persistence.model.licensemanagement.schema,
  //     license as unknown as ITable
  //   );

  //   return result;
  // }

  const getEditLicenseManagement = (
    licenseId: string
  ): ILicenseManagementRecord => {
    const editLicenseManagement = upvise.recordData(
      "TableEmployeedashboardLicensemanagement",
      licenseId
    ) as unknown as ILicenseManagementRecord;

    return reactive(JSON.parse(JSON.stringify(editLicenseManagement)));
  };

  const getNewLicenseManagement = () => {
    return reactive({
      id: utils.generateId(),
      departmentid: "",
      roleid: "",
      qualificationid: "",
      departmentName: "",
    } as ILicenseManagementRecord);
  };

  const doSaveLicenseManagement = (
    TableEmployeedashboardLicensemanagement: ILicenseManagementRecord[]
  ): Promise<void> => {
    const payload = {
      TableEmployeedashboardLicensemanagement:
        TableEmployeedashboardLicensemanagement as unknown as IRecord[],
    } as Record<string, IRecord[]>;
    return upvise.update(payload);
  };

  const doDeleteLicenseManagement = (
    TableEmployeedashboardLicensemanagement: ILicenseManagementRecord
  ): Promise<void> => {
    const copyTableEmployeedashboardLicensemanagement = JSON.parse(
      JSON.stringify(TableEmployeedashboardLicensemanagement)
    ) as IRecord;

    copyTableEmployeedashboardLicensemanagement._type = "DELETE";

    return upvise.update({
      TableEmployeedashboardLicensemanagement: [
        copyTableEmployeedashboardLicensemanagement,
      ],
    });
  };

  function getSlicingInformation(
    _upviseData: IUpviseDataMessage
  ): Record<string, IGridSlicing[]> {
    //JSON Object, for each tab send filter that needs to be applied!
    //{[fieldNames], displayName, filterToApply}
    return {};
  }
  return {
    state,
    fetch,
    getMetadata,
    setDepartmentNames,
    getEditLicenseManagement,
    getNewLicenseManagement,
    doSaveLicenseManagement,
    doDeleteLicenseManagement,
    getSlicingInformation,
  };
}
