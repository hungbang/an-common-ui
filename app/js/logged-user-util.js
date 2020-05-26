LoggedUserUtil = (function(){

	function extractEmployer(ssoUser) {
		return ssoUser.toString().split('*').filter(kvPair => kvPair.toString().split('=')[0] === 'COMPANY').toString().split('=')[1];
	}

	function extractPermissions(railincPermissions) {
		let permissions = [];
		railincPermissions.toString().split('^').forEach(permission => {
			let permissionEntry = permission.toString().split('=');
			let role = permissionEntry[0];
			let entities;
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
		
		
		
	