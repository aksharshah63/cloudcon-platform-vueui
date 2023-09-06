import { IRecord, IUpvise } from "../../store/modules/upvise.d";
import { IMappedRelease } from "../controller/workshop/workshop.d";
import dateOperation from "../utils/useDateOperations";
import { orderBy } from "lodash";
import utils from "./useUtils";

export default function useMappedReleaseController(upvise: IUpvise) {
  function newMappedRelease(
    releaseId: string,
    releaseName: string,
    date: number
  ): IMappedRelease {
    return {
      id: utils.generateId(),
      label: releaseName,
      installdate: dateOperation.getStartOfWeek(date),
      releaseid: releaseId,
    };
  }

  function mapReleases(upviseData: IRecord[]) {
    // Going to create an array of year/month values
    // Each will be assigned an id as it is created
    // Any data that falls under that year week will be given that id
    console.log("upvisedata", upviseData);
    const allMappedReleases: IMappedRelease[] = [];
    upviseData.forEach((data) => {
      if (typeof data.installdate != "number") return;

      const startOfWeekDate = dateOperation.getStartOfWeek(data.installdate);
      // Going to look to see if the record currently exists or if it needs to be created
      const existingMappedReleaseRecord = allMappedReleases.find(
        (mappedRelease) =>
          mappedRelease.installdate == startOfWeekDate &&
          mappedRelease.releaseid === data.releaseid
      );

      if (existingMappedReleaseRecord) {
        data.mappedreleaseid = existingMappedReleaseRecord.id;
      } else {
        const newMappedReleaseRecord = newMappedRelease(
          data.releaseid as string,
          data.releasename as string,
          data.installdate
        );
        allMappedReleases.push(newMappedReleaseRecord);
        data.mappedreleaseid = newMappedReleaseRecord.id;
      }
    });
    console.log("all mapped releases ", allMappedReleases);
    return sortMappedReleases(allMappedReleases);
  }

  function deleteUnusedMappedReleases(
    mappedReleases: IRecord[],
    upviseData: IRecord[]
  ) {
    const deleteIds = [] as string[];
    mappedReleases.forEach((mappedRelease) => {
      if (upviseData.some((d) => d.mappedreleaseid == mappedRelease.id)) return;
      else {
        deleteIds.push(mappedRelease.id as string);
      }
    });
    if (deleteIds.length > 0)
      upvise.removeSchemaOnlyData("dateallocationid", deleteIds);
  }

  function sortMappedReleases(mappedReleases: IMappedRelease[]) {
    return orderBy(mappedReleases, ["label"], ["asc"]);
  }

  function updateMappedReleaseRecords(storeData: IRecord[]) {
    const mappedReleaseData = Object.values(
      upvise.entityData("_Mappedrelease")
    ) as unknown as IRecord[];

    const affectedMappedReleaseRecords = new Set<string>();

    storeData.forEach((r) => {
      if (r.mappedreleaseid)
        affectedMappedReleaseRecords.add(r.mappedreleaseid as string);

      if (
        utils.IsActive(r as unknown as IRecord) &&
        typeof r.installdate === "number"
      ) {
        const startOfWeekDate = dateOperation.getStartOfWeek(r.installdate);

        const existingMappedReleaseRecord = mappedReleaseData.find(
          (m) => m.installdate == startOfWeekDate && m.releaseid === r.releaseid
        );

        if (existingMappedReleaseRecord) {
          r.mappedreleaseid = existingMappedReleaseRecord.id;
        } else {
          // create new mapped release
          const newMappedReleaseRecord = newMappedRelease(
            r.releaseid as string,
            r.releasename as string,
            r.installdate
          );
          upvise.updateStore({
            _Mappedrelease: [newMappedReleaseRecord as unknown as IRecord],
          });
          r.mappedreleaseid = newMappedReleaseRecord.id;
        }
      }
    });

    affectedMappedReleaseRecords.forEach((mappedReleaseId) => {
      // if no records under mapped release, delete mapped release record
      if (
        storeData.filter((r) => r.mappedreleaseid === mappedReleaseId)
          .length === 0
      )
        delete upvise.entityData("_Mappedrelease")[mappedReleaseId];
    });
  }

  return {
    mapReleases,
    deleteUnusedMappedReleases,
    updateMappedReleaseRecords,
  };
}
