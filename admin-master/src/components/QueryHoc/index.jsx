import React from 'react';
import router from 'umi/router';

function QueryHoc(Component, data) {
  return class extends React.Component {
    state = {
      locationSearch: '',
      pagination: {},
      search: {},
      form: {},
    };

    componentRef = React.createRef();

    componentDidMount() {
      this.init();
    }

    componentDidUpdate() {
      if (window.location.search !== this.state.locationSearch) {
        this.init();
      }
    }

    init = () => {
      this.state.locationSearch = window.location.search;
      const { pagination } = this.state;
      const { query } = this.props.location;
      if (query.current) {
        pagination.current = +query.current;
        delete query.current;
      } else {
        pagination.pageIndex = 1;
        pagination.current = 1;
      }
      if (query.pageSize) {
        pagination.pageSize = +query.pageSize;
        delete query.pageSize;
      }
      this.setState(
        {
          pagination,
          search: query,
          form: query,
        },
        () => {
          // 触发路由更新回调
          if (typeof this.componentRef.current.onRouterChange === 'function') {
            this.componentRef.current.onRouterChange();
          }
        },
      );
    };

    /**
     *
      * @param query
     * @param pagination
     * @param path
     * @param isSearch (当条件相同的时候是否一直可以点击刷新)
     */
    updateRouter = (query, pagination, path, isSearch) => {
      const obj = {
        ...query,
        pageSize: pagination.pageSize,
        current: pagination.current,
      };
      if (!path) {
        path = window.location.pathname;
      }
      if (isSearch) {
        this.init()
      }
      router.replace({
        pathname: path,
        query: obj,
      });
    };

    render() {
      return (
        <Component
          ref={this.componentRef}
          onUpdateRouter={this.updateRouter}
          // 分页数据
          pagination={this.state.pagination}
          // 回填数据
          search={this.state.search}
          // 搜索数据
          form={this.state.form}
          {...this.props}
        />
      );
    }
  };
}

export default QueryHoc;
