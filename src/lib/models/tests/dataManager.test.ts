import { DataManager } from "../dataManager";
describe("DataManager", () => {
  describe("initialisation", () => {
    it("should initialize and return the default object", () => {
      // arrange
      const defaultData = false;
      const freshDataManager = new DataManager<boolean>(defaultData);
      // act
      const result1 = freshDataManager.get(1);
      const result2 = freshDataManager.get(10);
      const result3 = freshDataManager.get(99);
      // assert
      expect(result1).toEqual(defaultData);
      expect(result2).toEqual(defaultData);
      expect(result3).toEqual(defaultData);
    });
  });
  describe("get", () => {
    it("should retrieve an existing record", () => {
      // arrange
      const defaultData = false;
      const freshDataManager = new DataManager<boolean>(defaultData);
      const testRecord = 0;
      const newData = true;
      freshDataManager.set(testRecord, newData);
      // act
      const result = freshDataManager.get(testRecord);
      // assert
      expect(result).toEqual(newData);
    });
  });
  describe("set", () => {
    it("should create a new record", () => {
      // arrange
      const defaultData = false;
      const freshDataManager = new DataManager<boolean>(defaultData);
      const testRecord = 0;
      const newData = true;
      // act
      freshDataManager.set(testRecord, newData);
      const result = freshDataManager.get(testRecord);
      // assert
      expect(result).toEqual(newData);
    });
    it("should update an existing record", () => {
      // arrange
      const defaultData = 0;
      const freshDataManager = new DataManager<number>(defaultData);
      const testRecord = 0;
      const setData = 1;
      const updateData = 2;
      // act
      freshDataManager.set(testRecord, setData);
      freshDataManager.set(testRecord, updateData);
      const result = freshDataManager.get(testRecord);
      // assert
      expect(result).toEqual(updateData);
    });
  });
  describe("toJSON", () => {
    it("should output correct JSON from the data inside", () => {
      // arrange
      const defaultData: number[] = [0, 1, 2];
      const manager = new DataManager<number[]>(defaultData);
      const record1 = [1, 2, 3, 4];
      const record2 = [2, 3];
      manager.set(1, record1);
      manager.set(2, record2);
      // act
      const result = manager.toJSON();
      // assert
      const expectedJson = JSON.stringify({
        1: record1,
        2: record2,
      });
      expect(result).toEqual(expectedJson);
    });
  });
  describe("fromJson", () => {
    it("should correctly load data from a valid JSON string", () => {
      // arrange
      const defaultData = "Jake";
      const manager = new DataManager(defaultData);
      const jsonData = JSON.stringify({
        1: "Alice",
        2: "Bob",
      });
      // act
      manager.fromJSON(jsonData);
      const result1 = manager.get(1);
      const result2 = manager.get(2);
      // assert
      expect(result1).toEqual('Alice');
      expect(result2).toEqual('Bob');
    });
    it('should throw an error when loading data from an invalid JSON string', () => {
      // Arrange
      const defaultData = 4;
      const manager = new DataManager(defaultData);
      const invalidJsonData = "{ invalid JSON }";

      // Act & Assert
      expect(() => manager.fromJSON(invalidJsonData)).toThrow("Failed to parse JSON Data: Expected property name or '}' in JSON at position 2");
    });
  });
});
