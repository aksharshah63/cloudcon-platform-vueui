import { IRelease } from "../../use/controller/workshop/workshop.d";
import { IRecord } from "../../store/modules/upvise.d";
import useWorkshopController from "../../use/controller/workshop/workshop";
import { useState } from "../../store/index";

export default function useControllerWorkshopColour() {
  const upvise = useState().upvise;
  const workshopController = useWorkshopController(upvise);

  const allColours = [
    "EBB46B",
    "97BAE5",
    "F2D386",
    "AC98E4",
    "DF858B",
    "89DF7B",
    "E29EDA",
    "E27226",
    "0CC5EA",
    "CCC700",
    "B46AF2",
    "FA4444",
    "16FA3C",
    "F54DED",
    "F5DAB5",
    "CDDEF3",
    "FBF5D9",
    "D1C6F0",
    "EDB9BD",
    "D0F2CA",
    "F2D2EE",
    "EEAB7E",
    "71E1F7",
    "FFFB65",
    "CF9FF7",
    "FC9E9E",
    "7CFC91",
    "F995F4",
    "D8881E",
    "5991D5",
    "E2A818",
    "8264D6",
    "CD434D",
    "40B52D",
    "CF59C1",
    "F0B994",
    "A1EAF9",
    "FFFDA9",
    "E1C2FA",
    "FDBBBB",
    "B1FDBE",
    "FBB7F8",
    "E49A38",
    "7CA8DE",
    "ECBF4E",
    "967DDD",
    "D6646C",
    "63D450",
    "DA82D0",
    "F7D9C4",
    "D0F5FC",
    "FEFED6",
    "EEDCFC",
    "FED6D6",
    "DEFEE3",
    "FDDBFB",
    "F0C994",
    "B2CCEC",
    "F7EBAF",
    "BDADE9",
    "E8A6AB",
    "AFE9A5",
    "EAB8E4",
    "E88F52",
    "3DD6F5",
    "EEE800",
    "C387F5",
    "FB7171",
    "16FA3C",
    "F775F1",
  ];
  // const allColours = ["colour1", "colour2", "colour3", "colour4", "colour5"];

  // Run once at screen start
  // Will remove unnecessary duplicates of colours
  // Will also add colours incase any releases do not have a colour
  function initialiseColours() {
    const allReleases = Object.values(
      upvise.entityData(workshopController.releaseTable)
    ) as unknown as IRelease[];
    if (!allReleases) return;
    const colours: string[] = [];
    const colourlessReleases: IRelease[] = [];
    const duplicateColourReleases: IRelease[] = [];
    allReleases.forEach((release) => {
      if (release.colour == "") colourlessReleases.push(release);
      if (!colours.find((colour) => colour === release.colour))
        colours.push(release.colour);
      else duplicateColourReleases.push(release);
    });
    const usableColours = getUsableColours(colours);
    if (usableColours.length !== allColours.length)
      colourlessReleases.concat(duplicateColourReleases);

    colourlessReleases.forEach((release) => {
      if (usableColours.length === 0) usableColours.concat(allColours);
      release.colour = usableColours[0];
      usableColours.shift();
    });
    return usableColours.length === 0 ? allColours : usableColours;
  }

  // Returns a list of all colours that are currently unused
  function getUsableColours(colours: string[]) {
    // All colours are being used, so we have to reuse colours
    if (colours.length === allColours.length) return allColours;
    return allColours.filter((colour) => !colours.includes(colour));
  }

  function getClassName(record: IRecord) {
    if ("_rowColour" in record && record["_rowColour"])
      return "background-colour-" + record["_rowColour"];

    return null;
  }

  function activeColours() {
    const allReleases = Object.values(
      upvise.entityData(workshopController.releaseTable)
    );
    const colours: string[] = [];
    if (allReleases)
      allReleases.forEach((release) => {
        if (typeof release.colour === "string") colours.push(release.colour);
      });
    return colours;
  }

  return {
    initialiseColours,
    getClassName,
    activeColours,
  };
}
