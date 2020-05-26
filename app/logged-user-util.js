LoggedUserUtil = (function(){

	function extractEmployer(ssoUser) {
		return ssoUser.toString().split('*').filter(function (value) {
			if(value.toString().split('=')[0] === 'COMPANY'){
				return value;
			}
		}).toString().split('=')[1];
	}

	function extractPermissions(railincPermissions) {
		var permissions = [];
		railincPermissions.toString().split('^').forEach(function (permission) {
			var permissionEntry = permission.toString().split('=');
			var role = permissionEntry[0];
			var entities;
			if(permissionEntry[1].indexOf(',') !== -1) {
				entities = permissionEntry[1].toString().split(',');
			}
			else {
				entities = permissionEntry[1];
			}
			permissions[role] = entities;
		});

		return permissions;
	}

	return {
		extractEmployer:extractEmployer,
		extractPermissions:extractPermissions
	};
			
})();
		
		
		
