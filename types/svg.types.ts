import { EntityStatus } from './hierarchy.types';

export interface SVGEntityConfig {
  id: string;
  label: string;
  status: EntityStatus;
  onClick: () => void;
}
