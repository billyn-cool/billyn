//workflows for app
{
	"workflows": {
		appHome: {//show home page for space, should have links for all workflows according to roles
			everyone: {
				routes: {
					'app/home': {
						view: 'appHome.$role$',//home page may change according to role
						controller: 'AppHomeController'
					}
				}
			}
		},
		adminAppNut: {
			admin: {
				routers: {
					'app/admin/listAppNut': {
						view: 'listAppNut',
						controller: 'ListAppNutController'
					},
					'app/admin/addAppNut': {
						view: 'addAppNut',
						controller: 'AddAppNutController'
					},
					'app/admin/deleteAppNut': {
						view: 'deleteAppNut',
						controller: 'DeleteAppNutController'
					},
					'app/nut/admin/listRole': {
						//add or modify role for app nut
						view: 'listAppNutRole',
						controller: 'ListAppNutRole'
					},
					'app/nut/admin/addRole': {
						//add or modify role for app nut
						view: 'addAppNutRole',
						controller: 'AddAppNutRole'
					},
					'app/nut/admin/deleteRole': {
						//add or modify role for app nut
						view: 'deleteAppNutRole',
						controller: 'DeleteAppNutRole'
					}
				}
			}
		}
	}
}