{
	services: {
		AuthService: {
			createUser:{
				/**
				 * should add below operations in this function
				 * 1. SpaceService.createSpace({name:userSpace_$userId$,type: userSpace.normal,alias: 'userName's space', ....})
				 * 2. add appEngine to userSpace and add userApp to userSpace
				 * 3. RoleService.initSpaceRoles(spaceId)
				 * 4. RoleService.userJoin(newUserId, newSpaceAdminRole) //RoleService.getAdmin(spaceId) to get admin role of space
				 * */
			}
		},
		RoleService: {
			initSpaceRoles: {
				//function(spaceId)add admin/customer/member role for space, call when create new space
			},
			addChildRole: { //usually need get parent role first
				url: /api/roles/:id/addChild
				method: post
			},
			deleteRole: {
				url: /api/roles/:id
				method: delete
			},
			getAdminRole: {
				url: /api/roles/admin/:spaceId
				method: get
			},
			getMemberRole: {
				url: /api/roles/member/:spaceId
				method: get
			},
			getCustomerRole: {
				url: /api/roles/customer/:spaceId
				method: get
			},
			getRoleByName:{
				function: function(name),
				url: /api/roles/bn/:name
				method: get
			} //name format should be 'admin.finance' or 'member.saleman',
			getUserRoles: {
				url: /api/roles/user/:spaceId/:userId //if miss userId, then get all roles for current user
			}
		},
		SpaceService: {
			//after create space, should add default roles and add creator into admin role
			//please see role space
			createSpace: {//typeId should choose during create space
				url: /api/spaces,
				method: post,
				data: {
					name: '',
					typeId: '',
					alias: ''
				},
				result: {#newSpaceObj#}
			},
			//joinSpace is just add user into customer role
			//if not provide userId, use current user
			userJoin: {
				url: /api/spaces/userJoin,
				method: post,
				data: {
					userId, spaceId
				}
			},
			userExit: {
				url: /api/spaces/userExit,
				method: post,
				data: {
					userId, spaceId
				}
			},
			//get all my spaces
			userSpaces: {
				url: /api/spaces/user/:userId,
				method: get
			},
			spaceById: {
				url: /api/spaces/:id, 
				method: get
			},
			spaceByName: {
				url: /api/spaces/bn/:name
			},
			current: function(),
			setCurrent: function(spaceId)
		},
		AppService: {
			//this function can only call by system and not open for any user
			createApp: {
				url: '/api/apps/create',
				method: post,
				data: {appConfig},
				result: {newApp}
			},
			joinSpace: {
				url: /api/apps/joinSpace
			},
			exitSpace: {
				url: /api/apps/exitSpace,
				method: 'get',
				query: {spaceId,appId},
				result: true or false
			},
			spaceApps: {
				url: /api/apps/space/:id,
				method:'get',
				result:[apps under space]
			},
			userApps: {
				url: /api/apps/user/:spaceId/:userId,
				method: 'get'
			},
			appById: {
				url: /api/apps/:id,
			},
			appByName: {
				url: /api/apps/bn/:name
			},
			current: function(),
			setCurrent: function(appId)
		},
		NutService: {
			addAppNut: {
				//nut list can get for billynApp constant
				url: /api/nuts/joinApp,
				method: post
			},
			deleteNut: {
				url: /api/nuts/:id,
				method: delete
			},
			updateNut:{
				url: /api/nuts/:id,
				method: put
			},
			getAppNut: {
				url: /api/nuts/:id,
				method: get
			},
			listAppNut: {
				url: /api/nuts/app/:appId,
				method: get
			},
			joinSpace: { 
				//add appNut into some space
				url: /api/nuts/:id/joinSpace,
				method: post
			},
			exitSpace: {
				url: /api/nuts/:joinSpaceId/exitSpace,
				method: delete
			},	
			listSpaceNut: {
				//if provide appId, get nuts also under appId
				//otherwise get all nuts under spaceId
				url: /api/nuts/space/:spaceId/:appId
				method: get
			},
			addNutRole: {
				url: /api/nuts/:id/addRole,
				method: post,
				data: {
					home: homeView //match to role
				}
			}
			deleteNutRole: {
				url: /api/nuts/:id/:roleId,
				method: delete
			},
			getUserNuts: {
				//if not provide userId, get nuts for current user
				//if not provide appId, get all nuts under space
				url: /api/nuts/user/:spaceId/:appId/:userId,
				method: get
			},
			current: function(),
			setCurrent: function(nutId)		
		}
	}
}