// Config file for memory related actions
import { ROLE_MEDIC, ROLE_STALKER, ROLE_ZEALOT, ROLE_DOMESTIC_DEFENDER, ROLE_REMOTE_DEFENDER, ROLE_TOWER_TANK, TOWER_DRAINER_MAN } from "Utils/Imports/internals";

/**
 * config for all military roles
 */
export const ALL_MILITARY_ROLES: RoleConstant[] = [ROLE_STALKER, ROLE_MEDIC, ROLE_ZEALOT, ROLE_DOMESTIC_DEFENDER, ROLE_REMOTE_DEFENDER, ROLE_TOWER_TANK];

/**
 * config for all defensive roles (no requesting flag)
 * considering refactoring so defense drops a flag for a defender rather than special case?
 */
export const ALL_DEFENSIVE_ROLES: RoleConstant[] = [ROLE_DOMESTIC_DEFENDER, ROLE_REMOTE_DEFENDER];

export const SOLO_ZEALOT_ARRAY: RoleConstant[] = [ROLE_ZEALOT];
export const SOLO_STALKER_ARRAY: RoleConstant[] = [ROLE_STALKER];
export const STANDARD_SQUAD_ARRAY: RoleConstant[] = [ROLE_ZEALOT, ROLE_MEDIC];
export const TOWER_DRAINER_ARRAY: RoleConstant[] = [ROLE_TOWER_TANK, ROLE_MEDIC];
// ------------------------------
