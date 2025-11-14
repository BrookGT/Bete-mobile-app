module.exports = function (api) {
    api.cache(true);
    return {
        presets: ["babel-preset-expo"],
        // temporarily disable nativewind babel plugin to avoid plugin parsing issues
        // plugins: ["nativewind/babel"],
    };
};
