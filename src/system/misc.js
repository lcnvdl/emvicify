function getPluginMemberName(file) {
  if (file.includes("/")) {
    file = file.substr(file.lastIndexOf("/") + 1);
  }

  if (file.includes("\\")) {
    file = file.substr(file.lastIndexOf("\\") + 1);
  }

  return file
    .split(".")
    .slice(0, file.split(".").length - 1)
    .join(".");
}

module.exports = {
  getPluginMemberName
};
