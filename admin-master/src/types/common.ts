import { ColumnProps } from 'antd/es/table';

export interface Column extends ColumnProps<object> {
  title: string;
  className?: string;
  key?: string;
  width?: string | number;
  oldRender?: Function;
}
