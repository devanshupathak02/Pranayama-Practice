const fs = require('fs');

require.extensions['.png'] = function (module, filename) {
  module.exports = 1;
};
require.extensions['.jpg'] = function (module, filename) {
  module.exports = 1;
};
require.extensions['.mp3'] = function (module, filename) {
  module.exports = 1;
};
