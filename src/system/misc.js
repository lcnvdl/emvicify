function getPluginMemberName(file) {
  return file
    .split(".")
    .slice(0, file.split(".").length - 1)
    .join(".");
}

module.exports = {
  getPluginMemberName
};
