'use strict';

describe('assetHealthApp.version module', function() {
  beforeEach(module('assetHealthApp.version'));

  describe('version service', function() {
    it('should return current version', inject(function(version) {
      expect(version).toEqual('0.1');
    }));
  });
});
