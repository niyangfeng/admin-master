import React from 'react';
import { queryPermissions } from '@/services/login';
import router from 'umi/router';
import BasicLayout from './BasicLayout';
import PageLoading from '@/components/PageLoading';
import QueryHoc from '@/components/QueryHoc';
import { connect } from 'dva';

const randomString = () => {
  const str = 'qazwsxedcrfvtgbyhnujmikolpQAZWSXEDCRFVTGBYHNUJMIKOLP';
  const arr = [];
  for (let i = 0; i < 3; i += 1) {
    arr.push(str[parseInt((Math.random() * str.length), 10)]);
  }
  return arr.join('');
}

class RouteFilter extends React.Component {
  state = {
    show: false,
    route: {},
    list: [],
  };

  componentDidMount = () => {
    this.getUserNav();
  }

  getUserNav = () => {
    const { dispatch } = this.props;
    const { route } = this.state;
    const routeData = this.handleFlatRoutes();
    const arr = [];

    // 获取菜单信息
    function getConfig(data) {
      for (let i = 0; i < routeData.length; i += 1) {
        if (data.menuRotue === routeData[i].path) {
          routeData[i].name = data.menuName;
          routeData[i].path = data.menuRotue;
          // routeData[i].icon = data.icon;
          return routeData[i];
        }
      }
      return {};
    }

    // 获取子菜单
    function getChilds(data) {
      const catalog = {
        path: randomString(),
        name: data.menuName,
        icon: data.icon,
        routes: [],
      };

      for (let i = 0; i < data.subList.length; i ++) {
        const item = data.subList[i];
        if (item.subList.length !== 0) {
          const childCatalog = getChilds(item);
          catalog.routes.push(childCatalog);
        } else if (item.subList.length === 0) {
          const child = getConfig(item);
          catalog.routes.push(child);
        }
      }

      return catalog;
    }

    const handleMenu = menuData => {
      menuData.smartCrmMenuPos.forEach(item => {
        if (item.subList.length !== 0) {
          // 获目录信息
          arr.push(getChilds(item));
        } else if (item.subList.length === 0) {
          // 获取菜单信息
          arr.push(getConfig(item));
        }
      });

      route.routes = arr;

      this.setState({
        route,
      });
    }
    if (!localStorage.getItem('userInfo')) {
      router.push('/login');
      return;
    }
    
    const userId = JSON.parse(localStorage.getItem('userInfo')).sourceSaleId;
    dispatch({
      type: 'login/getNavPermission',
      payload: userId
    }).then(res=>{
      if (!res) {
        localStorage.clear();
        router.push('/login');
        return;
      }
      handleMenu(res);
      this.setState({
        list: res.smartCrmMenuPos,
      }, this.handleRouter);
    })
    // queryPermissions({ userId }).then(res => {
    //   if (res.code !== 0) return;
    //   handleMenu(res.data);
    //   this.setState({
    //     list: res.data.smartCrmMenuPos,
    //   }, this.handleRouter);
    // });
  }

  handleRouter = () => {
    const configRotues = this.handleFlatRoutes();
    const { pathname } = this.props.location;
    const { list } = this.state;
    const authorityRoute = ['/', '/block'];
    const localRoute = [];
    for (let i = 0; i < list.length; i += 1) {
      authorityRoute.push(list[i].menuRotue)
    }
    for (let j = 0; j < configRotues.length; j += 1) {
      localRoute.push(configRotues[j].path)
    }

    if (authorityRoute.includes(pathname) && localRoute.includes(pathname)) {
      this.setState({
        show: true,
      });
    }
    if (!authorityRoute.includes(pathname) && !localRoute.includes(pathname)) {
      router.push({
        pathname: '/404',
      });
    }
    this.setState({
      show: true,
    });
  }

  handleFlatRoutes = () => {
    const arr = [];
    const routeData = this.props.route.routes;

    function setArr(routes) {
      routes.forEach(route => {
        if (route.routes) {
          setArr(route.routes);
        }
        arr.push(route);
      });
    }

    setArr(routeData);
    return arr;
  }

  render() {
    return (
      <>
      {this.state.show &&
      <BasicLayout {...this.props} route={this.state.route}></BasicLayout>
      }
      {!this.state.show &&
      <PageLoading></PageLoading>
      }
      </>
    );
  }
}

const exportConnect = connect(({ login }) => ({
  login,
}))(QueryHoc(RouteFilter));

export default exportConnect;
// export default RouteFilter;
