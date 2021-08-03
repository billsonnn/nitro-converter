import { IFigureDataPart } from './IFigureDataPart';

export interface IFigureDataSet
{
  id?: number;
  gender?: string;
  club?: boolean;
  colorable?: boolean;
  selectable?: boolean;
  preselectable?: boolean;
  parts?: IFigureDataPart[];
}
