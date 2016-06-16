workflows: {
	userHome: { //show home after login
		everyone: {
			routes: {
				'user/home': { //this page will list all workflow for user
					//will also list all spaces for user
					view: 'userHome',
					controller: 'UserHomeController'
				}
			}
		}
	},
	userSpaces: { //show all user spaces
		everyone: {
			routes: {
				'user/mySpaces': {
					view: 'listUserSpace',
					controller: 'ListUserSpaceController'
				}
			}
		}
	},
	createSpace: {
		nodes: {
			admin: {
				routes: {
					'user/createSpace': {
						views: {
							createSpace: {
								controller: 'CreateSpaceController'
							}
						}
					}
				},
				services: {

				},
			}
		}
	},
	joinSpace: {
		nodes: {
			everyone: {
				routes: {
					'user/findSpace': {
						views: {
							'findSpace': {
								controller: 'FindSpaceController'
							},
						}
					},
					'user/joinSpace': {
						views: {
							'joinSpace': {
								controller: 'JoinSpaceController'
							}
						}
					}
				}
			},
			/** [[refer to space/design.workflow.JSON::adminJoinSpace for routes under admin]] **/
		}
	},
	joinRole | exitRole: {
		nodes: {
			member: {
				routes: {
					'user/space/roles': {
						view: 'listUserSpaceRoles',
						controller: 'ListUserSpaceRoles'
					},
					'user/joinRole': {
						view: 'joinRole',
						controller: 'JoinRoleController'
					},
					'user/exitRole': {
						view: 'exitRole',
						controller: 'ExitRoleController'
					},
				}
			},
			/** [[refer to space/design.workflow.JSON::manageJoinRole for node under manager]] **/
			/** [[refer to space/design.workflow.JSON::adminJoinRole for node under admin]] **/
		}
	}
	userMessage: {
		nodes: {
			sender: {
				routes: { // TODO: 
					'user/messages': { //list send out messages
						params: {
							type: 'sendOut'
						},
						views: {
							'$type$.listMessage': { //listMessage may change according to different type, type is a nested name
								controller: '$type$.ListMessageController'
							}
						}
					},
					'user/message/create': {
						view: '$type$.createMessage', //this view may change according to type
						controller: '$type$,CreateMessageController'
					}
				}
			},
			receiver: {
				'user/messages': { //list messages
					views: {
						'$type$.listMessage': { //listMessage may change according to different type, type is a nested name
							controller: '$type$.ListMessageController'
						}
					}
				},
				'user/messages/:id': { //show message
					views: {
						'$type$.showMessage': { //view may change according to message type
							controller: '$type$.showMessageController'
						}
					}
				}
			}
		}
	}
}
