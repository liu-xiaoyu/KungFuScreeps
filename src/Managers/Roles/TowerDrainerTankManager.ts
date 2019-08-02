import MiliApi from "Api/CreepMili.Api";
import {
    DEFAULT_MOVE_OPTS,
    ROLE_TOWER_TANK,
} from "utils/constants";

// Manager for the miner creep role
export default class TowerDrainerTankCreepManager implements ICreepRoleManager {

    public name: RoleConstant = ROLE_TOWER_TANK;

    constructor() {
        const self = this;
        self.runCreepRole = self.runCreepRole.bind(this);
    }

    /**
     * run the TowerDrainerTank creep
     * @param creep the creep we are running
     */
    public runCreepRole(creep: Creep): void {

        const creepOptions: CreepOptionsMili = creep.memory.options as CreepOptionsMili;
        const CREEP_RANGE: number = 1;

    }
}
