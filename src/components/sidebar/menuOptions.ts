interface IMenuOptions {
  menus: Record<string, any>;
}

const menuOptions: IMenuOptions = {
  menus: {
    people: {
      active_menu: "1",
      moduleOptions: [
        {
          id: "people_id",
          path: "/people",
          name: "All",
          visible: true,
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
              path: "/peopleGroup",
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
              path: "/peopleOption",
              name: "Options",
              icon: "bell",
              visible: true,
            },
          ],
        },
      ],
    },
    plant: {
      active_menu: "1",
      moduleOptions: [
        {
          id: "plant_id",
          path: "/plant",
          name: "All",
          visible: true,
          menuItems: [
            {
              id: "1",
              path: "/plant",
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
              path: "/plantGroup",
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
              path: "/plantOption",
              name: "Options",
              icon: "bell",
              visible: true,
            },
          ],
        },
      ],
    },
    job: {
      active_menu: "1",
      moduleOptions: [
        {
          id: "job_id",
          path: "/job",
          name: "All",
          visible: true,
          menuItems: [
            {
              id: "1",
              path: "/job",
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
              path: "/peopleGroup",
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
              path: "/jobOption",
              name: "Options",
              icon: "bell",
              visible: true,
            },
          ],
        },
      ],
    },
    work_order: {
      active_menu: "1",
      moduleOptions: [
        {
          id: "work_order_id",
          path: "/workOrder",
          name: "All",
          visible: true,
          menuItems: [
            {
              id: "1",
              path: "/workOrder",
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
              path: "/peopleGroup",
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
              path: "/workOrderOption",
              name: "Options",
              icon: "bell",
              visible: true,
            },
          ],
        },
      ],
    },
    company: {
      active_menu: "1",
      moduleOptions: [
        {
          id: "company_id",
          path: "/company",
          name: "All",
          visible: true,
          menuItems: [
            {
              id: "1",
              path: "/company",
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
              path: "/peopleGroup",
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
              path: "/companyOption",
              name: "Options",
              icon: "bell",
              visible: true,
            },
          ],
        },
      ],
    },
    form_template: {
      active_menu: "1",
      moduleOptions: [
        {
          id: "form_template_id",
          path: "/formTemplates",
          name: "All",
          visible: true,
          menuItems: [
            {
              id: "1",
              path: "/formTemplates",
              alias: "",
              name: "All",
              icon: "bell",
              visible: true,
            },
            {
              id: "2",
              path: "/formTemplates/groups",
              alias: "groups",
              name: "Groups",
              icon: "bell",
              visible: true,
            },
            {
              id: "3",
              path: "/",
              alias: "reports",
              name: "Reports",
              icon: "bell",
              visible: true,
            },
            {
              id: "4",
              path: "/",
              alias: "options",
              name: "Options",
              icon: "bell",
              visible: true,
            },
          ],
        },
      ],
    },
  },
};

export { IMenuOptions, menuOptions };
