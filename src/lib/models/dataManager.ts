// /lib/models/dataManager.ts
/**
 * A data manager to keep track of a set of records of any type.
 * If a record exists, it gets or updates it
 * If a record does not exist, it gets a default value or sets it by creating a new record
 * It also has support for writing itself to and from JSON
 *
 * @export
 * @class DataManager
 * @template T
 */
export class DataManager<T> {
  private data: Record<number, T>;
  private default: T;

  constructor(defaultData: T) {
    this.data = {};
    this.default = defaultData;
  }

  get(id: number): T {
    return this.data[id] || this.default;
  }

  set(id: number, data: T): void {
    this.data[id] = data;
  }

  toJSON(): string {
    return JSON.stringify(this.data);
  }

  fromJSON(JSONData: string): void {
    try {
      const parsedData = JSON.parse(JSONData);
      this.data = parsedData;
    } catch (error) {
      // Catch parsing errors or other unexpected issues
      throw new Error(`Failed to parse JSON Data: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
}
