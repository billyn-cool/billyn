{
	"workflows": {
		spaceHome: {//show home page for space, should have links for all workflows according roles
			everyone: {
				routes: {
					'space/home': {
						view: 'spaceHome',
						controller: 'SpaceHomeController'
					}
				}
			}
		},
		adminJoinSpace|adminJoinRole: {
			admin: {
				routers: {
					'space/admin/join': {
						views: {
							'adminJoinRole': {
								controller: 'AdminJoinRoleController'
							}
						}
					}
				}
			}
		},
		manageJoinRole: {
			manager: {
				routes: {
					'space/manage/joinRole': {
						view: 'manageJoinRole',
						controller: 'ManageJoinRoleController'
					}
				}
			},
		},
		adminSpaceRole: {
			admin: {
				routes: {
					'space/roles': {
						view: 'ListSpaceRole',
						controller: "ListSpaceRoleController"
					},
					'space/addRole': {//create or modify space role
						view: 'addSpaceRole',
						controller: 'AddSpaceRoleController'
					},
					'space/deleteRole': {
						view: 'deleteSpaceRole',
						controller: 'DeleteSpaceRole'
					}
				}
			}
		},
		appStore: {//manage app under app
			admin:{
				routes: {
					'space/appstore/list': {
						view: 'listAppstore',
						controller: 'ListAppStoreController'
					},
					'space/appstore/add': {
						view: 'addSpaceApp',
						controller: 'AddSpaceAppController'
					},
					'space/appstore/delete': {
						view: 'deleteSpaceApp',
						controller: 'DeleteSpaceAppController'
					}
				}
			}
		}
	}
}