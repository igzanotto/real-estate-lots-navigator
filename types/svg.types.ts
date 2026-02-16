import { EntityStatus } from './hierarchy.types';
import { NavigationLevel } from './navigation.types';

export interface SVGEntityConfig {
  id: string;
  label: string;
  status: EntityStatus;
  onClick: () => void;
}

export interface InteractiveSVGProps {
  svgUrl: string;
  entities: SVGEntityConfig[];
  level: NavigationLevel;
}
