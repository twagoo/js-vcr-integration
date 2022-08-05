const path = require('path');

module.exports = {
    helperDirs: [path.join(__dirname, 'src/templates/helpers')],
    precompileOptions: {
        knownHelpersOnly: false,
    }
}
