// /lib/models/dataManager.ts

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
      // Ensure data is correctly typed as Record<number, T>
      this.data = Object.keys(parsedData).reduce((acc, key) => {
        // Convert keys back to numbers since JSON keys are always strings
        const numKey = Number(key);
        const value: T = parsedData[key];

        // Optionally, validate the structure of T if necessary
        if (!this.isValidData(value)) {
          throw new Error(`Invalid data structure for key ${key}: ${JSON.stringify(value)}`);
        }

        acc[numKey] = value;
        return acc;
      }, {} as Record<number, T>);
    } catch (error) {
      // Catch parsing errors or other unexpected issues
      throw new Error(`Failed to parse JSON Data: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  // Validation function to check if the data corresponds to type T
  private isValidData(data: any): boolean {
    // Implement validation logic depending on what T should look like
    // This is just a placeholder function and should be tailored to specific needs
    return data !== null && typeof data !== 'undefined'; // Basic existence check, expand according to T's expected structure
  }
}
