const fs = require('fs');
const path = require('path');
const _ = require('underscore');
const counter = require('./counter');
var Promise = require('bluebird');
var readFilePromise = Promise.promisify(fs.readFile);
var fsAll = Promise.promisifyAll(fs);

//create seperate files for each item where the key is the id(counter)?-
//(err, count) => { if (err) { console.log('error'); } else { return count; } }

// Public API - Fix these CRUD functions ///////////////////////////////////////

exports.create = (text, callback) => {
  counter.getNextUniqueId((err, id) => {
    var filePath = path.join(exports.dataDir, `${id}.txt`);
    if (err) {
      console.log('error');
    } else {
      fs.writeFile(filePath, text, (err) => {
        if (err) {
          throw ('We have an error trying to make file');
        } else {
          callback(null, { id, text });
        }
      });
    }
  });
};

exports.readAll = (callback) => {

  fs.readdir(exports.dataDir, (err, files) => {
    if (err) {
      throw ('error');
    }
    var data = _.map(files, (file) => {
      var id = path.basename(file, '.txt');
      var filePath = path.join(exports.dataDir, file);
      return readFilePromise(filePath).then(fileData => {
        return {
          id: id,
          text: fileData.toString()
        };
      });
    });
    Promise.all(data)
      .then(items => callback(null, items), err => callback(err));
  });
};

/*
Promise.all([...toDos]).then((toDos) => {return toDos})
*/

exports.readOne = (id, callback) => {
  var filePath = path.join(exports.dataDir, `${id}.txt`);
  fs.readFile(filePath, 'utf8', (err, text) => {
    if (err) {
      callback(new Error(`No item with id: ${id}`));
    } else {
      var object = {id: id, text: text};
      callback(null, object);
    }
  });
};

exports.update = (id, text, callback) => {
  var filePath = path.join(exports.dataDir, `${id}.txt`);
  fs.readFile(filePath, 'utf8', (err) => {
    if (err) {
      callback(new Error(`No item with id: ${id}`));
    } else {
      fs.writeFile(filePath, text, (err) => {
        if (err) {
          throw (`We have an error trying to update file: ${id}`);
        } else {
          callback(null, { id, text });
        }
      });
    }
  });
};

exports.delete = (id, callback) => {
  var filePath = path.join(exports.dataDir, `${id}.txt`);
  fs.unlink(filePath, (err) => {
    if (err) {
      callback(new Error(`No item with id: ${id}`));
    } else {
      callback();
    }
  });
};

// Config+Initialization code -- DO NOT MODIFY /////////////////////////////////

exports.dataDir = path.join(__dirname, 'data');

exports.initialize = () => {
  if (!fs.existsSync(exports.dataDir)) {
    fs.mkdirSync(exports.dataDir);
  }
};

//Promise.all(fileNameArray)
//.then(items => callback(null, items), err => callback(err));

/*
exports.readAll = (callback) => {
  fs.readdir(exports.dataDir, (err, files) => {
    var result = [];
    if (err) {
      throw ('We have an error trying to read all files');
    } else {
      var info = _.map(files, (x) => {
        //find id and create a filepath
        var fileName = path.basename(x);
        var id = Number(fileName.slice(0, fileName.length - 4));
        var filepath = path.join(exports.dataDir, `${id}.txt`);
        readFilePromise(filepath)
          .then(text => {
            result.push({id: id, text: text});
          });
      });
      console.log(result);
      if (err) {
        callback(err);
      } else {
        callback(info);
      }
    }
  });
};
exports.readAll = (callback) => {
  fs.readdir(exports.dataDir, (err, files) => {
    if (err) {
      throw ('We have an error trying to read all files');
    }

    var info = _.map(files, (x) => {
      //find id and create a filepath
      var fileName = path.basename(x);
      var id = fileName.slice(0, fileName.length - 4);
      var filepath = path.join(exports.dataDir, fileName);
      return readFilePromise(filepath).then(text => {
        return {id, text: text.toString()};
      });
    });
    Promise.all(info)
      .then(items => callback(null, items), err => callback(err));
  });
};
*/


// var data = [];

// fsAll.readdirAsync(exports.dataDir)
//   .then((fileNames) => {
//     fileNames.forEach((file) => {
//       var filePath = path.join(exports.dataDir, file);
//       fsAll.readfileAsync(filePath, 'utf-8')
//         .then((text) => {
//           var toDo = {id: file, text: text};
//           data.push(toDo);
//         });
//     });
//   });
