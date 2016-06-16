{
	"workflows": {
		weChatHome: {//show home page for wechat, should have links for all workflows according roles
			everyone: {
          routes: {
            'weChat/home': {
              view: 'weChatHome',
              controller: 'WeChatHomeController'
            }
          }
			}
		},
    adminWeChat: {
          admin: {
            routes: {
              'wechat/config': {
                view: 'config',
                controller: 'ConfigController'
              },
              'wechat/menu': {
                view: 'menu',
                controller: 'MenuController'
              },
              'wechat/keyWords': {
                view: 'keyWords',
                controller: 'KeyWordsController'
              },
              'wechat/mass': {
                view: 'mass',
                controller: 'MassController'
              },
              'wechat/site': {
                view: 'site',
                controller: 'SiteController'
              }
            }
          }
        }
	}
}
