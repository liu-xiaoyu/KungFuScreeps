// Config file for memory related actions
import {
    ROLE_MEDIC,
    ROLE_STALKER,
    ROLE_ZEALOT,
    ROLE_DOMESTIC_DEFENDER,
    ROLE_REMOTE_DEFENDER,
    ROLE_TOWER_TANK
} from "Utils/Imports/internals";

/**
 * config for all military roles
 */
export const ALL_MILITARY_ROLES: RoleConstant[] = [ROLE_STALKER, ROLE_MEDIC, ROLE_ZEALOT, ROLE_DOMESTIC_DEFENDER, ROLE_REMOTE_DEFENDER, ROLE_TOWER_TANK];

/**
 * config for all defensive roles (no requesting flag)
 * considering refactoring so defense drops a flag for a defender rather than special case?
 */
export const ALL_DEFENSIVE_ROLES: RoleConstant[] = [ROLE_DOMESTIC_DEFENDER, ROLE_REMOTE_DEFENDER];
// ------------------------------
