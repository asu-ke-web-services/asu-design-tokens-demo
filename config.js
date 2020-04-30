const StyleDictionary = require("style-dictionary");

const buildPath = "build/";

// You can still add custom transforms and formats like you
// normally would and reference them in the config below.
StyleDictionary.registerTransform({
  name: "myRegisteredTransform",
  type: "value",
  matcher: (prop) => prop.attributes.category === "size",
  transformer: (prop) => `${parseInt(prop.value) * 16}px`,
});

StyleDictionary.registerFormat({
  name: "myRegisteredFormat",
  formatter: (dictionary) => {
    return dictionary.allProperties.map((prop) => prop.value).join("\n");
  },
});

const propertiesToCTI = {
  width: { category: "size", type: "dimension" },
  "min-width": { category: "size", type: "dimension" },
  "max-width": { category: "size", type: "dimension" },
  height: { category: "size", type: "dimension" },
  "min-height": { category: "size", type: "dimension" },
  "max-height": { category: "size", type: "dimension" },
  "border-width": { category: "size", type: "border", item: "width" },
  "border-radius": { category: "size", type: "border", item: "width" },
  "border-color": { category: "color", type: "border" },
  "background-color": { category: "color", type: "background" },
  color: { category: "color", type: "font" },
  "text-color": { category: "color", type: "font" },
  padding: { category: "size", type: "padding" },
  "padding-vertical": { category: "size", type: "padding" },
  "padding-horziontal": { category: "size", type: "padding" },
  icon: { category: "content", type: "icon" },
  "font-size": { category: "size", type: "font" },
  "line-height": { category: "size", type: "line-height" },
  size: { category: "size", type: "icon" },
};

const CTITransform = {
  transformer: (prop) => {
    // Only do this custom functionality in the 'component' top-level namespace.
    if (prop.path[0] === "component") {
      // When defining component tokens, the key of the token is the relevant CSS property
      // The key of the token is the last element in the path array
      return propertiesToCTI[prop.path[prop.path.length - 1]];
    } else {
      // Fallback to the original 'attribute/cti' transformer
      return StyleDictionary.transform["attribute/cti"].transformer(prop);
    }
  },
};

// You can export a plain JS object and point the Style Dictionary CLI to it,
// similar to webpack.
module.exports = {
  source: ["properties/**/*.json", "components/**/*.json"],

  // Rather than calling .registerTransform() we can apply the new transform
  // directly in our configuration. Using .registerTransform() with the same
  // transform name, 'attribute/cti', would work as well.
  transform: {
    // Override the attribute/cti transform with our component-transform
    "attribute/cti": CTITransform,

    // Now we can use our custom transform 'myTransform'
    myTransform: {
      type: "name",
      transformer: (prop) => prop.path.join("_").toUpperCase(),
    },
  },
  // Same with formats, you can now write them directly to this config
  // object. The name of the format is the key.
  format: {
    myFormat: (dictionary, platform) => {
      return dictionary.allProperties
        .map((prop) => `${prop.name}: ${prop.value}`)
        .join("\n");
    },
  },

  platforms: {
    custom: {
      // Using the custom transforms we defined above
      transforms: [
        "attribute/cti",
        "myTransform",
        "myRegisteredTransform",
        "color/hex",
      ],
      buildPath: buildPath,
      files: [
        {
          destination: "variables.yml",
          // Using the custom format defined above
          format: "myFormat",
        },
      ],
    },
    css: {
      transformGroup: "css",
      buildPath: buildPath,
      files: [
        {
          destination: "variables.css",
          format: "css/variables",
        },
      ],
    },

    scss: {
      // We can still use this transformGroup because we are overriding
      // the underlying transform
      transformGroup: "scss",
      prefix: "asu",
      buildPath: "build/scss/",
      files: [
        {
          destination: "_variables.scss",
          format: "scss/variables",
        },
      ],
      actions: ["copy_assets"],
    },

    // You can still use built-in transformGroups and formats like before
    json: {
      transformGroup: "js",
      buildPath: buildPath,
      files: [
        {
          destination: "properties.json",
          format: "json",
        },
      ],
    },
  },
};
