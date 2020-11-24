const { expect } = require("chai");
const { getPluginMemberName } = require("../src/system/misc");

describe("Misc", () => {
  describe("#getPluginMemberName", () => {
    it("should work fine", () => {
      const name = getPluginMemberName("com.plugin.xd.js");
      expect(name).to.equals("com.plugin.xd");
    });
  });
});