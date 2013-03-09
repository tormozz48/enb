var fs = require('fs'),
    path = require('path');

function Cache(storage, prefix) {
    this._storage = storage;
    this._prefix = prefix;
}

Cache.prototype = {
    get: function(key) {
        return this._storage.get(this._prefix, key);
    },

    set: function(key, value) {
        this._storage.set(this._prefix, key, value);
    },

    invalidate: function(key) {
        this._storage.invalidate(this._prefix, key);
    },

    drop: function() {
        this._storage.dropPrefix(this._prefix);
    },

    subCache: function(name) {
        return new Cache(this._storage, this._prefix + '/' + name);
    },

    _getFileInfo: function (fullname) {
        var filename = path.basename(fullname),
            mtime = null,
            exists = false;

        if (fs.existsSync(fullname)) {
            exists = true;
            mtime = +fs.statSync(fullname).mtime;
        }

        return {
            name: filename,
            fullname: fullname,
            suffix: filename.split('.').slice(1).join('.'),
            mtime: mtime
        };
    },

    needRebuildFileList: function(cacheKey, files) {
        var cachedFiles = this.get(cacheKey);
        if (cachedFiles && Array.isArray(cachedFiles)) {
            var cachedFileIndex = {};
            for (var i = 0, l = cachedFiles.length; i < l; i++) {
                cachedFileIndex[cachedFiles[i].fullname] = cachedFiles[i];
            }
            for (i = 0, l = files.length; i < l; i++) {
                var file = files[i],
                    cachedFile = cachedFileIndex[file.fullname];
                if (!cachedFile || cachedFile.mtime !== file.mtime) {
                    return true;
                }
            }
            return false;
        } else {
            return true;
        }
    },

    needRebuildFile: function(cacheKey, filename) {
        var cachedFile = this.get(cacheKey);
        if (cachedFile) {
            return cachedFile.mtime !== this._getFileInfo(filename).mtime;
        } else {
            return true;
        }
    },

    cacheFileInfo: function(cacheKey, filename) {
        this.set(cacheKey, this._getFileInfo(filename));
    },

    cacheFileList: function(cacheKey, filelist) {
        this.set(cacheKey, filelist);
    }
};

module.exports = Cache;