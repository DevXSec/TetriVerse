
import { ROWS, COLS, EMPTY_CELL } from "../../src/models/Constants";

describe("Game constants", () => {
  test("doit avoir les bonnes valeurs", () => {
    expect(ROWS).toBe(20);
    expect(COLS).toBe(10);
    expect(EMPTY_CELL).toBe(0);
  });
});
