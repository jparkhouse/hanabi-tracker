import { Dictionary } from "../dictionary";
describe("Dictionary", () => {
  describe("initialisation", () => {
    it("should initialize and return the default object", () => {
      // arrange
      const defaultData = false;
      const freshDictionary = new Dictionary<boolean>(defaultData);
      // act
      const result1 = freshDictionary.getValueOrDefault(1);
      const result2 = freshDictionary.getValueOrDefault(10);
      const result3 = freshDictionary.getValueOrDefault(99);
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
      const freshDictionary = new Dictionary<boolean>(defaultData);
      const testRecord = 0;
      const newData = true;
      freshDictionary.set(testRecord, newData);
      // act
      const result = freshDictionary.getValueOrDefault(testRecord);
      // assert
      expect(result).toEqual(newData);
    });
  });
  describe("set", () => {
    it("should create a new record", () => {
      // arrange
      const defaultData = false;
      const freshDictionary = new Dictionary<boolean>(defaultData);
      const testRecord = 0;
      const newData = true;
      // act
      freshDictionary.set(testRecord, newData);
      const result = freshDictionary.getValueOrDefault(testRecord);
      // assert
      expect(result).toEqual(newData);
    });
    it("should update an existing record", () => {
      // arrange
      const defaultData = 0;
      const freshDictionary = new Dictionary<number>(defaultData);
      const testRecord = 0;
      const setData = 1;
      const updateData = 2;
      // act
      freshDictionary.set(testRecord, setData);
      freshDictionary.set(testRecord, updateData);
      const result = freshDictionary.getValueOrDefault(testRecord);
      // assert
      expect(result).toEqual(updateData);
    });
  });
  describe("toJSON", () => {
    it("should output correct JSON from the data inside", () => {
      // arrange
      const defaultData: number[] = [0, 1, 2];
      const manager = new Dictionary<number[]>(defaultData);
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
      const manager = new Dictionary(defaultData);
      const jsonData = JSON.stringify({
        1: "Alice",
        2: "Bob",
      });
      // act
      manager.fromJSON(jsonData);
      const result1 = manager.getValueOrDefault(1);
      const result2 = manager.getValueOrDefault(2);
      // assert
      expect(result1).toEqual('Alice');
      expect(result2).toEqual('Bob');
    });
    it('should throw an error when loading data from an invalid JSON string', () => {
      // Arrange
      const defaultData = 4;
      const manager = new Dictionary(defaultData);
      const invalidJsonData = "{ invalid JSON }";

      // Act & Assert
      expect(() => manager.fromJSON(invalidJsonData)).toThrow("Failed to parse JSON Data: Expected property name or '}' in JSON at position 2");
    });
  });
});
