"use strict";

function ScriptService(scriptRepository, path) {
    this._scriptRepository = scriptRepository;
    this._path = path;
}

ScriptService.prototype.constructor = ScriptService;

ScriptService.prototype.get = function get(path) {
    return this._scriptRepository.get(path);
};

ScriptService.prototype.getList = function getList(currentPath) {

    var sqlFiles = [];

    var files = this._scriptRepository.getList(currentPath);

    // Looking for all files in the path directory and all sub directories recursively
    for (var i in files) {
        if (!files.hasOwnProperty(i)) {
            continue;
        }

        var fullPath = currentPath + '/' + files[i];

        var stats = this._scriptRepository.getStat(fullPath);

        if (stats.isDirectory()) {

            sqlFiles = sqlFiles.concat(this.getList(fullPath));

        } else if (stats.isFile()) {

            // Files must have an extension with ".sql" (case insensitive)
            // with and "x-y.sql" format that x and y must be valid numbers
            if (this._path.extname(fullPath).toUpperCase() == ".SQL") {

                var fileName = this._path.basename(fullPath, '.sql');

                if (fileName.indexOf("-") == -1) {
                    continue;
                }

                var baseVersion = fileName.substr(0, fileName.indexOf("-"));
                var targetVersion = fileName.substr(fileName.indexOf("-") + 1);

                if (!baseVersion || !targetVersion || isNaN(baseVersion) || isNaN(targetVersion)) {

                    continue;
                }

                sqlFiles.push({baseVersion: baseVersion, targetVersion: targetVersion, path: fullPath});
            }
        }
    }

    return sqlFiles;
};

ScriptService.prototype.execute = function execute(query, succeedCallback, failedCallback) {

    this._scriptRepository.execute(query, succeedCallback, failedCallback);
};

module.exports = ScriptService;