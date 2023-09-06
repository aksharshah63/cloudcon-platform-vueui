import customFieldDataAccess from "../../cloudconLibrary/store/modules/customFieldData/customFieldDataAccess";
import { IRequestCustomFieldCreate } from "../../cloudconLibrary/api/apiInterfaces";

export default function customFieldController() {
  const getcustomfieldbyentity = async (entity?: string) => {
    await customFieldDataAccess.getCustomFieldsByEntity(entity);
    const data = await customFieldDataAccess.getCustomFieldsForTable();
    const totalData =
      await customFieldDataAccess.getTotalCustomFieldsForTable();
    return { data, totalData };
  };

  const addcustomfield = (
    tenantId: number,
    customfieldcreaterequest: IRequestCustomFieldCreate
  ): Promise<any> => {
    return new Promise<any>((resolve, reject) => {
      customFieldDataAccess
        .createCustomField(tenantId, customfieldcreaterequest)
        .then(() => {
          return resolve("success");
        })
        .catch((error) => {
          return reject({
            main: "Error",
            message: error.data.AlreadyExists[0],
          });
        });
    });
  };

  const deletecustomfield = (
    tenantId: number,
    fieldid: number
  ): Promise<any> => {
    return new Promise<any>((resolve, reject) => {
      customFieldDataAccess
        .deletCustomField(tenantId, fieldid)
        .then(() => {
          return resolve("Success");
        })
        .catch(() => {
          return reject({
            main: "Error",
            message: "Something went wrong",
          });
        });
    });
  };

  return {
    getcustomfieldbyentity,
    addcustomfield,
    deletecustomfield,
  };
}
