export default [
  {
    path: '/login',
    routes: [
      {
        name: 'login',
        path: '/login',
        component: './user/login',
      },
    ],
  },
  {
    path: '/',
    // component: '../layouts/RouteFilter',
    component: '../layouts/BasicLayout',
    routes: [
          {
          path: '/',
            redirect: '/block',
          },
          {
            path: '/block',
            component: './Block',
          },         
          {
            path: '/403',
            name: '403',
            hideInMenu: true,
            component: './403',
          },
          {
            component: './404',
          },
        ],
      },
      {
        component: './404',
      },
    ];
