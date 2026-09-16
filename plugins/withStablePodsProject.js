const { withPodfile } = require("expo/config-plugins");

// CocoaPods' sequential UUID generator does not check already-loaded objects.
// RN's SPM post-install additions can therefore replace PBXProject with ClerkKitUI.
const patch = `# LAD: keep SPM additions from reusing existing CocoaPods object IDs.
class Pod::Project
  def generate_uuid
    candidate = super
    candidate = super while objects_by_uuid.key?(candidate)
    candidate
  end
end
# LAD: end CocoaPods UUID fix
`;
module.exports = function withStablePodsProject(config) {
  return withPodfile(config, config => {
    if (!config.modResults.contents.includes("# LAD: end CocoaPods UUID fix")) {
      config.modResults.contents = `${patch}\n${config.modResults.contents}`;
    }
    return config;
  });
};
