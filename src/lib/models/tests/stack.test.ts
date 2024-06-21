import { Stack } from "../stack";

describe("Stack", () => {
  describe("initialise", () => {
    it("should initialise as empty", () => {
      // arrange
      const stack = new Stack<number>();
      // act
      const result = stack.size();
      // assert
      expect(result).toEqual(0);
    });
  });
  describe("push", () => {
    it("should allow the addition of a item", () => {
      // arrange
      const stack = new Stack<number>();
      // act
      stack.push(0);
      const size = stack.size();
      const result = stack.peek();
      // assert
      expect(size).toEqual(1);
      expect(result).toEqual(0);
    });
    it("should maintain the capacity when adding additional values", () => {
      // arrange
      const capacity = 2;
      const stack = new Stack<number>(capacity);
      // act
      stack.push(0);
      stack.push(1);
      stack.push(2);
      const result = stack.size();
      // assert
      expect(result).toEqual(capacity);
    });
    it("should overflow by deleting the oldest value", () => {
      // arrange
      const capacity = 2;
      const stack = new Stack<number>(capacity);
      // act
      stack.push(0);
      stack.push(1);
      stack.push(2);
      const result = [stack.pop(), stack.pop()].reverse();
      // assert
      expect(result).toEqual([1, 2]);
    });
  });
  describe("pop", () => {
    it("should reduce the size of the stack by one element when populated", () => {
      // arrange
      const stack = new Stack<number>();
      // act
      stack.push(0);
      stack.push(1);
      const beforePop = stack.size();
      stack.pop();
      const afterPop = stack.size();
      // assert
      expect(beforePop - afterPop).toEqual(1);
    });
    it("should not reduce the size of the stack by one element when empty", () => {
      // arrange
      const stack = new Stack<number>();
      // act
      const beforePop = stack.size();
      stack.pop();
      const afterPop = stack.size();
      // assert
      expect(beforePop - afterPop).toEqual(0);
    });
    it("should return the latest element when populated", () => {
      // arrange
      const stack = new Stack<number>();
      // act
      stack.push(0);
      stack.push(1);
      const result = stack.pop();
      // assert
      expect(result).toEqual(1);
    });
    it("should return null when empty", () => {
      // arrange
      const stack = new Stack<number>();
      // act
      const result = stack.pop();
      // assert
      expect(result).toBe(null);
    });
  });
  describe("peek", () => {
    it("should not reduce the size of the stack by one element when populated", () => {
      // arrange
      const stack = new Stack<number>();
      // act
      stack.push(0);
      stack.push(1);
      const beforePeek = stack.size();
      stack.peek();
      const afterPeek = stack.size();
      // assert
      expect(beforePeek - afterPeek).toEqual(0);
    });
    it("should return the latest element when populated", () => {
      // arrange
      const stack = new Stack<number>();
      // act
      stack.push(0);
      stack.push(1);
      const result = stack.peek();
      // assert
      expect(result).toEqual(1);
    });
    it("should return null when empty", () => {
      // arrange
      const stack = new Stack<number>();
      // act
      const result = stack.peek();
      // assert
      expect(result).toBe(null);
    });
  });
  describe("size", () => {
    it("should return 0 when empty", () => {
      // arrange
      const stack = new Stack<boolean>();
      // act
      const result = stack.size();
      // assert
      expect(result).toEqual(0);
    });
    it("should return the correct size when populated", () => {
      // arrange
      const stack = new Stack<number>();
      // act
      for (let i = 0; i < 4; i++) {
        stack.push(i);
      }
      const result = stack.size();
      // assert
      expect(result).toEqual(4);
    });
    it("should return the correct size when populated", () => {
      // arrange
      const stack = new Stack<number>();
      // act
      for (let i = 0; i < 4; i++) {
        stack.push(i);
      }
      const result = stack.size();
      // assert
      expect(result).toEqual(4);
    });
    it("should not exceed the capacity", () => {
      // arrange
      const capacity = 2;
      const stack = new Stack<number>(capacity);
      // act
      for (let i = 0; i < 4; i++) {
        stack.push(i);
      }
      const result = stack.size();
      // assert
      expect(result).toBeLessThanOrEqual(capacity);
    });
  });
  describe("clear", () => {
    it("should clear all data", () => {
      // arrange
      const stack = new Stack<string>();
      // act
      stack.push("Alice");
      stack.push("Bob");
      stack.clear();
      const size = stack.size();
      const peek = stack.peek();
      // assert
      expect(size).toEqual(0);
      expect(peek).toBe(null);
    });
  });
  describe("toJSON", () => {
    it("should output correct JSON from the data inside", () => {
      // arrange
      const stack = new Stack<number[]>();
      const record1 = [1, 2, 3, 4];
      const record2 = [2, 3];
      stack.push(record1);
      stack.push(record2);
      // act
      const result = stack.toJSON();
      // assert
      const expectedJson = JSON.stringify([record1, record2]);
      expect(result).toEqual(expectedJson);
    });
  });
  describe("fromJson", () => {
    it("should correctly load data from a valid JSON string", () => {
      // arrange
      const stack = new Stack<string>();
      const jsonData = JSON.stringify(["Alice", "Bob"]);
      // act
      stack.fromJSON(jsonData);
      const result2 = stack.pop();
      const result1 = stack.pop();
      // assert
      expect(result1).toEqual("Alice");
      expect(result2).toEqual("Bob");
    });
    it("should correctly load data from an extended JSON string", () => {
      // arrange
      const stack = new Stack<string>(2);
      const jsonData = JSON.stringify(["Alice", "Bob", "Cathy"]);
      // act
      stack.fromJSON(jsonData);
      const result2 = stack.pop();
      const result1 = stack.pop();
      // assert
      expect(result1).toEqual("Bob");
      expect(result2).toEqual("Cathy");
    });
    it("should skip invalid data when loading data from a partially invalid JSON string", () => {
      // arrange
      const stack = new Stack<number>();
      const partiallyInvalidJsonData = JSON.stringify([0, 1, 'Alice', 2]);
      // TODO: figure out how to test console
      // Spy on console.error
      // const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      // act
      stack.fromJSON(partiallyInvalidJsonData)
      const result = stack.size()
      // assert
      // expect(consoleErrorSpy).toHaveBeenCalledWith(
      //   expect.stringContaining('unknown item pushed to stack')
      // );
      expect(result).toEqual(3);
    });
  });
});
