import { IModuleOptionPeople } from "@/store/modules/upvise.d";
/* eslint-disable */
export default function useControllerIndexPeople() {
  function getPeopleModuleOptions(): IModuleOptionPeople[] {
    const moduleOptions: IModuleOptionPeople[] = [
      {
        name: "Cloudcon Pty Ltd",
        company: "Demo Company (AU)",
        groups: "Employs",
        email: "test@email.com",
        mobile: 123455667788,
        status: "In Progress",
        action: "string",
      },
      {
        name: "Cloudcon Pty Ltd",
        company: "Demo Company (AU)",
        groups: "Employs",
        email: "test@email.com",
        mobile: 123455667788,
        status: "Assigned",
        action: "string",
      },
      {
        name: "Cloudcon Pty Ltd",
        company: "Demo Company (AU)",
        groups: "Employs",
        email: "test@email.com",
        mobile: 123455667788,
        status: "Unassigned",
        action: "string",
      },
    ];

    return moduleOptions;
  }

  return {
    getPeopleModuleOptions,
  };
}
