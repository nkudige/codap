//  Copyright (c) 2014 by The Concord Consortium, Inc. All rights reserved.
//
//  Licensed under the Apache License, Version 2.0 (the "License");
//  you may not use this file except in compliance with the License.
//  You may obtain a copy of the License at
//
//    http://www.apache.org/licenses/LICENSE-2.0
//
//  Unless required by applicable law or agreed to in writing, software
//  distributed under the License is distributed on an "AS IS" BASIS,
//  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
//  See the License for the specific language governing permissions and
//  limitations under the License.
// ==========================================================================
/**
 * ModelStore is a bare bones storage service. It is intended to
 * replace SC.Store in CODAP. It provides a mechanism for constructing
 * object identifiers and supporting access to CODAP model objects
 * by id.
 *
 * Created by jsandoe on 10/17/14.
 */
DG.ModelStore = SC.Object.extend(
/** @scope DG.ModelStore.prototype */ (function() {
  var idCount = 1,
    store = [];


  return {
    /**
     * register: registers the object in the global store.
     *
     * If there is an id or guid property, and tries to use this as the identifier.
     * If not, gets the next identifier for the type.
     */
    register: function (iRecordType, iObj) {
      var tNewID= this.getIDForNewRecord(iObj);
      iObj.id = tNewID;
      DG.assert(!SC.none(tNewID));
      DG.assert(SC.none(store[tNewID]));
      store[tNewID] = iObj;
      return tNewID;
    },

    /**
     * unregister: removes the object from the global store.
     * @param {number} id
     */
    deregister: function (id) {
      delete store[id];
    },

    /**
     * find: locates an object in the global store.
     * @param {string or object} type: for compatibility with older usage. Optional.
     * @param {number} id
     * @returns {object}
     */
    find: function (type, id) {
      // handle omission of type.
      if (typeof type === 'number' && typeof id === 'undefined') {
        id = type;
      }
      return store[id];
    },

    /**
     * Computes a record id.
     *
     * If there is an id or guid property, and tries to use this as the identifier.
     * Verifies that id's do not correspond with any registered records.
     * If not, gets the next identifier in sequence.
     */
    getIDForNewRecord: function (tObj) {
      var tNewID;
      if (!SC.empty(tObj.guid)) {
        tNewID = tObj.guid;
      } else if (!SC.empty(tObj.id)) {
        tNewID = tObj.id;
      }
      while (SC.empty(tNewID) || store[tNewID]) {
        tNewID = ++idCount;
      }
      return tNewID;
    },
    _getDataSource: function () { return this;},
    /**
     Utility function for converting from a class name (record type string),
     e.g. "DG.Document", to a record type (e.g. DG.Document).

     @param {String} iRecordTypeStr  String representing the name of the record class (e.g. "DG.Document")
     @returns {Class}                Object representing the record class (e.g. DG.Document)
     */
    recordTypeFromString: function (iRecordTypeStr) {
      var dotIndex = iRecordTypeStr.indexOf('.'),
        classNameStartPos = dotIndex >= 0 ? dotIndex + 1 : 0,
        className = iRecordTypeStr.substr(classNameStartPos);
      return DG[className];
    },
    destroyAllRecordsOfType: function (type, exceptionKeys) {
      var removedKeys = [];
      if (SC.empty(exceptionKeys)) {
        exceptionKeys = [];
      }
      store.forEach(function (obj) {
        var id = obj.id;
        if (obj.get('recordType') === type && !exceptionKeys.contains(id)) {
          removedKeys.push(id);
          obj.destroy();
          if (store[id]) {
            this.deregister(id);
          }
        }
      });
      return removedKeys;
    },
    /*
     * If x is an ID look it up. If it is an object, return it as is.
     */
    resolve: function(x) {
      var obj;
      if (typeof x === 'object') {
        return x;
      }
      if (typeof x === 'number') {
        obj = this.find(null, x);
        if (SC.empty(obj)) {
          DG.logError('Could not resolve reference: ' + x);
          return x;
        }
        return obj;
      }
    },
    commitRecords: function () { /* No-op */},
    flush: function () { /* No-op */}
  };
}()));
