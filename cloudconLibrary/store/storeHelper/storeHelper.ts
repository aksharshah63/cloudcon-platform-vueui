export interface IStoreDataForTable<T> {
  data: T[];
  totalRecords: number;
}

export default {
  emptyStoreDataForTable<T>(): IStoreDataForTable<T> {
    return {
      data: [],
      totalRecords: 0,
    };
  },
};
