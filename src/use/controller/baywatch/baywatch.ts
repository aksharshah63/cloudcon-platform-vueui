import useLocalForage from "../../../use/utils/useLocalForage";
import { IUpvise } from "../../../store/modules/upvise.d";
import { IBaywatchBayinfo } from "./baywatch.d";
import date from "../../../use/utils/useDateOperations";
import { ILot, IRelease } from "../workshop/workshop.d";
import { useTableNames } from "../../../use/utils/useConstants";

export default function useControllerBaywatch(upvise: IUpvise) {
  const bayTable = "TableBaywatchBayinfo";

  const getMetadata = () => upvise.metadata("baywatch");
  const fetch = () => upvise.fetch("baywatch");
  const getForageData = async () =>
    await useLocalForage.getDataForkeys(
      ["unybiz.contacts.contacts"],
      useLocalForage.getInstance("upvise", "tables")
    );

  function notPersistedCalcs() {
    const bayData = Object.values(
      upvise.entityData(bayTable)
    ) as unknown as IBaywatchBayinfo[];
    const lotData = upvise.entityData(useTableNames.WORKSHOP_LOT) as unknown as Record<string, ILot>;
    const releaseData = upvise.entityData(useTableNames.WORKSHOP_RELEASE) as unknown as Record<string, IRelease>;

    bayData.forEach((bay) => {
      _updateBay(bay, lotData, releaseData);
    });
  }

  function _updateBay(
    bay: IBaywatchBayinfo,
    lotData: Record<string, ILot>,
    releaseData: Record<string, IRelease>
  ) {
    const currentJobArray = bay.currentjob.split("|");
    const projectCode = currentJobArray[0];
    const lot = currentJobArray[1];
    const bundle = currentJobArray[2];
    const linkedLot = lotData[bay.lotid];
    const linkedRelease = linkedLot?.releaseid ? releaseData[linkedLot.releaseid] : undefined;

    bay.releaseColour = linkedRelease?.colour;

    bay.currentJobName = `${projectCode ?? ""}${
      lot != undefined ? "- Lot " + lot : ""
    }`;
    bay.currentJobBundle = bundle ?? "";

    if (bay.lastscantime)
      bay.formattedLastScanTime = date.getDateString(
        bay.lastscantime,
        "hh:mma"
      );
    else bay.formattedLastScanTime = "";
  }

  function updateBayWidgetSizes() {
    const bayWidgetElements = [
      ...document.getElementsByClassName("bay-widget-parent"),
    ];
    const heights: number[] = [];

    // Get the largest height for each div
    bayWidgetElements.forEach((bayWidgetElement) => {
      ([...bayWidgetElement.children] as HTMLElement[]).forEach(
        (div, index) => {
          let divHeight = 0;
          if (div.classList.contains("notes")) {
            const textareaElement = (
              [...div.getElementsByTagName("textarea")] as HTMLElement[]
            )[0];
            if (textareaElement) {
              textareaElement.style.height = "auto";
              divHeight = textareaElement.scrollHeight;
            }
          } else {
            div.style.height = "auto";
            divHeight = div.offsetHeight;
          }
          if (!heights[index] || divHeight > heights[index])
            heights[index] = divHeight;
        }
      );
    });

    // Set the height of all divs
    bayWidgetElements.forEach((bayWidgetElement) => {
      ([...bayWidgetElement.children] as HTMLElement[]).forEach(
        (div, index) => {
          if (div.classList.contains("notes")) {
            const textareaElement = (
              [...div.getElementsByTagName("textarea")] as HTMLElement[]
            )[0];
            if (textareaElement)
              textareaElement.style.height = (heights[index] ?? 50) + "px";
          } else div.style.height = heights[index] + "px";
        }
      );
    });
  }

  return {
    bayTable,

    getMetadata,
    fetch,
    getForageData,

    notPersistedCalcs,
    updateBayWidgetSizes,
  };
}
