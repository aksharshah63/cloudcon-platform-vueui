export default {
  deepCopy<T>(data: T): T {
    // TODO This should probably be updated to use Lodash's deep copy
    return JSON.parse(JSON.stringify(data));
  },

  deepCopySet<T>(data: Set<T>): Set<T> {
    return new Set(this.deepCopy(Array.from(data)));
  },
};
