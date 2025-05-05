import store from "../../src/services/store"; 
import navigationReducer from "../../src/services/navigationReducer";

describe("Redux Store", () => {
  test("should initialize with the correct default state", () => {
    const state = store.getState();
    expect(state).toHaveProperty("navigation");
    expect(state.navigation).toEqual(navigationReducer(undefined, {}));
  });
});