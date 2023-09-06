export default function useControllerEquipment() {
  const fetch = () => {
    return Promise.all([]);
  };

  // const fetch = () => {
  //   return Promise.all([
  //     store.fetchTableData(useTableNames.PROJECTS),
  //     store.fetchTableData(useTableNames.PROJECT_PLANNER_MILESTONES),
  //     store.fetchTableData(useTableNames.PROJECT_PLANNER_TASKS),
  //     store.fetchTableData(useTableNames.PROJECT_PLANNER_BUDGETS),
  //     store.fetchTableData(useTableNames.METADATA),
  //   ]);
  // };

  const getMetadata = () => {
    return;
  };
  // const getMetadata = () => store.getMetadata("planner");

  return {
    fetch,
    getMetadata,
  };
}
