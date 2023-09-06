import { IModuleOption } from "@/store/modules/upvise.d";
import userDataAccess from "../../../cloudconLibrary/store/modules/userData/userDataAccess";
import { SubmoduleId } from "../../../cloudconLibrary/utilities/useConstants";
/* eslint-disable */
export default function useControllerIndex() {
  function getModuleOptions(): IModuleOption[] {
    const moduleOptions: IModuleOption[] = [
      {
        id: "home_id",
        path: "/",
        name: "Home",
        visible: true,
        menuGroups: [
          {
            id: "home_main_menu_id",
            name: "home-main-menu-group",
            menuItems: [
              {
                id: "1",
                path: "/",
                name: "Home",
                icon: "bell",
                visible: true,
              },
            ],
          },
        ],
      },
      {
        id: "people_id",
        path: "/people",
        name: "All",
        visible: true,
        menuGroups: [
          {
            id: "people_main_menu_id",
            name: "people-main-menu-group",
            menuItems: [
              {
                id: "1",
                path: "/people",
                name: "All",
                icon: "bell",
                visible: true,
              },
              {
                id: "2",
                path: "/",
                name: "Staff",
                icon: "bell",
                visible: true,
              },
              {
                id: "3",
                path: "/",
                name: "Groups",
                icon: "bell",
                visible: true,
              },
              {
                id: "4",
                path: "/",
                name: "Reports",
                icon: "bell",
                visible: true,
              },
              {
                id: "5",
                path: "/",
                name: "Options",
                icon: "bell",
                visible: true,
              },
            ],
          },
        ],
      },
      {
        id: "people_view_id",
        path: "/people/view/:id",
        name: "All",
        visible: true,
        menuGroups: [
          {
            id: "people_main_menu_id",
            name: "people-main-menu-group",
            menuItems: [
              {
                id: "1",
                path: "/people",
                name: "All",
                icon: "bell",
                visible: true,
              },
              {
                id: "2",
                path: "/",
                name: "Staff",
                icon: "bell",
                visible: true,
              },
              {
                id: "3",
                path: "/",
                name: "Groups",
                icon: "bell",
                visible: true,
              },
              {
                id: "4",
                path: "/",
                name: "Reports",
                icon: "bell",
                visible: true,
              },
              {
                id: "5",
                path: "/",
                name: "Options",
                icon: "bell",
                visible: true,
              },
            ],
          },
        ],
      },
      {
        id: "risks_id",
        path: "/risks",
        name: "Risks",
        visible: true,
        menuGroups: [
          {
            id: "risks_main_menu_id",
            name: "risks-main-menu-group",
            menuItems: [
              {
                id: "123",
                path: "/",
                name: "Risks",
                icon: "globe-asia",
                visible: true,
              },
              // {
              //   id: "456",
              //   path: "/menu-item-2",
              //   name: "Alerts",
              //   icon: "bell",
              // },
            ],
          },
        ],
      },
      {
        id: "license_id",
        path: "/licenseManagement",
        name: "License Management",
        visible: true,
        menuGroups: [
          {
            id: "license_main_menu_id",
            name: "license-management-main-menu-group",
            menuItems: [
              {
                id: "123",
                path: "/",
                name: "menu license item 1",
                icon: "bell",
                visible: true,
              },
              {
                id: "456",
                path: "/menu-item-2",
                name: "menu license item 2",
                icon: "bell",
                visible: true,
              },
            ],
          },
        ],
      },
      {
        id: "equipment_id",
        path: "/equipment",
        name: "Equipment",
        visible: isEquipmentModuleVisible(),
        menuGroups: [
          {
            id: "equipment_main_menu_id",
            name: "equipment-management-main-menu-group",
            menuItems: [
              {
                id: "1",
                path: "/",
                name: "Equipment",
                icon: "bell",
                visible: userDataAccess.hasValidClaim(SubmoduleId.EQUIPMENT),
              },
              {
                id: "2",
                path: "/cmmis",
                name: "CMMIS",
                icon: "globe-asia",
                visible: userDataAccess.hasValidClaim(
                  SubmoduleId.EQUIPMENT_CMMIS
                ),
              },
              {
                id: "3",
                path: "/compliance",
                name: "Compliance",
                icon: "globe-asia",
                visible: userDataAccess.hasValidClaim(
                  SubmoduleId.EQUIPMENT_COMPLIANCE
                ),
              },
              {
                id: "4",
                path: "/forms",
                name: "Forms",
                icon: "globe-asia",
                visible: userDataAccess.hasValidClaim(
                  SubmoduleId.EQUIPMENT_FORMS
                ),
              },
              {
                id: "5",
                path: "/prestart",
                name: "Prestart",
                icon: "globe-asia",
                visible: userDataAccess.hasValidClaim(
                  SubmoduleId.EQUIPMENT_PRESTART
                ),
              },
              {
                id: "6",
                path: "/utilization",
                name: "Utilization",
                icon: "bell",
                visible: userDataAccess.hasValidClaim(
                  SubmoduleId.EQUIPMENT_UTILIZATION
                ),
              },
              {
                id: "789",
                path: "/categories",
                name: "Categories",
                icon: "bell",
                visible: userDataAccess.hasValidClaim(
                  SubmoduleId.EQUIPMENT_CATEGORIES
                ),
              },
            ],
          },
        ],
      },
    ];

    return moduleOptions;
  }

  function isEquipmentModuleVisible(): boolean {
    return userDataAccess.hasValidClaim([
      SubmoduleId.EQUIPMENT,
      SubmoduleId.EQUIPMENT_CATEGORIES,
      SubmoduleId.EQUIPMENT_CMMIS,
      SubmoduleId.EQUIPMENT_COMPLIANCE,
      SubmoduleId.EQUIPMENT_FORMS,
      SubmoduleId.EQUIPMENT_PRESTART,
      SubmoduleId.EQUIPMENT_UTILIZATION,
    ]);
  }

  return {
    getModuleOptions,
  };
}
