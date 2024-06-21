module.exports = {
    process(src) {
      return src.replace(/import\.meta\.env/g, 'process.env');
    },
  };
  