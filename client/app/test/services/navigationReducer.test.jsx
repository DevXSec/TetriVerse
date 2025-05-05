import navigationReducer from "../../src/services/navigationReducer";

describe("navigationReducer", () => {
  test("retourne l'etat initial", () => {
    const initialState = navigationReducer(undefined, {});
    expect(initialState.previousPage).toBe(null);
    expect(initialState.currentPage).toBe(window.location.pathname);
  });

  test("doit gérer l'action", () => {
    const stateBefore = {
      previousPage: null,
      currentPage: "/home"
    };
    const action = { type: "PAGE_CHANGE", payload: "/about" };
    const stateAfter = navigationReducer(stateBefore, action);
    expect(stateAfter.previousPage).toBe(stateBefore.currentPage);
    expect(stateAfter.currentPage).toBe("/about");
  });

  test("doit renvoyer l'état actuel d'une action inconnue", () => {
    const stateBefore = { previousPage: "/home", currentPage: "/about" };
    const action = { type: "UNKNOWN_ACTION", payload: "/contact" };
    const stateAfter = navigationReducer(stateBefore, action);
    expect(stateAfter).toEqual(stateBefore);
  });
});
