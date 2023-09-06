/*
 * Please try to keep the client list in alphabetical order
 * Remember to comment out each line before creating a pull request
 * Also as a precaution the files themselves should be commented out entirely
 * */

// import acsLocalForagePopulate from "@/store/mock/localForage/acsLocalForage";
// import cldconLocalForagePopulate from "@/store/mock/localForage/cldconLocalForage";
// import demoLocalForagePopulate from "@/store/mock/localForage/demoLocalForage";
// import enermLocalForagePopulate from "@/store/mock/localForage/enermLocalForage";
// import fraeaLocalForagePopulate from "@/store/mock/localForage/fraeaLocalForage";
// import greciLocalForagePopulate from "@/store/mock/localForage/greciLocalForage";
// import jangrLocalForagePopulate from "@/store/mock/localForage/jangrLocalForage";
// import munseLocalForagePopulate from "@/store/mock/localForage/munseLocalForage";
// import sildeLocalForagePopulate from "@/store/mock/localForage/sildeLocalForage";
// import stegrLocalForagePopulate from "../../../store/mock/localForage/stegrLocalForage";
import testLocalForagePopulate from "../../../store/mock/localForage/testLocalForage";
// import zinjsnLocalForagePopulate from "@/store/mock/localForage/zin_jsnLocalForage";
// import zinmetLocalForagePopulate from "@/store/mock/localForage/zin_metLocalForage";
// import griciLocalForagePopulate from "@/store/mock/localForage/griciLocalForage";

export async function _populateLocalForage() {
  if (process.env.NODE_ENV === "development") {
    //await acsLocalForagePopulate();
    //await cldconLocalForagePopulate();
    //await demoLocalForagePopulate();
    //await enermLocalForagePopulate();
    //await fraeaLocalForagePopulate();
    //await greciLocalForagePopulate();
    //await jangrLocalForagePopulate();
    //await munseLocalForagePopulate();
    //await sildeLocalForagePopulate();
    //await stegrLocalForagePopulate();
    await testLocalForagePopulate();
    //await zinjsnLocalForagePopulate();
    //await zinmetLocalForagePopulate();
    //await griciLocalForagePopulate();
    console.log("Local forage has been set");
  } else return;
}
