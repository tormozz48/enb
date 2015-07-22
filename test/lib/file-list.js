var path = require('path');
var mockFs = require('mock-fs');
var FileList = require('../../lib/file-list');

require('chai')
    .use(require('chai-as-promised'))
    .should();

describe('lib', function () {
    describe('file-list', function () {
        var fileList;
        var files;

        beforeEach(function () {
            files = [
                { fullname: '/foo/bar/file1.txt', name: 'file1', suffix: 'txt', mtime: 1437573848385 },
                { fullname: '/foo/bar/file2.json', name: 'file2', suffix: 'json', mtime: 1437573848385 }
            ];
        });

        describe('constructor', function () {
            beforeEach(function () {
                fileList = new FileList();
            });

            it('should be successfully initialized with empty items array', function () {
                fileList.items.should.be.instanceOf(Array).and.be.empty;
            });

            it('should be successfully initialized with empty slices array', function () {
                fileList.slices.should.be.instanceOf(Array).and.be.empty;
            });

            it('should be successfully initialized with empty bySuffix object', function () {
                fileList.bySuffix.should.be.instanceOf(Object);
                Object.keys(fileList.bySuffix).should.be.empty;
            });
        });

        describe('addFiles', function () {
            beforeEach(function () {
                fileList = new FileList();
                fileList.addFiles(files);
            });

            it('should add given files array to slices array', function () {
                fileList.slices.should.have.length(1);
                fileList.slices[0].should.be.deep.equal(files);
            });

            it('should add each file from files to items array', function () {
                fileList.items.should.have.length(2);
                fileList.items.should.be.deep.equal(files);
            });

            it('should separate files by suffix and fill bySuffix model', function () {
                fileList.bySuffix.txt.should.be.instanceOf(Array).and.have.length(1);
                fileList.bySuffix.txt[0].should.be.deep.equal(files[0]);

                fileList.bySuffix.json.should.be.instanceOf(Array).and.have.length(1);
                fileList.bySuffix.json[0].should.be.deep.equal(files[1]);
            });
        });

        describe('getBySuffix', function () {
            beforeEach(function () {
                fileList = new FileList();
                fileList.addFiles(files);
            });

            describe('suffix argument is array', function () {
                it('should return valid result by given suffix (argument is array with single item)', function () {
                    fileList.getBySuffix(['txt']).should.be.instanceOf(Array).and.have.length(1);
                    fileList.getBySuffix(['txt'])[0].should.be.deep.equal(files[0]);
                });

                it('should return valid result by given suffixes', function () {
                    var advancedFiles = [
                        { fullname: '/foo/bar/file3.txt', name: 'file3', suffix: 'txt', mtime: 1437573848385 },
                        { fullname: '/foo/bar/file4.html', name: 'file4', suffix: 'html', mtime: 1437573848385 }
                    ];
                    fileList.addFiles(advancedFiles);

                    fileList.getBySuffix(['txt', 'json']).should.be.instanceOf(Array).and.have.length(3);
                    fileList.getBySuffix(['txt', 'json']).should.be.deep.equal(files.concat(advancedFiles[0]));
                });
            });

            describe('suffix argument is string', function () {
                it('should return valid result by given suffix', function () {
                    fileList.getBySuffix('txt').should.be.instanceOf(Array).and.have.length(1);
                    fileList.getBySuffix('txt')[0].should.be.deep.equal(files[0]);
                });

                it('should return empty result if files were not found by given suffix', function () {
                    fileList.getBySuffix('html').should.be.instanceOf(Array).and.be.empty;
                });
            });
        });

        describe('getByName', function () {
            beforeEach(function () {
                fileList = new FileList();
                fileList.addFiles(files);
            });

            it('should return valid file info object by given file name', function () {
                fileList.getByName('file1').should.be.instanceOf(Array).and.have.length(1);
                fileList.getByName('file1')[0].should.be.deep.equal(files[0]);
            });
        });

        describe('getFileInfo', function () {
            var filePath;

            beforeEach(function () {
                fileList = new FileList();
                filePath = path.resolve('./foo/file1.txt');
                mockFs({
                    foo: {
                        'file1.txt': mockFs.file({
                            content: 'Hello World',
                            ctime: new Date(1),
                            mtime: new Date(1)
                        })
                    }
                });
            });

            afterEach(function () {
                mockFs.restore();
            });

            it('should return valid file info name', function () {
                fileList.getFileInfo(filePath).name.should.equal('file1.txt');
            });

            it('should return valid file info fullname', function () {
                fileList.getFileInfo(filePath).fullname.should.equal(filePath);
            });

            it('should return valid file info suffix', function () {
                fileList.getFileInfo(filePath).suffix.should.equal('txt');
            });

            it('should return valid file info mtime', function () {
                fileList.getFileInfo(filePath).mtime.should.equal(1);
            });

            it('should return valid isDirectory flag', function () {
                fileList.getFileInfo(filePath).isDirectory.should.equal(false);
                fileList.getFileInfo(path.resolve('./foo')).isDirectory.should.equal(true);
            });
        });
    });
});
